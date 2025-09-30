import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { ProductFilters } from "@/types/products";

interface FilterHeaderProps {
  filters: ProductFilters;
  onClearFilters: () => void;
  onClose: () => void;
}

export function FilterHeader({
  filters,
  onClearFilters,
  onClose,
}: FilterHeaderProps) {
  const activeFiltersCount = [
    filters.selectedCategory !== "all" ? 1 : 0,
    filters.selectedCondition !== "all" ? 1 : 0,
    filters.searchTerm ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold text-jet">Filters</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-xs"
        >
          <Filter className="w-3 h-3 mr-1" />
          Clear All
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="ml-1 text-xs px-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
          ✕
        </Button>
      </div>
    </div>
  );
}
