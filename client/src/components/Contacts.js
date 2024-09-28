import React from 'react';
import './Contacts.css';
import phone from './images/phone.png';
import email from './images/email.png';
import clock from './images/clock.png';

function Contacts() {
  return (
    <div className="contacts-wrapper">
      <h2 className="contacts-header">Наші контакти</h2>
      
      <div className="contacts-container">
        {/* Новая надпись в контейнере */}
        <p className="contacts-message">
          Якщо Ви хочете створити акаунт, зв'яжіться з нами за номером телефону нижче або використовуючи пошту
        </p>

        <div className="contacts-info-block">
          <h3 className="contacts-info-title">Зворотній зв'язок та підтримка</h3>
          <div className="contacts-info">
            <ul>
              <li><img src={phone} alt="phone" className="icon"/> (063) 250-13-16</li>
              <li><img src={email} alt="email" className="icon"/> vinmegapolic@ukr.net</li>
              <li><img src={clock} alt="clock" className="icon"/> Пн-пт 10:00-16:00<br />Сб-нд вихідні</li>
            </ul>
          </div>
        </div>

        <div className="contacts-address-block">
          <div className="contacts-addresses">
            <h3>Юридична адреса:</h3>
            <p><i className="fas fa-map-marker-alt"></i> м. Вінниця, вул. Малиновського, 26</p>

            <h3>Адреса приміщення:</h3>
            <p><i className="fas fa-map-marker-alt"></i> м. Вінниця, вул. Малиновського, 26</p>
            <p><i className="fas fa-phone"></i> (098) 456-63-73 (Бухгалтерія)</p>
            <p><i className="fas fa-envelope"></i> vinmegapolic@ukr.net</p>
          </div>

          <div className="contacts-image">
            <iframe
              src="https://www.google.com/maps?q=49.22755029167572,28.456743970932433&hl=uk&z=15&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            >
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
