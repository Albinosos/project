CREATE DATABASE FluffyBall;
-- Таблиця для зберігання інформації про користувачів
CREATE  TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);



CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT,
     expires DATETIME,
     data TEXT, 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON sessions(user_id);


-- Таблиця для зберігання інформації про профілі користувачів
CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    full_name VARCHAR(100),
    about_me TEXT,
    avatar_url VARCHAR(255),
    age INT,
    art_style_description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id_profile ON user_profiles(user_id);

-- Таблиця для зберігання інформації про творчі роботи
CREATE TABLE artworks (
    artwork_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category TEXT,
    genre TEXT,
    photo VARCHAR(255),
    is_for_sale BOOLEAN DEFAULT FALSE,
    is_auction_item BOOLEAN DEFAULT FALSE,
    is_portfolio_item BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id_artworks ON artworks(user_id);

-- Таблиця для зберігання інформації про аукціони
CREATE TABLE auctions (
    auction_id INT PRIMARY KEY AUTO_INCREMENT,
    artwork_id INT UNIQUE,
    start_price DECIMAL(10, 2) NOT NULL,
    end_price DECIMAL(10, 2),
    current_price DECIMAL(10, 2),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    bid_increment DECIMAL(10, 2) NOT NULL,  -- Розмір збільшення суми аукціону при новій ставці
    description TEXT,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE INDEX idx_artwork_id_auctions ON auctions(artwork_id);

-- Таблиця для зберігання інформації про ставки в аукціонах
CREATE TABLE bids (
    bid_id INT PRIMARY KEY AUTO_INCREMENT,
    auction_id INT,
    user_id INT,
    bid_amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_auction_id_bids ON bids(auction_id);
CREATE INDEX idx_user_id_bids ON bids(user_id);


-- Таблиця для зберігання інформації про роботи по фіксованій ціні
CREATE TABLE fixed_price_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    artwork_id INT UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE INDEX idx_artwork_id_fixed_price ON fixed_price_items(artwork_id);


-- Таблиця для зберігання інформації про покупки творчих робіт
CREATE TABLE purchases (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT,
    artwork_id INT,
    purchase_price DECIMAL(10, 2),
    purchase_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE INDEX idx_buyer_id_purchases ON purchases(buyer_id);
CREATE INDEX idx_artwork_id_purchases ON purchases(artwork_id);

-- Таблиця для зберігання інформації про повідомлення між користувачами
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT,  -- Ідентифікатор користувача, який відправив повідомлення
    receiver_id INT,  -- Ідентифікатор користувача, який отримав повідомлення
    artwork_id INT, -- Ідентифікатор творчої роботи, з якою пов'язане повідомлення
    content TEXT,
    send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE INDEX idx_sender_id_messages ON messages(sender_id);
CREATE INDEX idx_receiver_id_messages ON messages(receiver_id);
CREATE INDEX idx_artwork_id_messages ON messages(artwork_id);

-- Таблиця для зберігання оцінок та відгуків
CREATE TABLE ratings_and_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_id INT,
    rated_user_id INT,
    artwork_id INT,
    rating INT,
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (rated_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE
);

CREATE INDEX idx_reviewer_id_ratings ON ratings_and_reviews(reviewer_id);
CREATE INDEX idx_rated_user_id_ratings ON ratings_and_reviews(rated_user_id);
CREATE INDEX idx_artwork_id_ratings ON ratings_and_reviews(artwork_id);

-- Таблиця для зберігання сповіщень
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT 0,
    notification_type ENUM('Purchase', 'Review', 'Other') DEFAULT 'Other', --  поле для типу сповіщення
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id_notifications ON notifications(user_id);

