import React from 'react';
import './CompanyDescription.css';
import { useNavigate } from 'react-router-dom';

const CompanyDescription = ({ loggedInUser, onLogin }) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (loggedInUser) {
      navigate('/cabinet'); // Redirect to the cabinet if the user is logged in
    } else {
      // Trigger login logic if the user is not logged in
      const headerLoginButton = document.querySelector('.header-right button');
      if (headerLoginButton) {
        headerLoginButton.click(); // Simulate the header login button click
      }
    }
  };

  return (
    <div className="company-description">
      <h2>Особистий кабінет клієнта компанії «Вінмегаполіс»</h2>
      <div className="company-features">
        <div className="feature">
          <h3>Контролюйте ОСББ</h3>
          <p>«Вінмегаполіс» надає послуги управління ОСББ, а у власному кабінеті можна переглянути власні рахунки в один клік</p>
        </div>
        <div className="feature">
          <h3>Керуйте послугами</h3>
          <p>В особистому кабінеті можна переглянути послуги, які Вам надає наша компанія.</p>
        </div>
        <div className="feature">
          <h3>Дізнавайтесь баланс</h3>
          <p>Отримуйте інформацію про борг і переплату та сплачуйте за послуги не виходячи з дому.</p>
        </div>
      </div>
      <button className="go-to-cabinet" onClick={handleButtonClick}>
        Перейти в кабінет
      </button>
    </div>
  );
};

export default CompanyDescription;