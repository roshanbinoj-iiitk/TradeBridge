"use client";

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
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/lib/messages";
import type { Product } from "@/types/db";

export default function ProductsPage() {
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

  // New feature states
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showTrending, setShowTrending] = useState(false);

  const { user, loading: authLoading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();

  // Predefined categories for better UX
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "music", label: "Musical Instruments" },
    { value: "sports", label: "Sports Equipment" },
    { value: "photography", label: "Photography" },
    { value: "tools", label: "Tools & Equipment" },
    { value: "automotive", label: "Automotive" },
    { value: "home", label: "Home & Garden" },
    { value: "books", label: "Books & Media" },
    { value: "fashion", label: "Fashion & Accessories" },
    { value: "other", label: "Other" },
  ];

  const conditions = [
    { value: "all", label: "All Conditions" },
    { value: "new", label: "New" },
    { value: "like new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
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

    if (!user || !product.lender_id) return;

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

  useEffect(() => {
    if (!authLoading && user) {
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

          if (error) throw new Error(error.message);

          // Set initial price range based on actual data
          if (data && data.length > 0) {
            const prices = data.map((p) => p.price);
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange([minPrice, maxPrice]);
          }

          setProducts((data as Product[]) || []);
        } catch (err: any) {
          setError(err.message || "Unknown error");
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [user, authLoading]);

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

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.toLowerCase() === selectedCategory ||
        (selectedCategory === "other" && !product.category);

      // Condition filter
      const matchesCondition =
        selectedCondition === "all" ||
        product.condition?.toLowerCase() === selectedCondition;

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

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return "Other";
    const found = categories.find(
      (cat) => cat.value === category.toLowerCase()
    );
    return found ? found.label : category;
  };

  if (authLoading || !user)
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
                Clear
              </Button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-jet mb-2 block">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
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
                  className="mt-2"
                />
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
// ...existing code...
