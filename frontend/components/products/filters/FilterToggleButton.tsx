import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { ProductFilters } from "@/types/products";

interface FilterToggleProps {
  showFilters: boolean;
  onToggle: () => void;
  filters: ProductFilters;
}

export function FilterToggleButton({
  showFilters,
  onToggle,
  filters,
}: FilterToggleProps) {
  const activeFiltersCount = [
    filters.selectedCategory !== "all" ? 1 : 0,
    filters.selectedCondition !== "all" ? 1 : 0,
    filters.searchTerm ? 1 : 0,
    filters.showTrending ? 1 : 0,
    filters.showFavorites ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Button
      onClick={onToggle}
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 rounded-full w-12 h-12 p-0 shadow-lg transition-all duration-300 bg-jet hover:bg-taupe text-isabelline ${
        showFilters ? "left-80" : "left-4"
      }`}
      aria-label="Toggle filters"
    >
      <Filter className="h-5 w-5" />
      {activeFiltersCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 text-xs px-1"
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
}
