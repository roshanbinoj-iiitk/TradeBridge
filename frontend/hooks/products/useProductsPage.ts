import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types/db";
import {
  ProductFilters,
  ProductActions,
  CategoryOption,
} from "@/types/products";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/lib/messages";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import {
  buildAvailableCategories,
  buildAvailableConditions,
  buildCategoryURL,
  parseCategoryFromURL,
} from "@/lib/products/utils";
import {
  getInitialPriceRange,
  filterProducts,
  sortProducts,
} from "@/lib/products/filters";
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from "@/lib/products/constants";

export function useProductsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<
    CategoryOption[]
  >([]);
  const [availableConditions, setAvailableConditions] = useState<
    CategoryOption[]
  >([]);

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: "",
    selectedCategory: "all",
    selectedCondition: "all",
    priceRange: [0, 1000],
    sortBy: "name",
    showTrending: false,
    showFavorites: false,
    showRatingFilter: false,
    showAvailabilityFilter: false,
  });

  // Computed values
  const filteredAndSortedProducts = sortProducts(
    filterProducts(products, filters),
    filters.sortBy
  );

  // URL management
  const updateURL = (newCategory?: string, newSearch?: string) => {
    const params = new URLSearchParams();
    const category = newCategory ?? filters.selectedCategory;
    const search = newSearch ?? filters.searchTerm;

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category && category !== "all") {
      const urlCategory = buildCategoryURL(category);
      params.set("category", urlCategory);
    }

    const newURL = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.replace(newURL);
  };

  // Actions
  const actions: ProductActions = {
    toggleFavorite: (productId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(productId)) {
          newFavorites.delete(productId);
        } else {
          newFavorites.add(productId);
        }
        localStorage.setItem(
          "favorites",
          JSON.stringify(Array.from(newFavorites))
        );
        return newFavorites;
      });
    },

    addToRecentlyViewed: (product: Product) => {
      setRecentlyViewed((prev) => {
        const filtered = prev.filter(
          (p) => p.product_id !== product.product_id
        );
        const newRecent = [product, ...filtered].slice(0, 5);
        localStorage.setItem("recentlyViewed", JSON.stringify(newRecent));
        return newRecent;
      });
    },

    handleMessageLender: async (product: Product, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user || !product.lender_id) {
        router.push("/login");
        return;
      }

      try {
        await sendMessage(
          user.id,
          product.lender_id,
          `Hi! I'm interested in renting your ${product.name}. Is it still available?`,
          product.product_id
        );
        router.push("/messages");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },

    updateFilters: (updates: Partial<ProductFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },

    clearFilters: () => {
      const newFilters = {
        searchTerm: "",
        selectedCategory: "all",
        selectedCondition: "all",
        priceRange: getInitialPriceRange(products),
        sortBy: "name",
        showTrending: false,
        showFavorites: false,
        showRatingFilter: false,
        showAvailabilityFilter: false,
      };
      setFilters(newFilters);
      updateURL("all", "");
    },

    updateURL,
  };

  // Load saved data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    const savedRecentlyViewed = localStorage.getItem("recentlyViewed");

    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, []);

  // Initialize searchTerm and category from URL params
  useEffect(() => {
    try {
      const q = searchParams?.get("search") || "";
      const categoryParam = searchParams?.get("category") || "";

      const mappedCategory = categoryParam
        ? parseCategoryFromURL(categoryParam)
        : "all";

      setFilters((prev) => ({
        ...prev,
        searchTerm: q,
        selectedCategory: mappedCategory,
      }));
    } catch (e) {
      console.error("Error parsing URL parameters:", e);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            images:product_images(*),
            lender:users(*)
          `
          )
          .eq("availability", true)
          .order("name");

        if (error) {
          console.warn("Database error, using mock data:", error.message);
          // Use mock data if database fails
          const mockProducts: Product[] = [
            {
              product_id: 101,
              name: "Canon EOS R5 Camera",
              description: "Full-frame mirrorless camera, body only.",
              price: 1500.0,
              lender_id: "mock-user-1",
              start_date: "2025-09-01",
              end_date: "2026-08-31",
              category: "Electronics",
              value: 350000.0,
              condition: "Like New",
              availability: true,
              available_status: true,
              image_url: "https://placehold.co/400x250?text=Canon+Camera",
              created_at: "2025-09-01T00:00:00Z",
              lender: {
                id: 1,
                uuid: "mock-user-1",
                name: "John Doe",
                email: "john@example.com",
                role: "lender" as const,
              },
            },
            // Add more mock products as needed
          ];
          setProducts(mockProducts);
          setAvailableCategories(buildAvailableCategories(mockProducts));
          setAvailableConditions(buildAvailableConditions(mockProducts));
          setFilters((prev) => ({
            ...prev,
            priceRange: getInitialPriceRange(mockProducts),
          }));
          return;
        }

        const productsData = (data as Product[]) || [];
        setProducts(productsData);
        setAvailableCategories(buildAvailableCategories(productsData));
        setAvailableConditions(buildAvailableConditions(productsData));
        setFilters((prev) => ({
          ...prev,
          priceRange: getInitialPriceRange(productsData),
        }));
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading]);

  return {
    // State
    products,
    loading,
    error,
    authLoading,
    filters,
    viewMode,
    favorites,
    recentlyViewed,
    selectedProduct,
    showFilters,
    showRecentlyViewed,
    availableCategories,
    availableConditions,
    filteredAndSortedProducts,

    // Constants
    sortOptions: SORT_OPTIONS,

    // Setters
    setViewMode,
    setSelectedProduct,
    setShowFilters,
    setShowRecentlyViewed,

    // Actions
    ...actions,
  };
}
