import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from './App';

describe('App component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nickname form and avatar upload when profile is not set', async () => {
    await act(async () => {
      render(<App />);
    });
    const nicknameInput = screen.getByPlaceholderText(/Введите ваш никнейм/i);
    const submitButton = screen.getByText(/Продолжить/i);
    const avatarUpload = screen.getByText(/Выберите аватар/i);
    
    expect(nicknameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(avatarUpload).toBeInTheDocument();
  });

  it('shows messenger after setting nickname', async () => {
    await act(async () => {
      render(<App />);
    });
    
    const nicknameInput = screen.getByPlaceholderText(/Введите ваш никнейм/i);
    const submitButton = screen.getByText(/Продолжить/i);
    
    await act(async () => {
      fireEvent.change(nicknameInput, { target: { value: 'TestUser' } });
      fireEvent.click(submitButton);
    });

    const messageInput = screen.getByPlaceholderText(/Введите сообщение/i);
    const sendButton = screen.getByText(/Отправить/i);
    const nicknameDisplay = screen.getByText(/Ваш никнейм: TestUser/i);
    
    expect(messageInput).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
    expect(nicknameDisplay).toBeInTheDocument();
  });

  it('allows changing profile', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Устанавливаем начальный профиль
    const nicknameInput = screen.getByPlaceholderText(/Введите ваш никнейм/i);
    const submitButton = screen.getByText(/Продолжить/i);
    
    await act(async () => {
      fireEvent.change(nicknameInput, { target: { value: 'TestUser' } });
      fireEvent.click(submitButton);
    });

    // Меняем профиль
    const changeButton = screen.getByText(/Изменить/i);
    
    await act(async () => {
      fireEvent.click(changeButton);
    });

    const newNicknameInput = screen.getByPlaceholderText(/Введите ваш никнейм/i);
    const avatarUpload = screen.getByText(/Выберите аватар/i);
    
    expect(newNicknameInput).toBeInTheDocument();
    expect(avatarUpload).toBeInTheDocument();
  });

  it('loads saved profile from localStorage', async () => {
    const testProfile = {
      nickname: 'TestUser',
      avatar: 'data:image/png;base64,test'
    };
    localStorage.setItem('userProfile', JSON.stringify(testProfile));

    await act(async () => {
      render(<App />);
    });

    const nicknameDisplay = screen.getByText(/Ваш никнейм: TestUser/i);
    const avatarImg = document.querySelector('.avatar-small') as HTMLImageElement;
    
    expect(nicknameDisplay).toBeInTheDocument();
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg.src).toBe(testProfile.avatar);
  });
});
