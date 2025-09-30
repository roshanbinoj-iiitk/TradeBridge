import React from "react";
import { Slider } from "@/components/ui/slider";
import { Product } from "@/types/db";

interface PriceRangeFilterProps {
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
  products: Product[];
}

export function PriceRangeFilter({
  priceRange,
  onPriceRangeChange,
  products,
}: PriceRangeFilterProps) {
  const maxPrice =
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 1000;

  return (
    <div>
      <label className="text-sm font-medium text-jet mb-2 block">
        Price Range:{" "}
        <span className="font-semibold text-primary">₹{priceRange[0]}</span> -{" "}
        <span className="font-semibold text-primary">₹{priceRange[1]}</span>
      </label>
      <Slider
        value={priceRange}
        onValueChange={onPriceRangeChange}
        max={maxPrice}
        min={0}
        step={10}
        className="mt-2 custom-slider"
        style={
          {
            "--slider-thumb-size": "1.5rem",
            "--slider-thumb-border": "3px solid #444",
            "--slider-thumb-shadow": "0 2px 8px rgba(0,0,0,0.15)",
            "--slider-track-height": "0.5rem",
            "--slider-track-bg": "#e5e7eb",
            "--slider-range-bg": "#44403c",
          } as React.CSSProperties
        }
      />
      <style jsx global>{`
        .custom-slider .slider-thumb {
          height: var(--slider-thumb-size) !important;
          width: var(--slider-thumb-size) !important;
          background: #fff;
          border: var(--slider-thumb-border);
          box-shadow: var(--slider-thumb-shadow);
          transition: box-shadow 0.2s;
        }
        .custom-slider .slider-thumb:hover,
        .custom-slider .slider-thumb:focus {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          border-color: #d97706;
        }
        .custom-slider .range-track {
          height: var(--slider-track-height);
          background: var(--slider-track-bg);
          border-radius: 9999px;
        }
        .custom-slider .range-range {
          background: var(--slider-range-bg);
        }
      `}</style>
    </div>
  );
}
