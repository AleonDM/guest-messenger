export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
}

export interface Message {
  id: number;
  text: string;
  image?: string;
  timestamp: string;
  nickname: string;
  avatar?: string;
}

export interface Chat {
  id: number;
  name: string;
  avatar?: string;
  messages: Message[];
  createdBy: number;
}

interface CreateChatData {
  name: string;
  avatar?: string;
}

interface MessageData {
  text?: string;
  image?: string;
}

class Api {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (this.token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`
      };
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Произошла ошибка');
    }

    return data;
  }

  async register(userData: { username: string; password: string; nickname: string; avatar?: string }) {
    const data = await this.request('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async login(credentials: { username: string; password: string }) {
    const data = await this.request('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    return await this.request('/user/current');
  }

  async createChat(chatData: CreateChatData) {
    return await this.request('/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatData)
    });
  }

  async getChats() {
    return await this.request('/chats');
  }

  async sendMessage(chatId: number, messageData: MessageData) {
    return await this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
  }
}

export const api = new Api(); 