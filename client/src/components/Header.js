import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from './images/VinMegapolis.svg';
import LoginForm from './LoginForm';

const Header = ({ loggedInUser, onLogin }) => {
  const [isLoginFormVisible, setLoginFormVisible] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false); // Стейт для бургер-меню
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (loggedInUser) {
      navigate('/cabinet'); // Перенаправить в кабинет, если пользователь авторизован
    } else {
      setLoginFormVisible(true); // Показать форму входа, если не авторизован
    }
  };

  const closeLoginForm = (login) => {
    setLoginFormVisible(false); // Скрыть форму входа
    if (login) {
      onLogin(login); // Обновить состояние при успешном входе
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);

    // Проверяем наличие main-content на странице
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (!isMenuOpen) {
        mainContent.classList.add('shifted'); // Добавить класс для сдвига контента вниз
      } else {
        mainContent.classList.remove('shifted'); // Убрать сдвиг
      }
    }
  };

  return (
    <>
      <header>
        <div className="header-left">
          <Link to="/">
            <img className="logo" src={logo} alt="Logo" />
          </Link>
        </div>

        {/* Бургер-меню */}
        <div className={`burger-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Навигация */}
        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/templates" onClick={toggleMenu}>Зразки документів</Link>
          <Link to="/news" onClick={toggleMenu}>Новини</Link>
          <Link to="/contacts" onClick={toggleMenu}>Контакти</Link>
        </nav>

        <div className="header-right">
          <button onClick={handleLoginClick}>Мій кабінет</button>
        </div>
      </header>

      {isLoginFormVisible && <LoginForm closeForm={closeLoginForm} onLogin={onLogin} />}
    </>
  );
};

export default Header;
