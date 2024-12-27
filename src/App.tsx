import React, { useState, useEffect, useRef } from 'react';
import { api, User, Chat as ChatType, Message as MessageType } from './api.ts';
import './App.css';

interface UserProfile {
  nickname: string;
  avatar?: string;
}

interface IChat {
  id: number;
  name: string;
  avatar?: string;
  messages: Message[];
  createdBy: number;
}

interface Message {
  id: string;
  text: string;
  image?: string;
  file?: {
    url: string;
    name: string;
    size: number;
    type: string;
  };
  nickname: string;
  avatar?: string;
  timestamp: string;
}

// SVG иконки
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
  </svg>
);

const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2h-2v6h-6v-2h-2v2h-6V13h6v2z" fill="currentColor"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" fill="currentColor"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" fill="currentColor"/>
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
  </svg>
);

const AttachmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" fill="currentColor"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
  </svg>
);

// Функция для формирования полного URL изображения
const getFullImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:')) return imageUrl;
  if (imageUrl.startsWith('http')) return imageUrl;
  
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
  const path = imageUrl.replace(/^\/api/, ''); // Убираем /api из начала пути
  return `${baseUrl}${path}`;
};

const Message = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${isOwn ? 'message-own' : ''}`}>
      {!isOwn && (
        <div className="avatar-message">
          {message.avatar ? (
            <img src={message.avatar} alt={message.nickname} />
          ) : (
            <div className="avatar-placeholder-message">
              {message.nickname[0].toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div className="message-content">
        <div className="message-header">
          <span className="message-nickname">{message.nickname}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
        <div className="message-text">{message.text}</div>
        {message.image && (
          <div className="message-image-container">
            <img 
              src={getFullImageUrl(message.image)} 
              alt="Изображение" 
              className="message-image" 
            />
          </div>
        )}
        {message.file && (
          <a 
            href={getFullImageUrl(message.file.url)} 
            download 
            className="message-file"
          >
            <FileIcon />
            <div className="file-info">
              <span className="file-name">{message.file.name}</span>
              <span className="file-size">{formatFileSize(message.file.size)}</span>
            </div>
          </a>
        )}
      </div>
    </div>
  );
};

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [chats, setChats] = useState<IChat[]>([]);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatAvatar, setNewChatAvatar] = useState('');
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const newChatAvatarInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showChatSettings, setShowChatSettings] = useState(false);
  const [editingChatName, setEditingChatName] = useState('');
  const [editingChatAvatar, setEditingChatAvatar] = useState<File | null>(null);

  const handleLogout = () => {
    // Очищаем состояние приложения
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setNickname('');
    setAvatar('');
    setChats([]);
    setCurrentChat(null);
    setShowSettings(false);
    setShowNewChat(false);
    setIsAttachMenuOpen(false);
    
    // Вызываем метод выхода из API
    api.logout();
    
    // Очищаем локальное хранилище
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  const loadUserData = async () => {
    try {
      const response = await api.getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const loadChats = async () => {
    try {
      const chats = await api.getChats();
      setChats(chats);
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        await api.register({
          username,
          password,
          nickname,
          avatar
        });
      } else {
        await api.login({
          username,
          password
        });
      }

      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      setNickname('');
      setAvatar('');
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const saveProfile = (newNickname: string, newAvatar?: string) => {
    const profile: UserProfile = {
      nickname: newNickname,
      avatar: newAvatar || avatar
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      saveProfile(nickname.trim());
      setShowSettings(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentChat?.id && newMessage.trim()) {
      try {
        const updatedChat = await api.sendMessage(currentChat.id, {
          text: newMessage.trim()
        });
        setChats(chats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        ));
        setCurrentChat(updatedChat);
        setNewMessage('');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatName.trim()) {
      try {
        const newChat = await api.createChat({
          name: newChatName.trim(),
          avatar: newChatAvatar || undefined
        });
        setChats([...chats, newChat]);
        setCurrentChat(newChat);
        setNewChatName('');
        setNewChatAvatar('');
        setShowNewChat(false);
      } catch (error) {
        console.error('Ошибка при создании чата:', error);
      }
    }
  };

  const handleNewChatAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewChatAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentChat?.id) {
      try {
        const updatedChat = await api.sendMessage(currentChat.id, {
          file: file
        });
        setChats(chats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        ));
        setCurrentChat(updatedChat);
        setIsAttachMenuOpen(false);
      } catch (error) {
        console.error('Ошибка при отправке файла:', error);
      }
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentChat?.id) {
      try {
        const updatedChat = await api.sendMessage(currentChat.id, {
          image: file
        });
        setChats(chats.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        ));
        setCurrentChat(updatedChat);
        setIsAttachMenuOpen(false);
      } catch (error) {
        console.error('Ошибка при отправке изображения:', error);
      }
    }
  };

  const toggleAttachMenu = () => {
    setIsAttachMenuOpen(!isAttachMenuOpen);
  };

  const handleChatUpdate = async () => {
    if (!currentChat) return;

    try {
      const formData = new FormData();
      
      // Добавляем новое имя чата, если оно изменилось
      if (editingChatName !== currentChat.name) {
        formData.append('name', editingChatName);
      }
      
      // Добавляем новый аватар, если он был выбран
      if (editingChatAvatar) {
        formData.append('avatar', editingChatAvatar);
      }

      const updatedChat = await api.updateChat(currentChat.id, formData);
      
      // Обновляем список чатов и текущий чат
      setChats(chats.map(chat => 
        chat.id === currentChat.id ? updatedChat : chat
      ));
      setCurrentChat(updatedChat);
      
      // Закрываем модальное окно настроек
      setShowChatSettings(false);
      
      // Сбрасываем состояние редактирования
      setEditingChatAvatar(null);
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const handleChatDelete = async () => {
    if (!currentChat) return;

    if (window.confirm('Вы уверены, что хотите удалить этот чат?')) {
      try {
        await api.deleteChat(currentChat.id);
        setChats(chats.filter(chat => chat.id !== currentChat.id));
        setCurrentChat(null);
        setShowChatSettings(false);
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleChatAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditingChatAvatar(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="auth-container">
          <h1>{isRegistering ? 'Регистрация' : 'Вход'}</h1>
          <form onSubmit={handleAuth} className="auth-form">
            <div className="form-group">
              <div className="input-icon">
                <UserIcon />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Имя пользователя"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-icon">
                <LockIcon />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  required
                />
              </div>
            </div>
            {isRegistering && (
              <>
                <div className="form-group">
                  <div className="input-icon">
                    <UserIcon />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Отображаемое имя"
                      required
                    />
                  </div>
                </div>
                <div className="avatar-upload" onClick={handleAvatarClick}>
                  {avatar ? (
                    <img src={avatar} alt="Аватар" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>Выберите аватар</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </>
            )}
            <button type="submit" className="auth-button">
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>
          <button
            className="switch-auth-mode"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Чаты</h2>
          <button 
            className="add-chat-button"
            onClick={() => setShowNewChat(!showNewChat)}
            aria-label="Создать чат"
          >
            <AddIcon />
          </button>
        </div>

        {showNewChat && (
          <div className="new-chat-form">
            <div className="avatar-upload" onClick={() => newChatAvatarInputRef.current?.click()}>
              {newChatAvatar ? (
                <img src={newChatAvatar} alt="Аватар чата" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>Выберите аватар чата</span>
                </div>
              )}
              <input
                type="file"
                ref={newChatAvatarInputRef}
                onChange={handleNewChatAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <form onSubmit={handleCreateChat} className="new-chat-form">
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Название чата..."
                className="chat-name-input"
                maxLength={30}
              />
              <button type="submit" className="create-chat-button">
                <AddIcon />
              </button>
            </form>
          </div>
        )}

        <div className="chat-list-items">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setCurrentChat(chat)}
            >
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {chat.name && chat.name.length > 0 ? chat.name[0].toUpperCase() : '?'}
                </div>
              )}
              <span className="chat-name">{chat.name}</span>
              <span className="chat-message-count">
                {chat.messages.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="current-chat">
          {currentChat ? (
            <>
              <div className="current-chat-header">
                <div className="chat-info">
                  <div className="chat-avatar">
                    {currentChat.avatar ? (
                      <img src={currentChat.avatar} alt={`${currentChat.name} avatar`} />
                    ) : (
                      <span>{currentChat.name && currentChat.name.length > 0 ? currentChat.name[0].toUpperCase() : '?'}</span>
                    )}
                  </div>
                  <h2>{currentChat.name}</h2>
                </div>
                <div className="header-buttons">
                  <button 
                    className="settings-button"
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="Настройки"
                  >
                    <SettingsIcon />
                  </button>
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                    aria-label="Выход"
                  >
                    <LogoutIcon />
                  </button>
                  {currentChat && (
                    <button
                      className="icon-button"
                      onClick={() => {
                        setEditingChatName(currentChat.name);
                        setShowChatSettings(true);
                      }}
                    >
                      <SettingsIcon />
                    </button>
                  )}
                </div>
              </div>

              <div className="message-container" ref={messagesEndRef}>
                {currentChat.messages.map(message => (
                  <Message 
                    key={message.id} 
                    message={message} 
                    isOwn={message.nickname === nickname} 
                  />
                ))}
              </div>

              <div className="bottom-bar">
                <div className="input-container">
                  <button
                    type="button"
                    className="attach-button"
                    onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                    aria-label="Прикрепить файл"
                  >
                    <AttachmentIcon />
                    {isAttachMenuOpen && (
                      <div className="attach-menu">
                        <button onClick={() => imageInputRef.current?.click()}>
                          <ImageIcon /> Изображение
                        </button>
                        <button onClick={() => fileInputRef.current?.click()}>
                          <FileIcon /> Файл
                        </button>
                      </div>
                    )}
                  </button>
                  <form onSubmit={handleMessageSubmit} className="message-form">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      className="message-input"
                    />
                    <button 
                      type="submit" 
                      className="send-button" 
                      disabled={!newMessage.trim()}
                      aria-label="Отправить сообщение"
                    >
                      <SendIcon />
                    </button>
                  </form>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <h2>Выберите чат для начала общения</h2>
            </div>
          )}
        </div>

        {showSettings && (
          <div className="settings-container">
            <h2 className="settings-title">Настройки профиля</h2>
            <div className="avatar-upload" onClick={handleAvatarClick}>
              {avatar ? (
                <img src={avatar} alt="Аватар" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>Выберите аватар</span>
                </div>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <form onSubmit={handleNicknameSubmit} className="profile-form">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Введите ваш никнейм..."
                className="nickname-input"
                maxLength={20}
              />
              <button type="submit" className="save-button">
                <SaveIcon />
              </button>
            </form>
          </div>
        )}

        {showChatSettings && currentChat && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Настройки чата</h2>
              <div className="chat-settings">
                <div className="avatar-upload" onClick={() => document.getElementById('chatAvatarInput')?.click()}>
                  {(editingChatAvatar || currentChat.avatar) ? (
                    <img
                      src={editingChatAvatar ? URL.createObjectURL(editingChatAvatar) : currentChat.avatar}
                      alt="Аватар чата"
                      className="avatar-preview"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      Изменить аватар
                    </div>
                  )}
                  <input
                    id="chatAvatarInput"
                    type="file"
                    accept="image/*"
                    onChange={handleChatAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <input
                  type="text"
                  value={editingChatName}
                  onChange={(e) => setEditingChatName(e.target.value)}
                  placeholder="Название чата"
                  className="input"
                />
                <div className="modal-buttons">
                  <button className="button" onClick={handleChatUpdate}>
                    Сохранить
                  </button>
                  <button className="button button-danger" onClick={handleChatDelete}>
                    Удалить чат
                  </button>
                  <button className="button button-secondary" onClick={() => setShowChatSettings(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} байт`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} КБ`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} МБ`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
  }
}
