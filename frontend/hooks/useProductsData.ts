import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/lib/messages";
import type { Product } from "@/types/db";
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from "@/lib/products/constants";
import {
  getProductImage,
  getCategoryLabel,
  getCategoryCount,
  getConditionCount,
  buildAvailableCategories,
  buildAvailableConditions,
  buildCategoryURL,
  parseCategoryFromURL,
} from "@/lib/products/utils";
import {
  filterProducts,
  sortProducts,
  getInitialPriceRange,
} from "@/lib/products/filters";

export function useProductsData(user: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("name");

  // UI states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Categories and conditions - use utility functions to build from data
  const [availableCategories, setAvailableCategories] = useState(CATEGORIES);
  const [availableConditions, setAvailableConditions] = useState(CONDITIONS);

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

  // Initialize from URL params
  useEffect(() => {
    try {
      const q = searchParams?.get("search") || "";
      if (q !== searchTerm) {
        setSearchTerm(q);
      }

      const categoryParam = searchParams?.get("category") || "";
      if (categoryParam && categoryParam !== selectedCategory) {
        const mappedCategory = parseCategoryFromURL(categoryParam);
        setSelectedCategory(mappedCategory);
      }
    } catch (e) {
      console.error("Error parsing URL parameters:", e);
    }
  }, [searchParams, searchTerm, selectedCategory]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
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
        // Use mock data as fallback
        setProducts([]);
        return;
      }

      setProducts((data as Product[]) || []);

      // Build available categories and conditions from actual data
      if (data && data.length > 0) {
        setAvailableCategories(buildAvailableCategories(data as Product[]));
        setAvailableConditions(buildAvailableConditions(data as Product[]));

        // Set price range based on actual data
        const [minPrice, maxPrice] = getInitialPriceRange(data as Product[]);
        setPriceRange([minPrice, maxPrice]);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const filters = {
      searchTerm,
      selectedCategory,
      selectedCondition,
      priceRange,
      sortBy,
      showTrending: false,
      showFavorites: false,
      showRatingFilter: false,
      showAvailabilityFilter: false,
    };

    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, sortBy);
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedCondition,
    priceRange,
    sortBy,
  ]);

  // Helper functions
  const toggleFavorite = (productId: number, e: React.MouseEvent) => {
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
  };

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.product_id !== product.product_id);
      const newRecent = [product, ...filtered].slice(0, 5);
      localStorage.setItem("recentlyViewed", JSON.stringify(newRecent));
      return newRecent;
    });
  };

  const handleMessageLender = async (product: Product, e: React.MouseEvent) => {
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
  };

  // Helper functions - use imported utility functions
  const getCategoryCountWrapper = (categoryValue: string) => {
    return getCategoryCount(products, categoryValue);
  };

  const getConditionCountWrapper = (conditionValue: string) => {
    return getConditionCount(products, conditionValue);
  };

  const getCategoryLabelWrapper = (category: string) => {
    return getCategoryLabel(category);
  };

  const getProductImageWrapper = (product: Product) => {
    return getProductImage(product);
  };

  const updateURL = (newCategory?: string, newSearch?: string) => {
    const params = new URLSearchParams();
    const category = newCategory ?? selectedCategory;
    const search = newSearch ?? searchTerm;

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSortBy("name");
    if (products.length > 0) {
      const [minPrice, maxPrice] = getInitialPriceRange(products);
      setPriceRange([minPrice, maxPrice]);
    }
    updateURL("all", "");
  };

  const getActiveFilterCount = () => {
    return [
      selectedCategory !== "all" ? 1 : 0,
      selectedCondition !== "all" ? 1 : 0,
      searchTerm ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  };

  return {
    // Data
    products,
    filteredProducts,
    loading,
    error,

    // Filter state
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,

    // UI state
    viewMode,
    setViewMode,
    favorites,
    recentlyViewed,
    showFilters,
    setShowFilters,

    // Options
    availableCategories,
    availableConditions,

    // Actions
    toggleFavorite,
    addToRecentlyViewed,
    handleMessageLender,
    updateURL,
    clearFilters,

    // Helpers
    getProductImage: getProductImageWrapper,
    getCategoryLabel: getCategoryLabelWrapper,
    getCategoryCount: getCategoryCountWrapper,
    getConditionCount: getConditionCountWrapper,
    getActiveFilterCount,
  };
}
