import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryOption } from "@/types/products";
import { getConditionCount } from "@/lib/products/utils";
import { Product } from "@/types/db";

interface ConditionFilterProps {
  selectedCondition: string;
  onConditionChange: (condition: string) => void;
  conditions: CategoryOption[];
  products: Product[];
}

export function ConditionFilter({
  selectedCondition,
  onConditionChange,
  conditions,
  products,
}: ConditionFilterProps) {
  return (
    <div>
      <label className="text-sm font-medium text-jet mb-2 block">
        Condition
      </label>
      <Select value={selectedCondition} onValueChange={onConditionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select condition" />
        </SelectTrigger>
        <SelectContent>
          {conditions.map((condition) => (
            <SelectItem key={condition.value} value={condition.value}>
              <div className="flex justify-between items-center w-full">
                <span>{condition.label}</span>
                <span className="text-xs text-taupe ml-2">
                  ({getConditionCount(products, condition.value)})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
