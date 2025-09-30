import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryOption } from "@/types/products";
import { getCategoryCount } from "@/lib/products/utils";
import { Product } from "@/types/db";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: CategoryOption[];
  products: Product[];
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  categories,
  products,
}: CategoryFilterProps) {
  return (
    <div>
      <label className="text-sm font-medium text-jet mb-2 block">
        Category
      </label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              <div className="flex justify-between items-center w-full">
                <span>{category.label}</span>
                <span className="text-xs text-taupe ml-2">
                  ({getCategoryCount(products, category.value)})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
