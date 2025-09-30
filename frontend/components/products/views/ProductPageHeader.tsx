import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Grid3X3, List, Clock } from "lucide-react";
import { getCategoryLabel } from "@/lib/products/utils";
import { Product } from "@/types/db";

interface ProductPageHeaderProps {
  selectedCategory: string;
  filteredProductsCount: number;
  viewMode: "grid" | "list";
  showRecentlyViewed: boolean;
  recentlyViewedCount: number;
  onCategoryChange: (category: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onToggleRecentlyViewed: () => void;
  onUpdateURL: (category?: string, search?: string) => void;
  searchTerm: string;
}

export function ProductPageHeader({
  selectedCategory,
  filteredProductsCount,
  viewMode,
  showRecentlyViewed,
  recentlyViewedCount,
  onCategoryChange,
  onViewModeChange,
  onToggleRecentlyViewed,
  onUpdateURL,
  searchTerm,
}: ProductPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold font-serif text-jet mb-2">
          Browse Products
        </h1>
        {selectedCategory !== "all" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg text-taupe">Showing:</span>
            <Badge variant="default" className="bg-jet text-isabelline">
              {getCategoryLabel(selectedCategory)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onCategoryChange("all");
                onUpdateURL("all", searchTerm);
              }}
              className="text-xs text-taupe hover:text-jet"
            >
              Clear filter ✕
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {recentlyViewedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRecentlyViewed}
              className="text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              {showRecentlyViewed ? "Hide Recent" : "Recently Viewed"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-taupe">
          <span>{filteredProductsCount} products found</span>
          {selectedCategory !== "all" && (
            <Badge variant="outline" className="text-xs">
              Category: {getCategoryLabel(selectedCategory)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            pressed={viewMode === "grid"}
            onPressedChange={() => onViewModeChange("grid")}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === "list"}
            onPressedChange={() => onViewModeChange("list")}
            size="sm"
          >
            <List className="w-4 h-4" />
          </Toggle>
        </div>
      </div>
    </div>
  );
}
