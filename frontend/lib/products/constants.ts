import { CategoryOption, SortOption } from "@/types/products";

export const CATEGORIES: CategoryOption[] = [
  { value: "all", label: "All Categories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Tools", label: "Tools & Equipment" },
  { value: "Sports Equipment", label: "Sports & Recreation" },
  { value: "Outdoor Gear", label: "Outdoor & Camping" },
  { value: "Books", label: "Books & Media" },
  { value: "Musical Instruments", label: "Musical Instruments" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Home", label: "Home & Garden" },
  { value: "Fashion", label: "Clothing & Accessories" },
  { value: "Photography", label: "Photography" },
  { value: "Kitchen", label: "Kitchen & Appliances" },
  { value: "Other", label: "Other" },
];

export const CONDITIONS: CategoryOption[] = [
  { value: "all", label: "All Conditions" },
  { value: "New", label: "New" },
  { value: "Like New", label: "Like New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
  { value: "Other", label: "Other" },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "price_asc", label: "Price (Low to High)" },
  { value: "price_desc", label: "Price (High to Low)" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export const CATEGORY_URL_MAPPING: { [key: string]: string } = {
  Electronics: "electronics",
  "Tools & Equipment": "tools-equipment",
  "Sports & Recreation": "sports-recreation",
  Vehicles: "vehicles",
  "Home & Garden": "home-garden",
  "Books & Media": "books-media",
  "Clothing & Accessories": "clothing-accessories",
  "Musical Instruments": "musical-instruments",
  Photography: "photography",
  "Camping & Outdoor": "outdoor-camping",
  "Kitchen & Appliances": "kitchen-appliances",
  Other: "other",
};

export const URL_TO_CATEGORY_MAPPING: { [key: string]: string } = {
  electronics: "Electronics",
  "tools-equipment": "Tools & Equipment",
  "sports-recreation": "Sports & Recreation",
  vehicles: "Vehicles",
  "home-garden": "Home & Garden",
  "books-media": "Books & Media",
  "clothing-accessories": "Clothing & Accessories",
  "musical-instruments": "Musical Instruments",
  photography: "Photography",
  "outdoor-camping": "Camping & Outdoor",
  "kitchen-appliances": "Kitchen & Appliances",
  other: "Other",
};
