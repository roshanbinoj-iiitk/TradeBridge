export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  value?: string; // Only for new products
  availability: boolean;
  start_date: Date | undefined;
  end_date: Date | undefined;
  image_urls: string[];
}

export interface ProductFormErrors {
  [key: string]: string | undefined;
}

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Tools & Equipment",
  "Sports & Recreation",
  "Vehicles",
  "Home & Garden",
  "Books & Media",
  "Clothing & Accessories",
  "Musical Instruments",
  "Photography",
  "Camping & Outdoor",
  "Kitchen & Appliances",
  "Other",
] as const;

export const PRODUCT_CONDITIONS = [
  "Brand New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];
