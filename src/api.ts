export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
}

export interface Message {
  id: string;
  text?: string;
  image?: string;
  file?: {
    url: string;
    name: string;
    size: number;
    type: string;
  };
  nickname: string;
  avatar?: string;
  timestamp: number;
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

class Api {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
    this.baseUrl = `${baseUrl}/api`;
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

  async logout() {
    await this.request('/logout', {
      method: 'POST'
    });
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

  async updateChat(chatId: number, formData: FormData) {
    return await this.request(`/chats/${chatId}`, {
      method: 'PATCH',
      body: formData
    });
  }

  async deleteChat(chatId: number) {
    return await this.request(`/chats/${chatId}`, {
      method: 'DELETE'
    });
  }

  async sendMessage(chatId: number, message: { 
    text?: string; 
    image?: string | File; 
    file?: File;
  }) {
    const formData = new FormData();
    
    if (message.text) {
      formData.append('text', message.text);
    }
    
    if (message.image) {
      if (message.image instanceof File) {
        formData.append('image', message.image);
      } else {
        // Конвертируем base64 в файл
        const response = await fetch(message.image);
        const blob = await response.blob();
        formData.append('image', blob, 'image.jpg');
      }
    }
    
    if (message.file) {
      formData.append('file', message.file);
    }

    const response = await this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: formData
    });

    return response;
  }
}

export const api = new Api(); 