"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/shared/AuthContext";
import { useProductsData } from "@/hooks/useProductsData";
import { ProductSearchBar } from "@/components/products/search/ProductSearchBar";
import { ProductPageHeader } from "@/components/products/views/ProductPageHeader";
import { ProductGrid } from "@/components/products/views/ProductGrid";
import { RecentlyViewedSection } from "@/components/products/views/RecentlyViewedSection";
import { FilterSidebar } from "@/components/products/filters/FilterSidebar";
import { FilterToggleButton } from "@/components/products/filters/FilterToggleButton";
import { SORT_OPTIONS } from "@/lib/products/constants";
import { Product } from "@/types/db";
import { ProductFilters } from "@/types/products";

export default function ProductsPageContent() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(false);

  const {
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
    getProductImage,
    getCategoryLabel,
    getCategoryCount,
    getConditionCount,
    getActiveFilterCount,
  } = useProductsData(user);

  // Aggregate filters for the sidebar
  const filters: ProductFilters = {
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

  const handleFiltersChange = (updates: Partial<ProductFilters>) => {
    if (updates.searchTerm !== undefined) {
      setSearchTerm(updates.searchTerm);
    }
    if (updates.selectedCategory !== undefined) {
      setSelectedCategory(updates.selectedCategory);
      updateURL(updates.selectedCategory, searchTerm);
    }
    if (updates.selectedCondition !== undefined) {
      setSelectedCondition(updates.selectedCondition);
    }
    if (updates.priceRange !== undefined) {
      setPriceRange(updates.priceRange);
    }
    if (updates.sortBy !== undefined) {
      setSortBy(updates.sortBy);
    }
  };

  const handleSearchSubmit = () => {
    updateURL(selectedCategory, searchTerm);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(category, searchTerm);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleToggleRecentlyViewed = () => {
    setShowRecentlyViewed(!showRecentlyViewed);
  };

  // Close filters overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        showFilters &&
        !target.closest("aside") &&
        !target.closest("[data-filter-toggle]")
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters, setShowFilters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jet mx-auto mb-4"></div>
          <p className="text-taupe">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-jet text-isabelline rounded hover:bg-taupe transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Toggle Button */}
      <FilterToggleButton
        showFilters={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
        filters={filters}
      />

      {/* Filter Sidebar */}
      <FilterSidebar
        showFilters={showFilters}
        filters={filters}
        products={products}
        availableCategories={availableCategories}
        availableConditions={availableConditions}
        sortOptions={SORT_OPTIONS}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          showFilters ? "ml-72" : "ml-0"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <ProductPageHeader
            selectedCategory={selectedCategory}
            filteredProductsCount={filteredProducts.length}
            viewMode={viewMode}
            showRecentlyViewed={showRecentlyViewed}
            recentlyViewedCount={recentlyViewed.length}
            onCategoryChange={handleCategoryChange}
            onViewModeChange={setViewMode}
            onToggleRecentlyViewed={handleToggleRecentlyViewed}
            onUpdateURL={updateURL}
            searchTerm={searchTerm}
          />

          {/* Search Bar */}
          <ProductSearchBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            availableCategories={availableCategories.slice(0, 8)}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSearchSubmit={handleSearchSubmit}
          />

          {/* Recently Viewed Section */}
          <RecentlyViewedSection
            showRecentlyViewed={showRecentlyViewed}
            recentlyViewed={recentlyViewed}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-taupe mb-4">No products found</p>
              <p className="text-sm text-battleship-gray mb-6">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-jet text-isabelline rounded hover:bg-taupe transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              showTrending={filters.showTrending}
              selectedProduct={selectedProduct}
              onProductSelect={setSelectedProduct}
              onAddToRecentlyViewed={addToRecentlyViewed}
              onMessageLender={handleMessageLender}
            />
          )}
        </div>
      </main>

      {/* Backdrop for mobile */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
