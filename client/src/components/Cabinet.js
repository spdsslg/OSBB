import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cabinet.css';

function Cabinet({ loggedInUser, onLogout, admin, onAddNews, newsList, onDeleteNews }) {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [link, setLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  // Новые состояния для месяца и года
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user-invoice', {
          params: { login: loggedInUser }
        });
        setInvoiceData(response.data);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      }
    };

    fetchInvoiceData();
  }, [loggedInUser]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const parseValue = (value) => value ? parseFloat(value) : 0;


  const handleNewsSubmit = async (e) => {
    e.preventDefault();

    // Формирование данных с использованием FormData для корректной загрузки изображения
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('link', link); 
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post('http://localhost:5000/api/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onAddNews({ title, content, image, link });
      setTitle('');
      setContent('');
      setImage(null);
      setLink(''); 
      alert('News added successfully');
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Error adding news');
    }
  };

  const handleExcelSubmit = async (event) => {
    event.preventDefault();
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files[0]) {
      alert('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      await axios.post('http://localhost:5000/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      alert('Error uploading file');
    }
  };

  // Добавим функцию для отправки выбранных даты и месяца администратором
  const handleDateChangeSubmit = async (e) => {
    e.preventDefault();

    // Проверьте, что данные соответствуют ожидаемым типам
    console.log('Month:', selectedMonth, 'Year:', selectedYear);
  
    try {
      const response = await axios.post('http://localhost:5000/api/update-period', {
        month: selectedMonth,
        year: parseInt(selectedYear, 10),
      });
      console.log('Server response:', response.data);
      alert('Date updated successfully');
    } catch (error) {
      console.error('Error updating date:', error.response ? error.response.data : error.message);
      alert('Error updating date');
    }
  };

  return (
    <div className="cabinet">
    <h1>Особистий кабінет</h1>
    <button onClick={handleLogout} className='button-cabinet'>Вийти</button>

    {invoiceData ? (
      <div className="invoice">
        <h2>Рахунок за {invoiceData.monthName} {invoiceData.year}</h2>

        <div className="invoice-header"> 
          <p><strong>Особовий рахунок:</strong> {loggedInUser}</p>
          <p><strong>Загальна площа:</strong> {invoiceData.total_area} м²</p>
          <p><strong>Нежитлова площа (Кладовка):</strong> {invoiceData.nonlivarea} м²</p>
        </div>

        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Назва послуги</th>
                <th>Тариф</th>
                <th>Борг/Переплата (-)</th>
                <th>Оплачено протягом місяця</th>
                <th>Нараховано</th>
                <th>Перерахунок <br/> (Донарах. "+" Знято "-")</th>
                <th>До оплати в грн</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.housetariff || invoiceData.debt_overpay_house || invoiceData.paid_month_house || invoiceData.calculated_house || invoiceData.transfer_house || invoiceData.payment_house ? (
                <tr>
                  <td>Управ. буд.</td>
                  <td>{invoiceData.housetariff} грн</td>
                  <td>{invoiceData.debt_overpay_house} грн</td>
                  <td>{invoiceData.paid_month_house} грн</td>
                  <td>{invoiceData.calculated_house} грн</td>
                  <td>{invoiceData.transfer_house} грн</td>
                  <td>{invoiceData.payment_house} грн</td>
                </tr>
              ) : null}

              {invoiceData.storagetariff || invoiceData.debt_overpay_storage || invoiceData.paid_month_storage || invoiceData.calculated_storage || invoiceData.transfer_storage || invoiceData.payment_storage ? (
                <tr>
                  <td>Кладовка</td>
                  <td>{invoiceData.storagetariff} грн</td>
                  <td>{invoiceData.debt_overpay_storage} грн</td>
                  <td>{invoiceData.paid_month_storage} грн</td>
                  <td>{invoiceData.calculated_storage} грн</td>
                  <td>{invoiceData.transfer_storage} грн</td>
                  <td>{invoiceData.payment_storage} грн</td>
                </tr>
              ) : null}

              {invoiceData.tariff_coldwater1 || invoiceData.debt_overpay_coldwater1 || invoiceData.paid_month_coldwater1 || invoiceData.calculated_coldwater1 || invoiceData.transfer_coldwater1 || invoiceData.payment_coldwater1 ? (
                <tr>
                  <td>Холодна вода</td>
                  <td>{invoiceData.tariff_coldwater1} грн</td>
                  <td>{invoiceData.debt_overpay_coldwater1} грн</td>
                  <td>{invoiceData.paid_month_coldwater1} грн</td>
                  <td>{invoiceData.calculated_coldwater1} грн</td>
                  <td>{invoiceData.transfer_coldwater1} грн</td>
                  <td>{invoiceData.payment_coldwater1} грн</td>
                </tr>
              ) : null}

              {invoiceData.tariff_central_heating3 || invoiceData.debt_overpay_central_heating3 || invoiceData.paid_month_central_heating3 || invoiceData.calculated_central_heating3 || invoiceData.transfer_central_heating3 || invoiceData.payment_central_heating3 ? (
                <tr>
                  <td>Центральне опалення</td>
                  <td>{invoiceData.tariff_central_heating3} грн</td>
                  <td>{invoiceData.debt_overpay_central_heating3} грн</td>
                  <td>{invoiceData.paid_month_central_heating3} грн</td>
                  <td>{invoiceData.calculated_central_heating3} грн</td>
                  <td>{invoiceData.transfer_central_heating3} грн</td>
                  <td>{invoiceData.payment_central_heating3} грн</td>
                </tr>
              ) : null}

              {invoiceData.tariff_vodovidvedennya2 || invoiceData.debt_overpay_vodovidvedennya2 || invoiceData.paid_month_vodovidvedennya2 || invoiceData.calculated_vodovidvedennya2 || invoiceData.transfer_vodovidvedennya2 || invoiceData.payment_vodovidvedennya2 ? (
                <tr>
                  <td>Водовідведення</td>
                  <td>{invoiceData.tariff_vodovidvedennya2} грн</td>
                  <td>{invoiceData.debt_overpay_vodovidvedennya2} грн</td>
                  <td>{invoiceData.paid_month_vodovidvedennya2} грн</td>
                  <td>{invoiceData.calculated_vodovidvedennya2} грн</td>
                  <td>{invoiceData.transfer_vodovidvedennya2} грн</td>
                  <td>{invoiceData.payment_vodovidvedennya2} грн</td>
                </tr>
              ) : null}

              {invoiceData.tariff_remfond4 || invoiceData.debt_overpay_remfond4 || invoiceData.paid_month_remfond4 || invoiceData.calculated_remfond4 || invoiceData.transfer_remfond4 || invoiceData.payment_remfond4 ? (
                <tr>
                  <td>Ремонтний фонд</td>
                  <td>{invoiceData.tariff_remfond4} грн</td>
                  <td>{invoiceData.debt_overpay_remfond4} грн</td>
                  <td>{invoiceData.paid_month_remfond4} грн</td>
                  <td>{invoiceData.calculated_remfond4} грн</td>
                  <td>{invoiceData.transfer_remfond4} грн</td>
                  <td>{invoiceData.payment_remfond4} грн</td>
                </tr>
              ) : null}

              <tr>
                <td><strong>Всього</strong></td>
                <td><strong></strong></td>
                <td><strong>{(parseValue(invoiceData.debt_overpay_house) + parseValue(invoiceData.debt_overpay_storage) + parseValue(invoiceData.debt_overpay_coldwater1) + parseValue(invoiceData.debt_overpay_central_heating3) + parseValue(invoiceData.debt_overpay_vodovidvedennya2) + parseValue(invoiceData.debt_overpay_remfond4)).toFixed(2)} грн</strong></td>
                <td><strong>{(parseValue(invoiceData.paid_month_house) + parseValue(invoiceData.paid_month_storage) + parseValue(invoiceData.paid_month_coldwater1) + parseValue(invoiceData.paid_month_central_heating3) + parseValue(invoiceData.paid_month_vodovidvedennya2) + parseValue(invoiceData.paid_month_remfond4)).toFixed(2)} грн</strong></td>
                <td><strong>{(parseValue(invoiceData.calculated_house) + parseValue(invoiceData.calculated_storage) + parseValue(invoiceData.calculated_coldwater1) + parseValue(invoiceData.calculated_central_heating3) + parseValue(invoiceData.calculated_vodovidvedennya2) + parseValue(invoiceData.calculated_remfond4)).toFixed(2)} грн</strong></td>
                <td><strong>{(parseValue(invoiceData.transfer_house) + parseValue(invoiceData.transfer_storage) + parseValue(invoiceData.transfer_coldwater1) + parseValue(invoiceData.transfer_central_heating3) + parseValue(invoiceData.transfer_vodovidvedennya2) + parseValue(invoiceData.transfer_remfond4)).toFixed(2)} грн</strong></td>
                <td><strong>{invoiceData.payment_total} грн</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

           {/* Кнопка для оплаты через Приват24 */}
           <div className="total-payment-container">
            <h3 className="total-payment">Усього до сплати: {invoiceData.payment_total} грн</h3>
            <button className="privat24-button" onClick={openModal}>
              Отримати реквізити
            </button>
          </div>

          {/* Модальное окно с реквизитами */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-button" onClick={closeModal}></span>
                <h2>Реквізити для оплати</h2>
                <p>Номер картки: <strong>5168 XXXX XXXX 129</strong></p>
                <p>Отримувач: <strong>Іван Іванов</strong></p>
                <p>Банк: <strong>ПриватБанк</strong></p>
                <p>Призначення платежу: <strong>Оплата за послуги</strong></p>
                <p>Сума: <strong>{invoiceData.payment_total} грн</strong></p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Завантаження даних...</p>
      )}

      {admin && (
        <>
          <form onSubmit={handleNewsSubmit} className="news-form">
            <h2>Добавить новость</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Содержание"
              required
            />
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)} // Добавляем обработчик для ссылки
              placeholder="Ссылка"
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            <button type="submit"  className='button-cabinet'>Добавить новость</button>
          </form>

          <form onSubmit={handleExcelSubmit} className="excel-form">
            <h2>Загрузить Excel файл</h2>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              required
            />
            <button type="submit"  className='button-cabinet'>Загрузить файл</button>
          </form>

          <form onSubmit={handleDateChangeSubmit} className="date-form">
            <h2>Змінити місяць і рік</h2>
            <label>
              Місяць:
              <input
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
              />
            </label>
            <label>
              Рік:
              <input
                type="number"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
              />
            </label>
            <button type="submit"  className='button-cabinet'>Зберегти</button>
          </form>

        </>
      )}
    </div>
  );
}

export default Cabinet;
