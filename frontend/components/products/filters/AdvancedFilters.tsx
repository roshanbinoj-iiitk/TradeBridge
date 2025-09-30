import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { Heart, TrendingUp, Shield } from "lucide-react";

interface AdvancedFiltersProps {
  showTrending: boolean;
  onShowTrendingChange: (show: boolean) => void;
  showFavorites: boolean;
  onShowFavoritesChange: (show: boolean) => void;
}

export function AdvancedFilters({
  showTrending,
  onShowTrendingChange,
  showFavorites,
  onShowFavoritesChange,
}: AdvancedFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Show Favorites Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-jet">
          Show Favorites Only
        </label>
        <Toggle
          pressed={showFavorites}
          onPressedChange={onShowFavoritesChange}
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
          onPressedChange={onShowTrendingChange}
          size="sm"
        >
          <TrendingUp className="w-3 h-3" />
        </Toggle>
      </div>

      {/* Verified Lenders Only */}
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="verified-lender" className="rounded" />
        <label htmlFor="verified-lender" className="text-sm flex items-center">
          <Shield className="w-3 h-3 mr-1 text-green-500" />
          Verified Lenders Only
        </label>
      </div>

      {/* Available Now */}
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="available-now" className="rounded" />
        <label htmlFor="available-now" className="text-sm">
          Available Now
        </label>
      </div>
    </div>
  );
}
