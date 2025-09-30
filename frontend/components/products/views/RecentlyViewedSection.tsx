import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Product } from "@/types/db";
import { getProductImage } from "@/lib/products/utils";

interface RecentlyViewedSectionProps {
  showRecentlyViewed: boolean;
  recentlyViewed: Product[];
}

export function RecentlyViewedSection({
  showRecentlyViewed,
  recentlyViewed,
}: RecentlyViewedSectionProps) {
  if (!showRecentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 transition-all duration-300 animate-in slide-in-from-top-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-taupe" />
        <h2 className="text-xl font-semibold text-jet">Recently Viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recentlyViewed.map((product) => (
          <Link
            key={`recent-${product.product_id}`}
            href={`/products/${product.product_id}`}
            className="flex-shrink-0"
          >
            <Card className="w-48 overflow-hidden hover:shadow-md transition-shadow">
              <Image
                src={getProductImage(product)}
                alt={product.name}
                width={192}
                height={120}
                className="w-full h-24 object-cover"
              />
              <CardContent className="p-3">
                <h4 className="font-medium text-sm line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-taupe">₹{product.price}/day</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
