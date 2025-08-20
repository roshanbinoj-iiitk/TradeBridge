// types/db.ts

export interface Profile {
  id: string; // uuid
  name: string;
  contact?: string;
  role: "lender" | "borrower" | "admin";
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  lender_id: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  value?: number;
  condition?: string;
  availability: boolean;
  images?: ProductImage[];
  lender?: Profile;
}

export interface Transaction {
  transaction_id: number;
  product_id: number;
  borrower_id: string;
  lender_id: string;
  start_date?: string;
  end_date?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  product?: Product;
  borrower?: Profile;
  lender?: Profile;
}

export interface Rating {
  rating_id: number;
  transaction_id: number;
  rater_id: string;
  ratee_id: string;
  rating: number;
  comment?: string;
  transaction?: Transaction;
  rater?: Profile;
  ratee?: Profile;
}
