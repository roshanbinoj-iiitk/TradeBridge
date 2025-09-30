import { Product } from "@/types/db";

export interface ProductFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedCondition: string;
  priceRange: number[];
  sortBy: string;
  showTrending: boolean;
  showFavorites: boolean;
  showRatingFilter: boolean;
  showAvailabilityFilter: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface ProductPageState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  viewMode: "grid" | "list";
  favorites: Set<number>;
  recentlyViewed: Product[];
  selectedProduct: Product | null;
  showFilters: boolean;
  showRecentlyViewed: boolean;
  availableCategories: CategoryOption[];
  availableConditions: CategoryOption[];
}

export interface ProductActions {
  toggleFavorite: (productId: number, e: React.MouseEvent) => void;
  addToRecentlyViewed: (product: Product) => void;
  handleMessageLender: (product: Product, e: React.MouseEvent) => void;
  updateFilters: (updates: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  updateURL: (newCategory?: string, newSearch?: string) => void;
}
