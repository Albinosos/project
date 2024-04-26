const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');


const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const uuid = require('uuid');  // Потрібно встановити пакет uuid


const app = express();
const port = 8080;



app.use(cors());

// Підключення до бази даних
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0118Toytoy/',
  database: 'FluffyBall',
});

// Конфігурація для збереження сесій у базі даних
const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: '0118Toytoy/',
  database: 'FluffyBall',
  clearExpired: true,
}, db);

app.use(session({
  genid: (req) => uuid.v4(),
  secret: '00111188',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
}));

db.connect((err) => {
  if (err) {
    console.error('Помилка підключення до бази даних:', err);
  } else {
    console.log('Підключено до бази даних');
  }
});

// Використовуємо body-parser для обробки POST-запитів
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Реєстрація користувача
app.post('/register', cors(), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Перевірка чи існує користувач з таким же іменем чи поштою
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const existingUser = await db.promise().query(checkUserQuery, [username, email]);

    if (existingUser[0].length > 0) {
        console.log('Користувач з таким іменем чи поштою вже існує');
      return res.status(400).json({ message: 'Користувач з таким іменем чи поштою вже існує' });
    }

    // Хешування паролю
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додавання нового користувача до бази даних
const insertUserQuery = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
const result = await db.promise().query(insertUserQuery, [username, email, hashedPassword]);


// Отримуємо ID нового користувача
const userId = result[0].insertId;

// Зберігаємо ідентифікатор сесії
req.session.userId = userId;

// Створюємо профіль для користувача
const createProfileQuery = 'INSERT INTO user_profiles (user_id, full_name) VALUES (?, ?)';
await db.promise().query(createProfileQuery, [userId, username]);


// Отримуємо ідентифікатор сесії
const sessionId = req.sessionID;
const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);
const insertSessionQuery = 'INSERT INTO sessions (session_id, user_id, expires, data) VALUES (?, ?, ?, ?)';
await db.promise().query(insertSessionQuery, [sessionId, userId, expirationTime, JSON.stringify(req.session)]);


// Додайте цей рядок для виведення хеша паролю
console.log('Hashed Password:', hashedPassword);

return res.status(200).json({ message: 'Користувач успішно зареєстрований' });

  } catch (err) {
    console.error('Помилка при реєстрації користувача:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Авторизація користувача
app.post('/login', cors(), async (req, res) => {
  const { username, password } = req.body;

  try {
    // Перевірка користувача за іменем
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    const user = await db.promise().query(checkUserQuery, [username]);

    if (user[0].length === 0) {
      return res.status(401).json({ message: 'Невірне імя користувача чи пароль' });
    }

    // Перевірка паролю
    const passwordMatch = await bcrypt.compare(password, user[0][0].password_hash);


    if (!passwordMatch) {
        console.log('Невірне імя користувача чи пароль');
      return res.status(401).json({ message: 'Невірне імя користувача чи пароль' });
    }

    // Зберігаємо ідентифікатор сесії
    req.session.userId = user[0][0].user_id;

    // Видаляємо попередню сесію користувача
    const deletePreviousSessionQuery = 'DELETE FROM sessions WHERE user_id = ?';
    await db.promise().query(deletePreviousSessionQuery, [req.session.userId]);

    // Отримуємо ідентифікатор сесії
    const sessionId = req.sessionID;
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);
    const insertSessionQuery = 'INSERT INTO sessions (session_id, user_id, expires, data) VALUES (?, ?, ?, ?)';
    await db.promise().query(insertSessionQuery, [sessionId, req.session.userId, expirationTime, JSON.stringify(req.session)]);


     // URL профілю користувача
     const profileUrl = `/profile/${req.session.userId}`;
     console.log('profileUrl:', profileUrl);

    console.log('Авторизація успішна');
    return res.status(200).json({ message: 'Авторизація успішна' });
  } catch (err) {
    console.error('Помилка при авторизації користувача:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});




// Маршрут для збереження змін профілю
app.post('/saveProfileChanges', cors(), async (req, res) => {
  try {
    // Отримати ідентифікатор останнього зареєстрованого користувача
    const getLastRegisteredUserQuery = 'SELECT user_id FROM sessions ORDER BY expires  DESC LIMIT 1';
    const lastRegisteredUser = await db.promise().query(getLastRegisteredUserQuery);

    if (lastRegisteredUser[0].length === 0) {
      return res.status(404).json({ message: 'Користувачі не знайдені' });
    }

    const lastRegisteredUserId = lastRegisteredUser[0][0].user_id;
    console.log("lastRegisteredUserId: ", lastRegisteredUserId);

    const { newPhoto, newUsername, newAge, newArtStyle, newDescription } = req.body;
    console.log(req.body);


// Отримати поточні значення з бази даних
const getCurrentProfileQuery = 'SELECT * FROM user_profiles WHERE user_id = ?';
const currentProfile = await db.promise().query(getCurrentProfileQuery, [lastRegisteredUserId]);

if (currentProfile[0].length === 0) {
  return res.status(404).json({ message: 'Профіль не знайдено' });
}

// Перевірити, які значення змінено і використати їх для оновлення
const updatedFields = {
  avatar_url: newPhoto || currentProfile[0][0].avatar_url,
  full_name: newUsername || currentProfile[0][0].full_name,
  age: newAge || currentProfile[0][0].age,
  art_style_description: newArtStyle ? newArtStyle.join(', ') : currentProfile[0][0].art_style_description,
  about_me: newDescription || currentProfile[0][0].about_me,
  // Додайте інші поля за необхідності
};


// Оновлення інформації профілю користувача
const updateProfileQuery = 'UPDATE user_profiles SET ? WHERE user_id = ?';
await db.promise().query(updateProfileQuery, [updatedFields, lastRegisteredUserId]);



    return res.status(200).json({ message: 'Зміни збережено успішно' });
  } catch (err) {
    console.error('Помилка при збереженні змін профілю:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});

// ...

// Маршрут для отримання інформації про користувача
app.get('/profile', cors(), async (req, res) => {
  try {
    // Отримати ідентифікатор останнього зареєстрованого користувача
    const getLastRegisteredUserQuery = 'SELECT user_id FROM sessions ORDER BY expires  DESC LIMIT 1';
    const lastRegisteredUser = await db.promise().query(getLastRegisteredUserQuery);

    if (lastRegisteredUser[0].length === 0) {
      return res.status(404).json({ message: 'Користувачі не знайдені' });
    }

    const lastRegisteredUserId = lastRegisteredUser[0][0].user_id;
    console.log("lastRegisteredUserId: ", lastRegisteredUserId);

    // Отримати дані профілю з бази даних
    const getProfileQuery = 'SELECT * FROM user_profiles WHERE user_id = ?';
    const userProfile = await db.promise().query(getProfileQuery, [lastRegisteredUserId]);

    if (userProfile[0].length === 0) {
      return res.status(404).json({ message: 'Профіль не знайдено' });
    }

    return res.status(200).json({ userProfile: userProfile[0][0] });
  } catch (err) {
    console.error('Помилка при отриманні профілю користувача:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});


app.post('/addArtwork', cors(), async (req, res) => {
  try {
    // Отримати ідентифікатор останнього зареєстрованого користувача
    const getLastRegisteredUserQuery = 'SELECT user_id FROM sessions ORDER BY expires  DESC LIMIT 1';
    const lastRegisteredUser = await db.promise().query(getLastRegisteredUserQuery);

    if (lastRegisteredUser[0].length === 0) {
      return res.status(404).json({ message: 'Користувачі не знайдені' });
    }

    const lastRegisteredUserId = lastRegisteredUser[0][0].user_id;
    console.log("lastRegisteredUserId: ", lastRegisteredUserId);

    

      const { title, description, category, genre, photo, is_for_sale, is_auction_item, is_portfolio_item, sale_price, 
        start_price, max_price, bid_price, auction_duration} = req.body;
              
              console.log("req.body: ", req.body);

              const isForSale = is_for_sale === 'true' ? 1 : 0;
              const isAuctionItem = is_auction_item === 'true' ? 1 : 0;
              const isportfolioitem = is_portfolio_item === 'true' ? 1 : 0;

      // Додайте логіку для збереження даних про творчу роботу в базу даних
    
      const addArtworkQuery = 'INSERT INTO artworks (user_id, title, description, category, genre, photo, is_for_sale, is_auction_item, is_portfolio_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const [result] = await db.promise().query(addArtworkQuery, [lastRegisteredUserId, title, description, category, genre, photo, isForSale, isAuctionItem, isportfolioitem]);
      const artworkId = result.insertId;

      // Ви можете також додати дані в інші таблиці (наприклад, аукціони чи фіксовані ціни) в залежності від умов
      if (isAuctionItem) {
  
        const addAuctionQuery = 'INSERT INTO auctions (artwork_id, start_price, end_price, current_price, start_time, end_time, bid_increment, description) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?)';
        const [result] = await db.promise().query(addAuctionQuery, [artworkId, start_price, max_price, start_price, auction_duration, bid_price, description]);

// Вираховуємо дату закінчення аукціону на основі обраного терміну
const auctionId = result.insertId;
const getAuctionEndTimeQuery = 'SELECT DATE_ADD(start_time, INTERVAL ? DAY) AS end_time FROM auctions WHERE auction_id = ?';
const [endTimeResult] = await db.promise().query(getAuctionEndTimeQuery, [auction_duration, auctionId]);

const endTime = endTimeResult[0].end_time;
console.log("Auction end time:", endTime);



      } else if (isForSale) {
  
        const addFixedPriceItemQuery = 'INSERT INTO fixed_price_items (artwork_id, price, description) VALUES (?, ?, ?)';
        await db.promise().query(addFixedPriceItemQuery, [artworkId, sale_price, description]);
      }

      return res.status(200).json({ message: 'Творчу роботу додано успішно' });
  } catch (err) {
      console.error('Помилка при додаванні творчої роботи:', err);
      return res.status(500).json({ message: 'Помилка сервера' });
  }
});

/////////////////

// Маршрут для отримання робіт користувача
app.get('/myWorks', cors(), async (req, res) => {
  try {
      // Отримати ідентифікатор останнього зареєстрованого користувача
    const getLastRegisteredUserQuery = 'SELECT user_id FROM sessions ORDER BY expires  DESC LIMIT 1';
    const lastRegisteredUser = await db.promise().query(getLastRegisteredUserQuery);

    if (lastRegisteredUser[0].length === 0) {
      return res.status(404).json({ message: 'Користувачі не знайдені' });
    }

    const lastRegisteredUserId = lastRegisteredUser[0][0].user_id;
    console.log("lastRegisteredUserId: ", lastRegisteredUserId);

      // Отримати роботи користувача з бази даних
      const getMyWorksQuery = 'SELECT * FROM artworks WHERE user_id = ?';
      const myWorks = await db.promise().query(getMyWorksQuery, [lastRegisteredUserId]);

     // Для кожної роботи перевірте тип і витягніть додаткові дані з відповідних таблиць
    const myWorksData = [];
    for (const work of myWorks[0]) {
      if (work.is_auction_item) {
        const getAuctionDataQuery = 'SELECT * FROM auctions WHERE artwork_id = ?';
        const [auctionData] = await db.promise().query(getAuctionDataQuery, [work.artwork_id]);
        work.auctionData = auctionData[0];
        
      } else if (work.is_for_sale) {
        const getSaleDataQuery = 'SELECT * FROM fixed_price_items WHERE artwork_id = ?';
        const [saleData] = await db.promise().query(getSaleDataQuery, [work.artwork_id]);
        work.saleData = saleData[0];
        
      }
      myWorksData.push(work);
    }

    return res.status(200).json({ myWorks: myWorksData });
  } catch (err) {
    console.error('Помилка при отриманні робіт користувача:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});




/////////////////\\


// Маршрут для отримання всіх творчих робіт
app.get('/allArtworks', cors(), async (req, res) => {
  try {
    // Отримати всі творчі роботи з бази даних
    const getAllArtworksQuery = 'SELECT * FROM artworks';
    const allArtworks = await db.promise().query(getAllArtworksQuery);

    // Для кожної роботи перевірте тип і витягніть додаткові дані з відповідних таблиць
    const allArtworksData = [];
    for (const work of allArtworks[0]) {
      if (work.is_auction_item) {
        const getAuctionDataQuery = 'SELECT * FROM auctions WHERE artwork_id = ?';
        const [auctionData] = await db.promise().query(getAuctionDataQuery, [work.artwork_id]);
        work.auctionData = auctionData[0];
        
      } else if (work.is_for_sale) {
        const getSaleDataQuery = 'SELECT * FROM fixed_price_items WHERE artwork_id = ?';
        const [saleData] = await db.promise().query(getSaleDataQuery, [work.artwork_id]);
        work.saleData = saleData[0];
        
      }
      allArtworksData.push(work);
    }

    return res.status(200).json({ allArtworks: allArtworksData });
  } catch (err) {
    console.error('Помилка при отриманні всіх творчих робіт:', err);
    return res.status(500).json({ message: 'Помилка сервера' });
  }
});


/////////////////////\


// Маршрут для зроблення ставки
app.post('/makeBid', cors(), async (req, res) => {
  try {
    // Отримати ідентифікатор останнього зареєстрованого користувача
    const getLastRegisteredUserQuery = 'SELECT user_id FROM sessions ORDER BY expires  DESC LIMIT 1';
    const lastRegisteredUser = await db.promise().query(getLastRegisteredUserQuery);

    if (lastRegisteredUser[0].length === 0) {
      return res.status(404).json({ message: 'Користувачі не знайдені' });
    }

    const lastRegisteredUserId = lastRegisteredUser[0][0].user_id;
    console.log("lastRegisteredUserId: ", lastRegisteredUserId);

      const { auctionId, bidAmount } = req.body;
      console.log("req.body: ", req.body);

      

    // Перевірка, чи аукціон існує та чи користувач ввійшов у систему (ваш код входу користувача може відрізнятися)
    const checkAuctionQuery = 'SELECT * FROM auctions WHERE auction_id = ?';
    const [auctionResult] = await db.promise().query(checkAuctionQuery, [auctionId]);

    if (auctionResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Аукціон не знайдено' });
    }

      // Додавання ставки до таблиці bids
      const addBidQuery = 'INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)';
      const [bidResult] = await db.promise().query(addBidQuery, [auctionId, lastRegisteredUserId, bidAmount]);

      if (bidResult.insertId) {
          // Оновлення поточної ціни в аукціоні
          const updateAuctionPriceQuery = 'UPDATE auctions SET current_price = current_price + ? WHERE auction_id = ?';
          await db.promise().query(updateAuctionPriceQuery, [bidAmount, auctionId]);

          return res.status(200).json({ success: true, message: 'Ставка прийнята' });
      } else {
          return res.status(500).json({ success: false, message: 'Помилка при додаванні ставки' });
      }
  } catch (err) {
      console.error('Помилка при зробленні ставки:', err);
      return res.status(500).json({ success: false, message: 'Помилка сервера' });
  }
});





app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});