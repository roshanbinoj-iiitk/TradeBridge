-- USERS TABLE
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  contact VARCHAR,
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL
);

-- PRODUCTS TABLE
CREATE TABLE public.products (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  lender_id INTEGER NOT NULL REFERENCES public.users(id),
  start_date DATE,
  end_date DATE,
  category VARCHAR,
  value NUMERIC,
  condition VARCHAR,
  availability BOOLEAN DEFAULT TRUE
);

-- PRODUCT IMAGES TABLE
CREATE TABLE public.product_images (
  image_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  image_url TEXT NOT NULL
);

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  transaction_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  borrower_id INTEGER NOT NULL REFERENCES public.users(id),
  lender_id INTEGER NOT NULL REFERENCES public.users(id),
  start_date DATE,
  end_date DATE,
  status VARCHAR DEFAULT 'pending'
);

-- RATINGS TABLE
CREATE TABLE public.ratings (
  rating_id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES public.transactions(transaction_id),
  rater_id INTEGER NOT NULL REFERENCES public.users(id),
  ratee_id INTEGER NOT NULL REFERENCES public.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);
