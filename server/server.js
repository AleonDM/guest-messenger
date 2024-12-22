const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { User, Chat, Message, initDatabase } = require('./models');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Middleware для проверки авторизации
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Пожалуйста, авторизуйтесь' });
  }
};

// Маршруты
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname, avatar } = req.body;
    
    // Проверка существования пользователя
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).send({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 8);

    // Создание пользователя
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname,
      avatar
    });

    // Создание токена
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).send({ 
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }, 
      token 
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Поиск пользователя
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).send({ error: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Неверные учетные данные' });
    }

    // Создание токена
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.send({ 
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }, 
      token 
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/user/current', auth, async (req, res) => {
  try {
    res.send({ 
      user: {
        id: req.user.id,
        username: req.user.username,
        nickname: req.user.nickname,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/chats', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const chat = await Chat.create({
      name,
      avatar,
      createdBy: req.user.id
    });

    const fullChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: Message,
          include: [{
            model: User,
            as: 'sender',
            attributes: ['nickname', 'avatar']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['nickname', 'avatar']
        }
      ]
    });

    res.status(201).send({
      id: fullChat.id,
      name: fullChat.name,
      avatar: fullChat.avatar,
      messages: fullChat.Messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        image: msg.image,
        timestamp: msg.timestamp,
        nickname: msg.sender.nickname,
        avatar: msg.sender.avatar
      })),
      createdBy: fullChat.creator.id
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/chats', auth, async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: Message,
          include: [{
            model: User,
            as: 'sender',
            attributes: ['nickname', 'avatar']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['nickname', 'avatar']
        }
      ]
    });

    const formattedChats = chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      avatar: chat.avatar,
      messages: chat.Messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        image: msg.image,
        timestamp: msg.timestamp,
        nickname: msg.sender.nickname,
        avatar: msg.sender.avatar
      })),
      createdBy: chat.creator.id
    }));

    res.send(formattedChats);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/api/chats/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findByPk(req.params.chatId);
    if (!chat) {
      return res.status(404).send({ error: 'Чат не найден' });
    }

    const { text, image } = req.body;
    const message = await Message.create({
      text,
      image,
      ChatId: chat.id,
      senderId: req.user.id,
      timestamp: new Date()
    });

    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['nickname', 'avatar']
      }]
    });

    const updatedChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: Message,
          include: [{
            model: User,
            as: 'sender',
            attributes: ['nickname', 'avatar']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['nickname', 'avatar']
        }
      ]
    });

    res.status(201).send({
      id: updatedChat.id,
      name: updatedChat.name,
      avatar: updatedChat.avatar,
      messages: updatedChat.Messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        image: msg.image,
        timestamp: msg.timestamp,
        nickname: msg.sender.nickname,
        avatar: msg.sender.avatar
      })),
      createdBy: updatedChat.creator.id
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Инициализация базы данных и запуск сервера
initDatabase().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
}); 