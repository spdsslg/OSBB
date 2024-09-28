const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const csvParse = require('csv-parse');
const fs = require('fs'); // Оставляем одно объявление fs

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'app1database',
  password: 'Yan48188',
  port: 5432,
});

const uploadDir = path.resolve(__dirname, 'public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }); // создаем middleware для загрузки файлов

app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));
app.use(cors({
  origin: 'http://localhost:3000', // Укажите URL фронтенда
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Если нужно передавать куки или авторизацию
}));
app.use(express.json());
app.use(express.static('public')); // Для статичных файлов, таких как изображения


// Маршрут для логина
app.post('/api/login', async (req, res) => {
  let { login, password } = req.body;

  // Преобразуем логин в строку, если он был введен как число, и удаляем кавычки
  login = String(login).replace(/['"]/g, '');

  try {
    // Проверка корректности логина как строки
    const result = await pool.query('SELECT * FROM public.users WHERE CAST(login AS TEXT) = $1 AND password = $2', [login, password]);

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Server error');
  }
});


// Получение текущего периода (месяц и год)
app.get('/api/invoice-period', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT month, year
      FROM invoice_period
      ORDER BY created_at DESC
      LIMIT 1;
    `);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Invoice period not found' });
    }
  } catch (error) {
    console.error('Error fetching invoice period:', error);
    res.status(500).send('Server error');
  }
});

// Маршрут для получения данных пользователя и текущего периода
app.get('/api/user-invoice', async (req, res) => {
  const { login } = req.query;

  try {
    // Получаем данные пользователя
    const userData = await pool.query('SELECT * FROM users WHERE login = $1', [login]);

    // Получаем текущий период из таблицы invoice_period
    const periodData = await pool.query('SELECT month, year FROM invoice_period LIMIT 1');
    
    if (userData.rows.length > 0 && periodData.rows.length > 0) {
      const invoiceData = {
        ...userData.rows[0], // Все данные пользователя
        monthName: periodData.rows[0].month, // Текущий месяц
        year: periodData.rows[0].year // Текущий год
      };

      res.json(invoiceData);
    } else {
      res.status(404).json({ error: 'User not found or invoice period not set' });
    }
  } catch (error) {
    console.error('Error fetching user invoice:', error);
    res.status(500).json({ error: 'Error fetching user invoice' });
  }
});

// Маршрут для обновления текущего периода
app.post('/api/update-period', async (req, res) => {
  const { month, year } = req.body;

  if (typeof month !== 'string' || isNaN(year)) {
    return res.status(400).json({ message: 'Invalid month or year' });
  }

  try {
    // Вставляем новую запись или обновляем существующую запись с id = 1
    const result = await pool.query(`
      INSERT INTO invoice_period (id, month, year, created_at)
      VALUES (1, $1, $2, NOW())
      ON CONFLICT (id)
      DO UPDATE SET month = EXCLUDED.month, year = EXCLUDED.year, created_at = NOW()
      RETURNING *;
    `, [month, year]);

    if (result.rows.length > 0) {
      res.json({ success: true, period: result.rows[0] });
    } else {
      res.status(500).json({ message: 'Failed to update or insert period' });
    }
  } catch (error) {
    console.error('Error updating period:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




// Получение всех новостей с сортировкой по времени создания
app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.news ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Server error');
  }
});


// Получение счета пользователя с учетом текущего периода
app.get('/api/user-invoice', async (req, res) => {
  const { login } = req.query;

  if (!login) {
    return res.status(400).json({ message: 'User login is required' });
  }

  try {
    // Получаем текущий период (месяц и год)
    const periodResult = await pool.query(`
      SELECT month, year
      FROM invoice_period
      ORDER BY created_at DESC
      LIMIT 1;
    `);
    
    if (periodResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice period not set' });
    }
    
    const { month, year } = periodResult.rows[0];
    
    // Получаем данные пользователя
    const result = await pool.query(`
      SELECT login, total_area, nonlivarea, housetariff, storagetariff, debt_overpay_house, 
             debt_overpay_storage, paid_month_house, paid_month_storage, 
             calculated_house, calculated_storage, transfer_house, transfer_storage, 
             penya, payment_house, payment_storage, payment_total
      FROM public.users 
      WHERE login = $1
    `, [login]);

    if (result.rows.length > 0) {
      const userData = result.rows[0];
      const totalPayment = parseFloat(userData.payment_house) + parseFloat(userData.payment_storage) + parseFloat(userData.penya);
      
      // Возвращаем данные счета пользователя вместе с текущим периодом
      res.json({
        ...userData,
        totalPayment: totalPayment.toFixed(2), // Итого к оплате
        period: { month, year }               // Текущий период
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user invoice:', error);
    res.status(500).send('Server error');
  }
});

// Маршрут для добавления новости с загрузкой изображения
app.post('/api/news', multer({ storage }).single('image'), async (req, res) => {
  const { title, content, link } = req.body;
  
  // Если изображение не загружено, присваиваем null или пустую строку
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO public.news (title, content, image, link, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [title, content, image, link]
    );

    // Отправляем успешный ответ с добавленной записью
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error occurred while adding news:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





// Удаление новости
app.delete('/api/news/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Найти новость, чтобы получить путь к картинке
    const result = await pool.query('SELECT image FROM public.news WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('News not found');
    }

    const imagePath = result.rows[0].image;

    // Удалить новость из базы данных
    await pool.query('DELETE FROM public.news WHERE id = $1', [id]);

    // Удалить файл изображения, если он существует
    if (imagePath) {
      // Путь к изображению на сервере
      const fullImagePath = path.join('D:', 'ABC', 'OSBB', 'osbb', 'server', 'public', imagePath);
      
      fs.unlink(fullImagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        } else {
          console.log('Image file deleted:', fullImagePath);
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Server error');
  }
});

// Маршрут для загрузки и обработки CSV файла
app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileContent = fs.readFileSync(file.path, 'utf8');
    const parse = csvParse.parse;
    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // Обработка данных
    for (const row of records) {
      const login = row['login'] ? String(row['login']).trim() : null;  // Логин как строка, сохраняем начальные нули
      const password = row['password'];
      const totalArea = row['Tot.Area'] ? row['Tot.Area'].replace(',', '.') : null;
      const nonlivarea = row['nonlivarea'] ? row['nonlivarea'].replace(',', '.') : null;
      const inhabnum = row['inhabnum'] ? parseInt(row['inhabnum']) : null;
      const housetariff = row['housetariff'] ? parseFloat(row['housetariff'].replace(',', '.')) : null;
      const storagetariff = row['storagetariff'] ? parseFloat(row['storagetariff'].replace(',', '.')) : null;
      const debtOverpayHouse = row['debt/overpay_house'] ? parseFloat(row['debt/overpay_house'].replace(',', '.')) : null;
      const debtOverpayStorage = row['debt/overpay_storage'] ? parseFloat(row['debt/overpay_storage'].replace(',', '.')) : null;
      const debtOverpayTotal = row['debt/overpay_total'] ? parseFloat(row['debt/overpay_total'].replace(',', '.')) : null;
      const paidMonthHouse = row['paid_month_house'] ? parseFloat(row['paid_month_house'].replace(',', '.')) : null;
      const paidMonthStorage = row['paid_month_storage'] ? parseFloat(row['paid_month_storage'].replace(',', '.')) : null;
      const paidMonthTotal = row['paid_month_total'] ? parseFloat(row['paid_month_total'].replace(',', '.')) : null;
      const calculatedHouse = row['calculated_house'] ? parseFloat(row['calculated_house'].replace(',', '.')) : null;
      const calculatedStorage = row['calculated_storage'] ? parseFloat(row['calculated_storage'].replace(',', '.')) : null;
      const calculatedTotal = row['calculated_total'] ? parseFloat(row['calculated_total'].replace(',', '.')) : null;
      const transferHouse = row['transfer_house'] ? parseFloat(row['transfer_house'].replace(',', '.')) : null;
      const transferStorage = row['transfer_storage'] ? parseFloat(row['transfer_storage'].replace(',', '.')) : null;
      const transferTotal = row['transfer_total'] ? parseFloat(row['transfer_total'].replace(',', '.')) : null;
      const penya = row['penya'] ? parseFloat(row['penya'].replace(',', '.')) : null;
      const paymentHouse = row['payment_house'] ? parseFloat(row['payment_house'].replace(',', '.')) : null;
      const paymentStorage = row['payment_storage'] ? parseFloat(row['payment_storage'].replace(',', '.')) : null;
      const paymentTotal = row['payment_total'] ? parseFloat(row['payment_total'].replace(',', '.')) : null;

      const tariffColdWater1 = row['tariff_coldwater1'] ? parseFloat(row['tariff_coldwater1'].replace(',', '.')) : null;
      const tariffVodovidvedennya2 = row['tariff_vodovidvedennya2'] ? parseFloat(row['tariff_vodovidvedennya2'].replace(',', '.')) : null;
      const tariffCentralHeating3 = row['tariff_central_heating3'] ? parseFloat(row['tariff_central_heating3'].replace(',', '.')) : null;
      const debtOverpayColdWater1 = row['debt/overpay_coldwater1'] ? parseFloat(row['debt/overpay_coldwater1'].replace(',', '.')) : null;
      const debtOverpayVodovidvedennya2 = row['debt/overpay_vodovidvedennya2'] ? parseFloat(row['debt/overpay_vodovidvedennya2'].replace(',', '.')) : null;
      const debtOverpayCentralHeating3 = row['debt/overpay_central_heating3'] ? parseFloat(row['debt/overpay_central_heating3'].replace(',', '.')) : null;
      const debtOverpayRemFond4 = row['debt/overpay_remfond4'] ? parseFloat(row['debt/overpay_remfond4'].replace(',', '.')) : null;
      const paidMonthColdWater1 = row['paid_month_coldwater1'] ? parseFloat(row['paid_month_coldwater1'].replace(',', '.')) : null;
      const paidMonthVodovidvedennya2 = row['paid_month_vodovidvedennya2'] ? parseFloat(row['paid_month_vodovidvedennya2'].replace(',', '.')) : null;
      const paidMonthCentralHeating3 = row['paid_month_central_heating3'] ? parseFloat(row['paid_month_central_heating3'].replace(',', '.')) : null;
      const paidMonthRemFond4 = row['paid_month_remfond4'] ? parseFloat(row['paid_month_remfond4'].replace(',', '.')) : null;
      const calculatedColdWater1 = row['calculated_coldwater1'] ? parseFloat(row['calculated_coldwater1'].replace(',', '.')) : null;
      const calculatedVodovidvedennya2 = row['calculated_vodovidvedennya2'] ? parseFloat(row['calculated_vodovidvedennya2'].replace(',', '.')) : null;
      const calculatedCentralHeating3 = row['calculated_central_heating3'] ? parseFloat(row['calculated_central_heating3'].replace(',', '.')) : null;
      const calculatedRemFond4 = row['calculated_remfond4'] ? parseFloat(row['calculated_remfond4'].replace(',', '.')) : null;
      const transferColdWater1 = row['transfer_coldwater1'] ? parseFloat(row['transfer_coldwater1'].replace(',', '.')) : null;
      const transferVodovidvedennya2 = row['transfer_vodovidvedennya2'] ? parseFloat(row['transfer_vodovidvedennya2'].replace(',', '.')) : null;
      const transferCentralHeating3 = row['transfer_central_heating3'] ? parseFloat(row['transfer_central_heating3'].replace(',', '.')) : null;
      const transferRemFond4 = row['transfer_remfond4'] ? parseFloat(row['transfer_remfond4'].replace(',', '.')) : null;
      const paymentColdWater1 = row['payment_coldwater1'] ? parseFloat(row['payment_coldwater1'].replace(',', '.')) : null;
      const paymentVodovidvedennya2 = row['payment_vodovidvedennya2'] ? parseFloat(row['payment_vodovidvedennya2'].replace(',', '.')) : null;
      const paymentCentralHeating3 = row['payment_central_heating3'] ? parseFloat(row['payment_central_heating3'].replace(',', '.')) : null;
      const paymentRemFond4 = row['payment_remfond4'] ? parseFloat(row['payment_remfond4'].replace(',', '.')) : null;


      // Проверка, существует ли запись для данного логина
      const existingUser = await pool.query('SELECT * FROM public.users WHERE login = $1', [login]);

      if (existingUser.rows.length > 0) {
        // Если пользователь существует, обновляем данные
        await pool.query(
          `UPDATE public.users SET 
            password = $1, total_area = $2, nonlivarea = $3, inhabnum = $4, housetariff = $5, storagetariff = $6, 
            debt_overpay_house = $7, debt_overpay_storage = $8, debt_overpay_total = $9, paid_month_house = $10, 
            paid_month_storage = $11, paid_month_total = $12, calculated_house = $13, calculated_storage = $14, 
            calculated_total = $15, transfer_house = $16, transfer_storage = $17, transfer_total = $18, penya = $19, 
            payment_house = $20, payment_storage = $21, payment_total = $22, 
            tariff_coldwater1 = $23, tariff_vodovidvedennya2 = $24, tariff_central_heating3 = $25, 
            debt_overpay_coldwater1 = $26, debt_overpay_vodovidvedennya2 = $27, debt_overpay_central_heating3 = $28, 
            debt_overpay_remfond4 = $29, paid_month_coldwater1 = $30, paid_month_vodovidvedennya2 = $31, 
            paid_month_central_heating3 = $32, paid_month_remfond4 = $33, calculated_coldwater1 = $34, 
            calculated_vodovidvedennya2 = $35, calculated_central_heating3 = $36, calculated_remfond4 = $37, 
            transfer_coldwater1 = $38, transfer_vodovidvedennya2 = $39, transfer_central_heating3 = $40, 
            transfer_remfond4 = $41, payment_coldwater1 = $42, payment_vodovidvedennya2 = $43, 
            payment_central_heating3 = $44, payment_remfond4 = $45 
            WHERE login = $46`,
          [password, totalArea, nonlivarea, inhabnum, housetariff, storagetariff, debtOverpayHouse, debtOverpayStorage, 
           debtOverpayTotal, paidMonthHouse, paidMonthStorage, paidMonthTotal, calculatedHouse, calculatedStorage, 
           calculatedTotal, transferHouse, transferStorage, transferTotal, penya, paymentHouse, paymentStorage, 
           paymentTotal, tariffColdWater1, tariffVodovidvedennya2, tariffCentralHeating3, debtOverpayColdWater1, 
           debtOverpayVodovidvedennya2, debtOverpayCentralHeating3, debtOverpayRemFond4, paidMonthColdWater1, 
           paidMonthVodovidvedennya2, paidMonthCentralHeating3, paidMonthRemFond4, calculatedColdWater1, 
           calculatedVodovidvedennya2, calculatedCentralHeating3, calculatedRemFond4, transferColdWater1, 
           transferVodovidvedennya2, transferCentralHeating3, transferRemFond4, paymentColdWater1, paymentVodovidvedennya2, 
           paymentCentralHeating3, paymentRemFond4, login]
        );        
      } else {
        // Если пользователя нет, добавляем новую запись
        await pool.query(
          `INSERT INTO public.users 
          (login, password, total_area, nonlivarea, inhabnum, housetariff, storagetariff, debt_overpay_house, 
          debt_overpay_storage, debt_overpay_total, paid_month_house, paid_month_storage, paid_month_total, 
          calculated_house, calculated_storage, calculated_total, transfer_house, transfer_storage, transfer_total, 
          penya, payment_house, payment_storage, payment_total, tariff_coldwater1, tariff_vodovidvedennya2, 
          tariff_central_heating3, debt_overpay_coldwater1, debt_overpay_vodovidvedennya2, debt_overpay_central_heating3, 
          debt_overpay_remfond4, paid_month_coldwater1, paid_month_vodovidvedennya2, paid_month_central_heating3, 
          paid_month_remfond4, calculated_coldwater1, calculated_vodovidvedennya2, calculated_central_heating3, 
          calculated_remfond4, transfer_coldwater1, transfer_vodovidvedennya2, transfer_central_heating3, transfer_remfond4, 
          payment_coldwater1, payment_vodovidvedennya2, payment_central_heating3, payment_remfond4) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 
                  $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43,  $44, $45, $46)`,
          [login, password, totalArea, nonlivarea, inhabnum, housetariff, storagetariff, debtOverpayHouse, debtOverpayStorage, 
          debtOverpayTotal, paidMonthHouse, paidMonthStorage, paidMonthTotal, calculatedHouse, calculatedStorage, 
          calculatedTotal, transferHouse, transferStorage, transferTotal, penya, paymentHouse, paymentStorage, 
          paymentTotal, tariffColdWater1, tariffVodovidvedennya2, tariffCentralHeating3, debtOverpayColdWater1, 
          debtOverpayVodovidvedennya2, debtOverpayCentralHeating3, debtOverpayRemFond4, paidMonthColdWater1, 
          paidMonthVodovidvedennya2, paidMonthCentralHeating3, paidMonthRemFond4, calculatedColdWater1, 
          calculatedVodovidvedennya2, calculatedCentralHeating3, calculatedRemFond4, transferColdWater1, 
          transferVodovidvedennya2, transferCentralHeating3, transferRemFond4, paymentColdWater1, paymentVodovidvedennya2, 
          paymentCentralHeating3, paymentRemFond4]
        );
      }
    }

    // Удаление файла после успешной обработки
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });

    res.status(200).json({ message: 'CSV file processed successfully and data updated' });
  } catch (error) { 
    console.error('Error processing file:', error);

    // Удаление файла при возникновении ошибки
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file after processing error:', err);
      } else {
        console.log('File deleted after error');
      }
    });

    res.status(500).send('Error processing CSV file');
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
  