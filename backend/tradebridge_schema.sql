-- Users table (already exists)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    contact VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20),
    password_hash VARCHAR(255)
);

-- Products table: includes price, description, images, and rental period
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price NUMERIC(10,2),
    category VARCHAR(50),
    value NUMERIC(10,2),
    condition VARCHAR(50),
    availability BOOLEAN DEFAULT TRUE,
    lender_id INTEGER REFERENCES users(user_id),
    start_date DATE,
    end_date DATE
);

-- Product images table
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id),
    image_url TEXT
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    borrower_id INTEGER REFERENCES users(user_id),
    lender_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES products(product_id),
    amount NUMERIC(10,2),
    status VARCHAR(20),
    start_date DATE,
    end_date DATE
);

-- Ratings table
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    lender_id INTEGER REFERENCES users(user_id),
    borrower_id INTEGER REFERENCES users(user_id),
    score INTEGER,
    review TEXT
);
