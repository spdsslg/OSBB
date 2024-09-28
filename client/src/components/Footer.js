import React from 'react';
import { Link } from 'react-router-dom'; // Импортируем Link из react-router-dom
import './Footer.css';

// Импортируем изображения
import locationIcon from './images/location.png';
import phoneIcon from './images/phone_w.png';
import emailIcon from './images/email_w.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Новини</h3>
          <ul>
            <li><Link to="/News">Новини</Link></li> {/* Переход на страницу News */}
          </ul>
        </div>
        <div className="footer-column">
          <h3>Документи</h3>
          <ul>
            <li><Link to="/Contacts">Контакти</Link></li> {/* Переход на страницу Contacts */}
            <li><Link to="/Contacts">Технічна підтримка</Link></li>
            <li><Link to="/Templates">Документи</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h3>Контакти</h3>
          <ul>
            <li>
              {/* Иконка телефона */}
              <img src={phoneIcon} alt="Phone" className="footer-icon" />
              (063) 250-13-16
            </li>
            <li>
              {/* Иконка email */}
              <img src={emailIcon} alt="Email" className="footer-icon" />
              vinmegapolic@ukr.net
            </li>
            <li>
              {/* Иконка адреса */}
              <img src={locationIcon} alt="Location" className="footer-icon" />
              м. Вінниця, вул. Малиновського, 26
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 «Вінмегаполіс». Всі права захищені.</p>
      </div>
    </footer>
  );
};

export default Footer;