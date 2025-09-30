import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/db";
import { ProductFilters, CategoryOption, SortOption } from "@/types/products";
import { FilterHeader } from "./FilterHeader";
import { CategoryFilter } from "./CategoryFilter";
import { ConditionFilter } from "./ConditionFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { AdvancedFilters } from "./AdvancedFilters";

interface FilterSidebarProps {
  showFilters: boolean;
  filters: ProductFilters;
  products: Product[];
  availableCategories: CategoryOption[];
  availableConditions: CategoryOption[];
  sortOptions: SortOption[];
  onFiltersChange: (updates: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function FilterSidebar({
  showFilters,
  filters,
  products,
  availableCategories,
  availableConditions,
  sortOptions,
  onFiltersChange,
  onClearFilters,
  onClose,
}: FilterSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg z-30 transition-transform duration-300 overflow-y-auto pt-20 ${
        showFilters ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6">
        <FilterHeader
          filters={filters}
          onClearFilters={onClearFilters}
          onClose={onClose}
        />

        <div className="space-y-6">
          <CategoryFilter
            selectedCategory={filters.selectedCategory}
            onCategoryChange={(category) =>
              onFiltersChange({ selectedCategory: category })
            }
            categories={availableCategories}
            products={products}
          />

          <ConditionFilter
            selectedCondition={filters.selectedCondition}
            onConditionChange={(condition) =>
              onFiltersChange({ selectedCondition: condition })
            }
            conditions={availableConditions}
            products={products}
          />

          <PriceRangeFilter
            priceRange={filters.priceRange}
            onPriceRangeChange={(range) =>
              onFiltersChange({ priceRange: range })
            }
            products={products}
          />

          <AdvancedFilters
            showTrending={filters.showTrending}
            onShowTrendingChange={(show) =>
              onFiltersChange({ showTrending: show })
            }
            showFavorites={filters.showFavorites}
            onShowFavoritesChange={(show) =>
              onFiltersChange({ showFavorites: show })
            }
          />

          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium text-jet mb-2 block">
              Sort By
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFiltersChange({ sortBy: value })}
            >
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
  );
}
