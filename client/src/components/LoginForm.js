import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Используем только useNavigate
import './LoginForm.css';

function LoginForm({ closeForm, onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', { login, password });

      if (response.data.success) {
        localStorage.setItem('loggedInUser', login);
        if (typeof onLogin === 'function') {
          onLogin(login); // Передаем логин в родительский компонент
        }
        if (typeof closeForm === 'function') {
          closeForm(login); // Закрываем форму и передаем логин
        }
        setMessage('');  // Очистите сообщение об ошибке
        navigate('/cabinet');
      } else {
        setMessage('Invalid credentials'); // Сообщение об ошибке
      }
    } catch (error) {
      console.error('There was an error logging in!', error);
      setMessage('Error occurred'); // Сообщение об ошибке
    }
  };

  const handleCreateAccountClick = () => {
    // Переход на страницу контактов и закрытие формы
    navigate('/contacts');
    if (typeof closeForm === 'function') {
      closeForm(); // Закрываем форму
    }
  };

  return (
    <div className="login-form-overlay">
      <div className="login-form-container">
        <button className="close-button" onClick={() => closeForm()}></button>
        <h1>Вхід</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Логін:
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Пароль:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Увійти</button>
        </form>
        <p>{message}</p> {/* Отображение сообщения об ошибке */}

        {/* Обновляем на кнопку, которая программно переходит на страницу контактов и закрывает форму */}
        <div className="create-account-link">
          <p>Ще немає аккаунта? <button className="link-button" onClick={handleCreateAccountClick}>Створити аккаунт</button></p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
