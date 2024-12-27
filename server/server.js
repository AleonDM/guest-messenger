require('dotenv').config({ path: '../.env' });
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { User, Chat, Message, initDatabase } = require('./models');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.fieldname === 'image') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Разрешены только изображения!'), false);
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.post('/api/chats/:chatId/messages', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { text } = req.body;
    const files = req.files || {};

    console.log('Получены файлы:', files);
    console.log('Тело запроса:', req.body);

    // Проверяем существование чата
    const chat = await Chat.findByPk(chatId, {
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

    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    // Создаем сообщение
    const messageData = {
      text: text || null,
      ChatId: chatId,
      senderId: req.user.id,
      timestamp: new Date()
    };

    // Обрабатываем изображение
    if (files.image && files.image[0]) {
      const file = files.image[0];
      console.log('Обработка изображения:', file);
      messageData.image = `/api/uploads/${file.filename}`;
      console.log('URL изображения:', messageData.image);
    }

    // Обрабатываем файл
    if (files.file && files.file[0]) {
      const file = files.file[0];
      console.log('Обработка файла:', file);
      messageData.file = {
        url: `/api/uploads/${file.filename}`,
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      };
      console.log('Данные файла:', messageData.file);
    }

    // Сохраняем сообщение
    const newMessage = await Message.create(messageData);
    console.log('Создано сообщение:', newMessage.toJSON());

    // Получаем полное сообщение с данными отправителя
    const fullMessage = await Message.findByPk(newMessage.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['nickname', 'avatar']
      }]
    });

    // Обновляем чат в памяти
    chat.Messages = [...chat.Messages, fullMessage];

    // Форматируем ответ
    const response = {
      id: chat.id,
      name: chat.name,
      avatar: chat.avatar,
      messages: chat.Messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        image: msg.image,
        file: msg.file,
        timestamp: msg.timestamp,
        nickname: msg.sender.nickname,
        avatar: msg.sender.avatar
      })),
      createdBy: chat.creator.id
    };

    console.log('Отправляем ответ:', response);
    res.json(response);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
});

app.post('/api/logout', auth, async (req, res) => {
  try {
    res.send({ message: 'Успешный выход из системы' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Инициализация базы данных и запуск сервера
initDatabase().then(() => {
  const port = process.env.PORT || 3005;
  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
});