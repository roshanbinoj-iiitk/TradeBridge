-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.User (
  user_id integer NOT NULL DEFAULT nextval('"User_user_id_seq"'::regclass),
  name character varying NOT NULL,
  contact character varying,
  email character varying NOT NULL UNIQUE,
  role character varying CHECK (role::text = ANY (ARRAY['Borrower'::character varying, 'Lender'::character varying, 'Admin'::character varying]::text[])),
  password_hash text NOT NULL,
  CONSTRAINT User_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.admin (
  admin_id integer NOT NULL DEFAULT nextval('admin_admin_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  user_id integer UNIQUE,
  CONSTRAINT admin_pkey PRIMARY KEY (admin_id),
  CONSTRAINT admin_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.borrower (
  borrower_id integer NOT NULL DEFAULT nextval('borrower_borrower_id_seq'::regclass),
  name character varying NOT NULL,
  contact character varying,
  required_rating character varying,
  start_date date,
  end_date date,
  user_id integer UNIQUE,
  CONSTRAINT borrower_pkey PRIMARY KEY (borrower_id),
  CONSTRAINT borrower_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.lender (
  lender_id integer NOT NULL DEFAULT nextval('lender_lender_id_seq'::regclass),
  name character varying NOT NULL,
  age integer,
  contact character varying,
  account_number character varying,
  user_id integer UNIQUE,
  CONSTRAINT lender_pkey PRIMARY KEY (lender_id),
  CONSTRAINT lender_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.product (
  product_id integer NOT NULL DEFAULT nextval('product_product_id_seq'::regclass),
  name character varying NOT NULL,
  category character varying,
  value numeric,
  condition character varying,
  availability boolean,
  lender_id integer,
  CONSTRAINT product_pkey PRIMARY KEY (product_id),
  CONSTRAINT product_lender_id_fkey FOREIGN KEY (lender_id) REFERENCES public.lender(lender_id)
);
CREATE TABLE public.productimages (
  image_id integer NOT NULL DEFAULT nextval('productimages_image_id_seq'::regclass),
  product_id integer,
  image_url text,
  CONSTRAINT productimages_pkey PRIMARY KEY (image_id),
  CONSTRAINT productimages_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id)
);
CREATE TABLE public.ratings (
  rating_id integer NOT NULL DEFAULT nextval('ratings_rating_id_seq'::regclass),
  lender_id integer,
  borrower_id integer,
  score numeric,
  review text,
  CONSTRAINT ratings_pkey PRIMARY KEY (rating_id),
  CONSTRAINT ratings_lender_id_fkey FOREIGN KEY (lender_id) REFERENCES public.lender(lender_id),
  CONSTRAINT ratings_borrower_id_fkey FOREIGN KEY (borrower_id) REFERENCES public.borrower(borrower_id)
);
CREATE TABLE public.transaction (
  transaction_id integer NOT NULL DEFAULT nextval('transaction_transaction_id_seq'::regclass),
  borrower_id integer,
  lender_id integer,
  product_id integer,
  amount numeric,
  status character varying,
  CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT transaction_borrower_id_fkey FOREIGN KEY (borrower_id) REFERENCES public.borrower(borrower_id),
  CONSTRAINT transaction_lender_id_fkey FOREIGN KEY (lender_id) REFERENCES public.lender(lender_id),
  CONSTRAINT transaction_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id)
);