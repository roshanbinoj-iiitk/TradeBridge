-- =========================
-- Product Rental System SQL
-- =========================

-- Drop existing tables (for reset)
DROP TABLE IF EXISTS Ratings, ProductImages, Transaction, Product, Admin, Lender, Borrower, "User" CASCADE;

-- =========================
-- USER TABLE (roles included)
-- =========================
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Borrower', 'Lender', 'Admin')),
    password_hash TEXT NOT NULL
);

INSERT INTO "User" (name, contact, email, role, password_hash) VALUES
('Alice Borrower', '1234567890', 'alice@example.com', 'Borrower', 'hashed_pw_1'),
('Bob Lender', '9876543210', 'bob@example.com', 'Lender', 'hashed_pw_2'),
('Charlie Admin', '5554443322', 'charlie@example.com', 'Admin', 'hashed_pw_3');

-- =========================
-- BORROWER
-- =========================
CREATE TABLE Borrower (
    borrower_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    required_rating VARCHAR(10),
    start_date DATE,
    end_date DATE
);

INSERT INTO Borrower (name, contact, required_rating, start_date, end_date) VALUES
('Alice Borrower', '1234567890', '4.5', '2025-08-01', '2025-08-10');

-- =========================
-- LENDER
-- =========================
CREATE TABLE Lender (
    lender_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    contact VARCHAR(50),
    account_number VARCHAR(30)
);

INSERT INTO Lender (name, age, contact, account_number) VALUES
('Bob Lender', 35, '9876543210', 'ACCT-001');

-- =========================
-- ADMIN
-- =========================
CREATE TABLE Admin (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO Admin (name, email) VALUES
('Charlie Admin', 'charlie@example.com');

-- =========================
-- PRODUCT
-- =========================
CREATE TABLE Product (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    value NUMERIC(10,2),
    condition VARCHAR(50),
    availability BOOLEAN,
    lender_id INT REFERENCES Lender(lender_id) ON DELETE CASCADE
);

INSERT INTO Product (name, category, value, condition, availability, lender_id) VALUES
('Camera Canon EOS', 'Electronics', 500.00, 'Good', TRUE, 1),
('Mountain Bike', 'Sports', 1200.00, 'Excellent', TRUE, 1);

-- =========================
-- TRANSACTION
-- =========================
CREATE TABLE Transaction (
    transaction_id SERIAL PRIMARY KEY,
    borrower_id INT REFERENCES Borrower(borrower_id) ON DELETE CASCADE,
    lender_id INT REFERENCES Lender(lender_id) ON DELETE CASCADE,
    product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    status VARCHAR(50)
);

INSERT INTO Transaction (borrower_id, lender_id, product_id, amount, status) VALUES
(1, 1, 1, 50.00, 'Pending');

-- =========================
-- PRODUCT IMAGES
-- =========================
CREATE TABLE ProductImages (
    image_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
    image_url TEXT
);

INSERT INTO ProductImages (product_id, image_url) VALUES
(1, 'https://example.com/camera.jpg'),
(2, 'https://example.com/bike.jpg');

-- =========================
-- RATINGS
-- =========================
CREATE TABLE Ratings (
    rating_id SERIAL PRIMARY KEY,
    lender_id INT REFERENCES Lender(lender_id) ON DELETE CASCADE,
    borrower_id INT REFERENCES Borrower(borrower_id) ON DELETE CASCADE,
    score NUMERIC(2,1),
    review TEXT
);

INSERT INTO Ratings (lender_id, borrower_id, score, review) VALUES
(1, 1, 4.8, 'Great communication and quick return.');
