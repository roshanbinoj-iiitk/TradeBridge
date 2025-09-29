import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Heart,
  Eye,
  Grid3X3,
  List,
  Clock,
  TrendingUp,
  Shield,
  Users,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState, useMemo } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/lib/messages";
import type { Product } from "@/types/db";

export default function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [availableCategories, setAvailableCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [availableConditions, setAvailableConditions] = useState<
    { value: string; label: string }[]
  >([]);

  // New feature states
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showTrending, setShowTrending] = useState(false);

  const { user, loading: authLoading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Predefined categories for better UX - matched to actual database values
  const categories = [
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

  const conditions = [
    { value: "all", label: "All Conditions" },
    { value: "New", label: "New" },
    { value: "Like New", label: "Like New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" },
    { value: "Other", label: "Other" },
  ];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
    { value: "price_asc", label: "Price (Low to High)" },
    { value: "price_desc", label: "Price (High to Low)" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
  ];

  // New feature functions
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
      // Save to localStorage
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
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    try {
      // Send initial message about interest in the product
      await sendMessage(
        user.id,
        product.lender_id,
        `Hi! I'm interested in renting your ${product.name}. Is it still available?`,
        product.product_id
      );

      // Redirect to messages page
      router.push("/messages");
    } catch (error) {
      console.error("Error sending message:", error);
      // Could show a toast notification here
    }
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

  // Initialize searchTerm from ?search=... in the URL so visiting
  // /products?search=camera filters immediately.
  useEffect(() => {
    try {
      const q = searchParams?.get("search") || "";
      if (q !== searchTerm) {
        setSearchTerm(q);
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          // If database connection fails, use mock data for testing
          console.warn("Database error, using mock data:", error.message);
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
            {
              product_id: 102,
              name: "DJI Mavic Air 2 Drone",
              description: "Compact drone with 4K video capability.",
              price: 1200.5,
              lender_id: "mock-user-2",
              category: "Electronics",
              condition: "Good",
              availability: true,
              available_status: true,
              image_url: "https://placehold.co/400x250?text=DJI+Drone",
              created_at: "2025-09-01T00:00:00Z",
              lender: {
                id: 2,
                uuid: "mock-user-2",
                name: "Jane Smith",
                email: "jane@example.com",
                role: "lender" as const,
              },
            },
            {
              product_id: 103,
              name: "Bosch Hammer Drill",
              description: "Heavy-duty corded hammer drill.",
              price: 500.0,
              lender_id: "mock-user-3",
              category: "Tools",
              condition: "Good",
              availability: true,
              available_status: true,
              image_url: "https://placehold.co/400x250?text=Hammer+Drill",
              created_at: "2025-09-01T00:00:00Z",
              lender: {
                id: 3,
                uuid: "mock-user-3",
                name: "Bob Johnson",
                email: "bob@example.com",
                role: "lender" as const,
              },
            },
            {
              product_id: 104,
              name: "Coleman 6-Person Tent",
              description: "Spacious dome tent for family camping trips.",
              price: 800.75,
              lender_id: "mock-user-4",
              category: "Outdoor Gear",
              condition: "Fair",
              availability: true,
              available_status: true,
              image_url: "https://placehold.co/400x250?text=Camping+Tent",
              created_at: "2025-09-01T00:00:00Z",
              lender: {
                id: 4,
                uuid: "mock-user-4",
                name: "Alice Brown",
                email: "alice@example.com",
                role: "lender" as const,
              },
            },
            {
              product_id: 105,
              name: "Mountain Bike - Trek Marlin 5",
              description:
                "29-inch wheels, size M frame. Perfect for trail riding.",
              price: 950.0,
              lender_id: "mock-user-5",
              category: "Sports Equipment",
              condition: "Like New",
              availability: true,
              available_status: true,
              image_url: "https://placehold.co/400x250?text=Mountain+Bike",
              created_at: "2025-09-01T00:00:00Z",
              lender: {
                id: 5,
                uuid: "mock-user-5",
                name: "Charlie Wilson",
                email: "charlie@example.com",
                role: "lender" as const,
              },
            },
          ];

          setProducts(mockProducts);

          // Set up categories and price range for mock data
          const prices = mockProducts.map((p) => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);

          // Extract unique categories from the actual data
          const uniqueCategories = Array.from(
            new Set(
              mockProducts
                .map((p) => p.category)
                .filter((cat): cat is string =>
                  Boolean(cat && cat.trim() !== "")
                )
            )
          ).sort();

          // Filter out condition values that might have been mistakenly stored as categories
          const conditionValues = [
            "New",
            "Like New",
            "Good",
            "Fair",
            "Poor",
            "new",
            "like new",
            "good",
            "fair",
            "poor",
          ];
          const validCategories = uniqueCategories.filter(
            (cat) => !conditionValues.includes(cat)
          );

          // Create a comprehensive list without duplicates
          const allCategories = [{ value: "all", label: "All Categories" }];
          const addedCategories = new Set(["all"]);

          // Add categories that exist in the data, prioritizing predefined labels
          validCategories.forEach((dbCategory) => {
            if (!addedCategories.has(dbCategory)) {
              const predefinedCategory = categories.find(
                (cat) => cat.value === dbCategory
              );
              if (predefinedCategory) {
                allCategories.push(predefinedCategory);
              } else {
                allCategories.push({ value: dbCategory, label: dbCategory });
              }
              addedCategories.add(dbCategory);
            }
          });

          setAvailableCategories(allCategories);

          // Extract and set unique conditions from mock data
          const uniqueConditions = Array.from(
            new Set(
              mockProducts
                .map((p) => p.condition)
                .filter((cond): cond is string =>
                  Boolean(cond && cond.trim() !== "")
                )
            )
          ).sort();

          // Create conditions list without duplicates
          const allConditions = [{ value: "all", label: "All Conditions" }];
          const addedConditions = new Set(["all"]);

          // Add conditions that exist in the data, prioritizing predefined labels
          uniqueConditions.forEach((dbCondition) => {
            if (!addedConditions.has(dbCondition)) {
              const predefinedCondition = conditions.find(
                (cond) => cond.value === dbCondition
              );
              if (predefinedCondition) {
                allConditions.push(predefinedCondition);
              } else {
                allConditions.push({ value: dbCondition, label: dbCondition });
              }
              addedConditions.add(dbCondition);
            }
          });

          setAvailableConditions(allConditions);
          return;
        }

        // Set initial price range based on actual data
        if (data && data.length > 0) {
          const prices = data.map((p) => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange([minPrice, maxPrice]);

          // Extract unique categories from the actual data
          const uniqueCategories = Array.from(
            new Set(
              data
                .map((p) => p.category)
                .filter((cat): cat is string =>
                  Boolean(cat && cat.trim() !== "")
                )
            )
          ).sort();

          // Filter out condition values that might have been mistakenly stored as categories
          const conditionValues = [
            "New",
            "Like New",
            "Good",
            "Fair",
            "Poor",
            "new",
            "like new",
            "good",
            "fair",
            "poor",
          ];
          const validCategories = uniqueCategories.filter(
            (cat) => !conditionValues.includes(cat)
          );

          // Create a comprehensive list without duplicates
          const allCategories = [{ value: "all", label: "All Categories" }];
          const addedCategories = new Set(["all"]);

          // Add categories that exist in the data, prioritizing predefined labels
          validCategories.forEach((dbCategory) => {
            if (!addedCategories.has(dbCategory)) {
              const predefinedCategory = categories.find(
                (cat) => cat.value === dbCategory
              );
              if (predefinedCategory) {
                allCategories.push(predefinedCategory);
              } else {
                allCategories.push({ value: dbCategory, label: dbCategory });
              }
              addedCategories.add(dbCategory);
            }
          });

          setAvailableCategories(allCategories);

          // Extract and set unique conditions from actual data
          const uniqueConditionsFromData = Array.from(
            new Set(
              data
                .map((p) => p.condition)
                .filter((cond): cond is string =>
                  Boolean(cond && cond.trim() !== "")
                )
            )
          ).sort();

          // Create conditions list without duplicates
          const allConditionsFromData = [
            { value: "all", label: "All Conditions" },
          ];
          const addedConditionsFromData = new Set(["all"]);

          // Add conditions that exist in the data, prioritizing predefined labels
          uniqueConditionsFromData.forEach((dbCondition) => {
            if (!addedConditionsFromData.has(dbCondition)) {
              const predefinedCondition = conditions.find(
                (cond) => cond.value === dbCondition
              );
              if (predefinedCondition) {
                allConditionsFromData.push(predefinedCondition);
              } else {
                allConditionsFromData.push({
                  value: dbCondition,
                  label: dbCondition,
                });
              }
              addedConditionsFromData.add(dbCondition);
            }
          });

          setAvailableConditions(allConditionsFromData);
        }

        setProducts((data as Product[]) || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    // Try to fetch products even if user is not authenticated for now
    // This will help us test the category filter functionality
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      // Category filter - improved to handle case variations and exact matches
      const matchesCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory ||
        (selectedCategory === "Other" &&
          (!product.category || product.category.trim() === ""));

      // Condition filter
      const matchesCondition =
        selectedCondition === "all" ||
        product.condition === selectedCondition ||
        (selectedCondition === "Other" &&
          (!product.condition || product.condition.trim() === ""));

      // Price filter
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return (
        matchesSearch && matchesCategory && matchesCondition && matchesPrice
      );
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.start_date || 0).getTime() -
            new Date(a.start_date || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedCondition,
    priceRange,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSortBy("name");
    if (products.length > 0) {
      const prices = products.map((p) => p.price);
      setPriceRange([
        Math.floor(Math.min(...prices)),
        Math.ceil(Math.max(...prices)),
      ]);
    }
  };

  // Helper to get a valid image URL or fallback
  function getProductImage(product: Product) {
    // First try the main image_url from products table
    if (product.image_url && product.image_url.startsWith("http")) {
      return product.image_url;
    }
    // Then try the first image from product_images
    if (
      product.images &&
      product.images.length > 0 &&
      typeof product.images[0].image_url === "string" &&
      product.images[0].image_url.startsWith("http")
    ) {
      return product.images[0].image_url;
    }
    return "https://placehold.co/400x250?text=No+Image";
  }

  // Helper function to get product count for each category
  const getCategoryCount = (categoryValue: string) => {
    if (categoryValue === "all") return products.length;
    return products.filter(
      (product) =>
        product.category === categoryValue ||
        (categoryValue === "Other" &&
          (!product.category || product.category.trim() === ""))
    ).length;
  };

  // Helper function to get product count for each condition
  const getConditionCount = (conditionValue: string) => {
    if (conditionValue === "all") return products.length;
    return products.filter(
      (product) =>
        product.condition === conditionValue ||
        (conditionValue === "Other" &&
          (!product.condition || product.condition.trim() === ""))
    ).length;
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category || category.trim() === "") return "Other";

    // First check in available categories (which includes dynamic ones)
    const allCats =
      availableCategories.length > 0 ? availableCategories : categories;
    const found = allCats.find((cat) => cat.value === category);
    return found ? found.label : category;
  };

  if (authLoading)
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
          </aside>
          <main className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet mb-4 md:mb-0">
          Browse Products
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-taupe">
            <span>{filteredProducts.length} products found</span>
            {selectedCategory !== "all" && (
              <Badge variant="outline" className="text-xs">
                Category: {getCategoryLabel(selectedCategory)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              size="sm"
            >
              <Grid3X3 className="w-4 h-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === "list"}
              onPressedChange={() => setViewMode("list")}
              size="sm"
            >
              <List className="w-4 h-4" />
            </Toggle>
          </div>
        </div>
      </div>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-taupe" />
            <h2 className="text-xl font-semibold text-jet">Recently Viewed</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((product) => (
              <Link
                key={`recent-${product.product_id}`}
                href={`/products/${product.product_id}`}
                className="flex-shrink-0"
              >
                <Card className="w-48 overflow-hidden hover:shadow-md transition-shadow">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    width={192}
                    height={120}
                    className="w-full h-24 object-cover"
                  />
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-taupe">₹{product.price}/day</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-jet">Filters</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                Clear All
                {(selectedCategory !== "all" ||
                  selectedCondition !== "all" ||
                  searchTerm) && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1">
                    {[
                      selectedCategory !== "all" ? 1 : 0,
                      selectedCondition !== "all" ? 1 : 0,
                      searchTerm ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      router.push(
                        `/products${
                          searchTerm.trim()
                            ? `?search=${encodeURIComponent(searchTerm.trim())}`
                            : ""
                        }`
                      );
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() =>
                    router.push(
                      `/products${
                        searchTerm.trim()
                          ? `?search=${encodeURIComponent(searchTerm.trim())}`
                          : ""
                      }`
                    )
                  }
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableCategories.length > 0
                      ? availableCategories
                      : categories
                    ).map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex justify-between items-center w-full">
                          <span>{category.label}</span>
                          <span className="text-xs text-taupe ml-2">
                            ({getCategoryCount(category.value)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Condition
                </label>
                <Select
                  value={selectedCondition}
                  onValueChange={setSelectedCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableConditions.length > 0
                      ? availableConditions
                      : conditions
                    ).map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        <div className="flex justify-between items-center w-full">
                          <span>{condition.label}</span>
                          <span className="text-xs text-taupe ml-2">
                            ({getConditionCount(condition.value)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Price Range:{" "}
                  <span className="font-semibold text-primary">
                    ₹{priceRange[0]}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-primary">
                    ₹{priceRange[1]}
                  </span>
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={
                    products.length > 0
                      ? Math.max(...products.map((p) => p.price))
                      : 1000
                  }
                  min={0}
                  step={10}
                  className="mt-2 custom-slider"
                  style={
                    {
                      // fallback for browsers not supporting custom classes
                      "--slider-thumb-size": "1.5rem",
                      "--slider-thumb-border": "3px solid #444",
                      "--slider-thumb-shadow": "0 2px 8px rgba(0,0,0,0.15)",
                      "--slider-track-height": "0.5rem",
                      "--slider-track-bg": "#e5e7eb",
                      "--slider-range-bg": "#44403c",
                    } as React.CSSProperties
                  }
                />
                <style jsx global>{`
                  .custom-slider .slider-thumb {
                    height: var(--slider-thumb-size) !important;
                    width: var(--slider-thumb-size) !important;
                    background: #fff;
                    border: var(--slider-thumb-border);
                    box-shadow: var(--slider-thumb-shadow);
                    transition: box-shadow 0.2s;
                  }
                  .custom-slider .slider-thumb:hover,
                  .custom-slider .slider-thumb:focus {
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
                    border-color: #d97706;
                  }
                  .custom-slider .range-track {
                    height: var(--slider-track-height);
                    background: var(--slider-track-bg);
                    border-radius: 9999px;
                  }
                  .custom-slider .range-range {
                    background: var(--slider-range-bg);
                  }
                `}</style>
              </div>

              {/* Show Favorites Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-jet">
                  Show Favorites Only
                </label>
                <Toggle
                  pressed={showTrending}
                  onPressedChange={setShowTrending}
                  size="sm"
                >
                  <Heart className="w-3 h-3" />
                </Toggle>
              </div>

              {/* Trending Products Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-jet">
                  Trending Products
                </label>
                <Toggle
                  pressed={showTrending}
                  onPressedChange={setShowTrending}
                  size="sm"
                >
                  <TrendingUp className="w-3 h-3" />
                </Toggle>
              </div>

              {/* Advanced Filters */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Rating
                </label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`rating-${rating}`}
                        className="rounded"
                      />
                      <label
                        htmlFor={`rating-${rating}`}
                        className="flex items-center text-sm"
                      >
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-taupe">& up</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Availability
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available-now"
                      className="rounded"
                    />
                    <label htmlFor="available-now" className="text-sm">
                      Available Now
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified-lender"
                      className="rounded"
                    />
                    <label
                      htmlFor="verified-lender"
                      className="text-sm flex items-center"
                    >
                      <Shield className="w-3 h-3 mr-1 text-green-500" />
                      Verified Lenders Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-10 text-taupe">
              Loading products...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-taupe mb-4">
                No products match your filters.
              </div>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <div key={product.product_id} className="relative">
                  <Link
                    href={`/products/${product.product_id}`}
                    onClick={() => addToRecentlyViewed(product)}
                  >
                    <Card
                      className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list" ? "w-48 flex-shrink-0" : ""
                        }`}
                      >
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          width={400}
                          height={250}
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                            viewMode === "list" ? "w-48 h-32" : "w-full h-56"
                          }`}
                        />

                        {/* Category Badge */}
                        <Badge
                          className="absolute top-2 left-2 bg-white/90 text-jet hover:bg-white"
                          variant="secondary"
                        >
                          {getCategoryLabel(product.category)}
                        </Badge>

                        {/* Condition Badge */}
                        {product.condition && (
                          <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                            {product.condition}
                          </Badge>
                        )}

                        {/* View Count */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 100) + 10}</span>
                        </div>

                        {/* Trending Badge */}
                        {showTrending && Math.random() > 0.7 && (
                          <Badge className="absolute top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      <CardContent
                        className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className={`font-semibold text-jet line-clamp-1 ${
                              viewMode === "list" ? "text-base" : "text-lg"
                            }`}
                          >
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-taupe">
                              {(Math.random() * 2 + 3).toFixed(1)}
                            </span>
                            <span className="text-xs text-taupe">
                              ({Math.floor(Math.random() * 50) + 5})
                            </span>
                          </div>
                        </div>

                        {product.description && (
                          <p
                            className={`text-sm text-taupe mb-3 ${
                              viewMode === "list"
                                ? "line-clamp-1"
                                : "line-clamp-2"
                            }`}
                          >
                            {product.description}
                          </p>
                        )}

                        <div
                          className={`flex items-center ${
                            viewMode === "list"
                              ? "justify-between"
                              : "justify-between"
                          }`}
                        >
                          <div>
                            <p className="text-lg font-bold text-jet">
                              ₹{product.price}
                            </p>
                            <p className="text-xs text-taupe">per day</p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-taupe mb-1">
                              <MapPin className="w-3 h-3" />
                              <span>{product.lender?.name || "Unknown"}</span>
                              <div title="Verified Lender">
                                <Shield className="w-3 h-3 text-green-500 ml-1" />
                              </div>
                            </div>
                            {product.start_date && (
                              <div className="flex items-center gap-1 text-xs text-taupe">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  Available from{" "}
                                  {new Date(
                                    product.start_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Badge
                                className={`${
                                  product.availability
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                                variant="secondary"
                              >
                                {product.availability
                                  ? "Available"
                                  : "Unavailable"}
                              </Badge>

                              {/* Social Proof */}
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {Math.floor(Math.random() * 20) + 5} interested
                              </Badge>
                            </div>

                            {product.value && (
                              <span className="text-xs text-taupe">
                                Value: ₹{product.value}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Preview Button */}
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedProduct(product);
                                }}
                              >
                                Quick Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {selectedProduct?.name}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedProduct && (
                                <div className="space-y-4">
                                  <Image
                                    src={getProductImage(selectedProduct)}
                                    alt={selectedProduct.name}
                                    width={600}
                                    height={300}
                                    className="w-full h-64 object-cover rounded"
                                  />
                                  <p>{selectedProduct.description}</p>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-2xl font-bold">
                                        ₹{selectedProduct.price}/day
                                      </p>
                                      <p className="text-sm text-taupe">
                                        by {selectedProduct.lender?.name}
                                      </p>
                                    </div>
                                    <Button asChild>
                                      <Link
                                        href={`/products/${selectedProduct.product_id}`}
                                      >
                                        View Full Details
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Message Lender Button */}
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => handleMessageLender(product, e)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Floating Favorite Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`absolute top-2 right-2 z-10 p-2 rounded-full ${
                      favorites.has(product.product_id)
                        ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                        : "bg-white/90 hover:bg-white"
                    }`}
                    onClick={(e) => toggleFavorite(product.product_id, e)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(product.product_id) ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
