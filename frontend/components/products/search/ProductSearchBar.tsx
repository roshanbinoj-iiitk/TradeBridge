import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { CategoryOption } from "@/types/products";

interface ProductSearchBarProps {
  searchTerm: string;
  selectedCategory: string;
  availableCategories: CategoryOption[];
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchSubmit: () => void;
}

export function ProductSearchBar({
  searchTerm,
  selectedCategory,
  availableCategories,
  onSearchChange,
  onCategoryChange,
  onSearchSubmit,
}: ProductSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex items-center flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-12 h-12 text-lg w-full"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 h-10 w-10 p-0"
              onClick={onSearchSubmit}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-jet whitespace-nowrap">
              Quick Filter:
            </label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.slice(0, 8).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
