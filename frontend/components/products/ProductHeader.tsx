import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Clock, Grid3X3, List } from "lucide-react";

interface ProductHeaderProps {
  selectedCategory: string;
  filteredProductsCount: number;
  recentlyViewedCount: number;
  showRecentlyViewed: boolean;
  setShowRecentlyViewed: (show: boolean) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  getCategoryLabel: (category: string) => string;
  onClearCategoryFilter: () => void;
}

export default function ProductHeader({
  selectedCategory,
  filteredProductsCount,
  recentlyViewedCount,
  showRecentlyViewed,
  setShowRecentlyViewed,
  viewMode,
  setViewMode,
  getCategoryLabel,
  onClearCategoryFilter,
}: ProductHeaderProps) {
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
              onClick={onClearCategoryFilter}
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
              onClick={() => setShowRecentlyViewed(!showRecentlyViewed)}
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
  );
}
