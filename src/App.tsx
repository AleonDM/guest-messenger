import React, { useState, useEffect, useRef } from 'react';
import { api, User, Chat as ChatType, Message as MessageType } from './api.ts';
import './App.css';

interface UserProfile {
  nickname: string;
  avatar?: string;
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
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" fill="currentColor"/>
  </svg>
);

const MessengerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
    <path d="M6 9H18V11H6V9ZM6 6H18V8H6V6ZM6 12H15V14H6V12Z" fill="currentColor"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
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

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatAvatar, setNewChatAvatar] = useState<string>('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAvatarInputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messageImageInputRef = useRef<HTMLInputElement>(null);

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
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  const loadUserData = async () => {
    try {
      const response = await api.getCurrentUser();
      setCurrentUser(response.user);
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
    setError('');

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          return;
        }

        const response = await api.register({
          username,
          password,
          nickname,
          avatar
        });
        setCurrentUser(response.user);
      } else {
        const response = await api.login({
          username,
          password
        });
        setCurrentUser(response.user);
      }

      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setNickname('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setChats([]);
    setCurrentChat(null);
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
    fileInputRef.current?.click();
  };

  const handleChatAvatarClick = () => {
    chatAvatarInputRef.current?.click();
  };

  const handleChatAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewChatAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      setIsNicknameSet(true);
      setShowSettings(false);
    }
  };

  const handleMessageImageClick = () => {
    messageImageInputRef.current?.click();
  };

  const handleMessageImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentChat?.id) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const updatedChat = await api.sendMessage(currentChat.id, {
            text: newMessage.trim(),
            image: reader.result as string
          });
          setChats(chats.map(chat => 
            chat.id === currentChat.id ? updatedChat : chat
          ));
          setCurrentChat(updatedChat);
          setNewMessage('');
        } catch (error) {
          console.error('Ошибка при отправке изображения:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentChat?.id) {
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
        setShowNewChatForm(false);
      } catch (error) {
        console.error('Ошибка при создании чата:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="auth-container">
          <h1>{isRegistering ? 'Регистрация' : 'Вход'}</h1>
          {error && <div className="error-message">{error}</div>}
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
                    <LockIcon />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Подтвердите пароль"
                      required
                    />
                  </div>
                </div>
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
                <div className="avatar-upload" onClick={() => fileInputRef.current?.click()}>
                  {avatar ? (
                    <img src={avatar} alt="Аватар" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>Выберите аватар</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
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
            onClick={() => setShowNewChatForm(!showNewChatForm)}
            aria-label="Создать чат"
          >
            <AddIcon />
          </button>
        </div>

        {showNewChatForm && (
          <div className="new-chat-form">
            <div className="avatar-upload" onClick={handleChatAvatarClick}>
              {newChatAvatar ? (
                <img src={newChatAvatar} alt="Аватар чата" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <span>Выберите аватар чата</span>
                </div>
              )}
              <input
                type="file"
                ref={chatAvatarInputRef}
                onChange={handleChatAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <form onSubmit={handleCreateChat}>
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
                  {chat.name[0].toUpperCase()}
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
        <div className="top-bar">
          <div className="messenger-icon">
            <MessengerIcon />
          </div>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Настройки"
          >
            <SettingsIcon />
          </button>
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
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <form onSubmit={handleNicknameSubmit} className="nickname-form">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Введите ваш никнейм..."
                className="nickname-input"
                maxLength={20}
              />
              <button type="submit" className="save-button" aria-label="Сохранить">
                <SaveIcon />
              </button>
            </form>
          </div>
        )}

        {currentChat ? (
          <>
            <div className="current-chat-header">
              {currentChat.avatar ? (
                <img src={currentChat.avatar} alt={currentChat.name} className="chat-avatar" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {currentChat.name[0].toUpperCase()}
                </div>
              )}
              <h2>{currentChat.name}</h2>
            </div>

            <div className="message-container" ref={messageContainerRef}>
              {currentChat.messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.nickname === nickname ? 'message-own' : ''}`}
                >
                  <div className="message-header">
                    <div className="message-user-info">
                      {message.avatar ? (
                        <img src={message.avatar} alt="Аватар" className="avatar-message" />
                      ) : (
                        <div className="avatar-placeholder-message">
                          {message.nickname[0].toUpperCase()}
                        </div>
                      )}
                      <span className="message-nickname">{message.nickname}</span>
                    </div>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {message.image && (
                    <div className="message-image-container">
                      <img src={message.image} alt="Изображение" className="message-image" />
                    </div>
                  )}
                  {message.text && <div className="message-text">{message.text}</div>}
                </div>
              ))}
            </div>

            <div className="bottom-bar">
              <div className="input-container">
                <form onSubmit={handleMessageSubmit} className="message-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="message-input"
                  />
                  <button 
                    type="button" 
                    className="image-button"
                    onClick={handleMessageImageClick}
                    aria-label="Добавить изображение"
                  >
                    <ImageIcon />
                  </button>
                  <input
                    type="file"
                    ref={messageImageInputRef}
                    onChange={handleMessageImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button type="submit" className="send-button" aria-label="Отправит�� сообщение">
                    <SendIcon />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Выберите чат или создайте новый</h2>
          </div>
        )}
      </div>
    </div>
  );
}
