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
  Filter,
  Heart,
  TrendingUp,
  Star,
  Shield,
  ChevronDown,
} from "lucide-react";

interface FilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCondition: string;
  setSelectedCondition: (condition: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  availableCategories: { value: string; label: string }[];
  availableConditions: { value: string; label: string }[];
  maxPrice: number;
  onClearFilters: () => void;
  getActiveFilterCount: () => number;
  getCategoryCount: (category: string) => number;
  getConditionCount: (condition: string) => number;
}

export default function FilterSidebar({
  showFilters,
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  availableCategories,
  availableConditions,
  maxPrice,
  onClearFilters,
  getActiveFilterCount,
  getCategoryCount,
  getConditionCount,
}: FilterSidebarProps) {
  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
    { value: "price_asc", label: "Price (Low to High)" },
    { value: "price_desc", label: "Price (High to Low)" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
  ];

  return (
    <>
      {/* Floating Filter Button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 rounded-full w-12 h-12 p-0 shadow-lg transition-all duration-300 bg-jet hover:bg-taupe text-isabelline ${
          showFilters ? "left-80" : "left-4"
        }`}
        aria-label="Toggle filters"
      >
        <Filter className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg z-30 transition-transform duration-300 overflow-y-auto pt-20 ${
          showFilters ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
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
                {getActiveFilterCount() > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="p-2"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="space-y-6">
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
                  {availableCategories.map((category) => (
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
                  {availableConditions.map((condition) => (
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
                max={maxPrice}
                min={0}
                step={10}
                className="mt-2"
              />
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

      {/* Overlay for mobile when filters are open */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </>
  );
}
