const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const Chat = sequelize.define('Chat', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file: {
    type: DataTypes.TEXT, 
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('file');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('file', value ? JSON.stringify(value) : null);
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

User.hasMany(Chat, { as: 'createdChats', foreignKey: 'createdBy' });
Chat.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

Chat.hasMany(Message);
Message.belongsTo(Chat);

User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Синхронизация с базой данных
const initDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Chat,
  Message,
  initDatabase
};