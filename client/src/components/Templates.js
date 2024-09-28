import React from 'react';
import './Templates.css';
import icon1 from './images/pdf.png'; // Путь к иконке 1
import icon2 from './images/link.png'; // Путь к иконке 2
import icon3 from './images/email.png'; // Путь к иконке 3
// ... Импортируй остальные иконки

const data = [
  { icon: icon1, text: "Статут типовий" },
  { icon: icon2, text: "Протокол ініціативної групи зі скликання та проведення установчих зборів" },
  { icon: icon2, text: "Протокол інформаційних зборів співвласників" },
  { icon: icon2, text: "Протокол ініціативної групи зі скликання та проведення установчих зборів" },
  { icon: icon2, text: "Протокол ініціативної групи зі скликання та проведення установчих зборів" },
  { icon: icon2, text: "Протокол ініціативної групи зі скликання та проведення установчих зборів" },
  // ... Добавь еще 12 строк
];

function Templates() {
  return (
    <div className="templates-wrapper">
      <h2 className="templates-header">
        На цій сторінці ви можете ознайомитись з нормативними документами<br/> та законодавчою базою щодо ОСББ.
      </h2>

      <div className="templates-list">
        {data.map((item, index) => (
          <div key={index} className="templates-item">
            <img src={item.icon} alt={`icon-${index}`} className="templates-icon" />
            <div className="templates-info">
              <p className="templates-text">{item.text}</p>
              <span className="templates-link">перейти</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Templates;
