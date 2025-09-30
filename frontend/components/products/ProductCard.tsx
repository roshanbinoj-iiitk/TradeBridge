import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  MapPin,
  Calendar,
  Heart,
  Shield,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/db";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onMessageLender: (e: React.MouseEvent) => void;
  onAddToRecentlyViewed: () => void;
  getCategoryLabel: (category: string) => string;
  getProductImage: (product: Product) => string;
}

export default function ProductCard({
  product,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onMessageLender,
  onAddToRecentlyViewed,
  getCategoryLabel,
  getProductImage,
}: ProductCardProps) {
  return (
    <div className="relative">
      <Link
        href={`/products/${product.product_id}`}
        onClick={onAddToRecentlyViewed}
      >
        <Card
          className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${
            viewMode === "list" ? "flex" : ""
          }`}
        >
          <div
            className={`relative overflow-hidden ${
              viewMode === "list" ? "w-48 flex-shrink-0" : ""
            }`}
          >
            <Image
              src={getProductImage(product)}
              alt={product.name}
              width={400}
              height={250}
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                viewMode === "list" ? "w-48 h-32" : "w-full h-56"
              }`}
            />

            {/* Category Badge */}
            <Badge
              className="absolute top-2 left-2 bg-white/90 text-jet hover:bg-white"
              variant="secondary"
            >
              {getCategoryLabel(product.category || "")}
            </Badge>

            {/* Condition Badge */}
            {product.condition && (
              <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                {product.condition}
              </Badge>
            )}

            {/* Favorite Button */}
            <button
              onClick={onToggleFavorite}
              className={`absolute top-2 right-12 p-2 rounded-full ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-600 hover:bg-white"
              } transition-colors`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          </div>

          <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
            <div className="flex justify-between items-start mb-2">
              <h3
                className={`font-semibold text-jet line-clamp-1 ${
                  viewMode === "list" ? "text-base" : "text-lg"
                }`}
              >
                {product.name}
              </h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-taupe">
                  {(Math.random() * 2 + 3).toFixed(1)}
                </span>
                <span className="text-xs text-taupe">
                  ({Math.floor(Math.random() * 50) + 5})
                </span>
              </div>
            </div>

            {product.description && (
              <p
                className={`text-sm text-taupe mb-3 ${
                  viewMode === "list" ? "line-clamp-1" : "line-clamp-2"
                }`}
              >
                {product.description}
              </p>
            )}

            <div
              className={`flex items-center ${
                viewMode === "list" ? "justify-between" : "justify-between"
              }`}
            >
              <div>
                <p className="text-lg font-bold text-jet">₹{product.price}</p>
                <p className="text-xs text-taupe">per day</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-taupe mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{product.lender?.name || "Unknown"}</span>
                  <div title="Verified Lender">
                    <Shield className="w-3 h-3 text-green-500 ml-1" />
                  </div>
                </div>
                {product.start_date && (
                  <div className="flex items-center gap-1 text-xs text-taupe">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Available from{" "}
                      {new Date(product.start_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge
                    className={`${
                      product.availability
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                    variant="secondary"
                  >
                    {product.availability ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {product.value && (
                  <span className="text-xs text-taupe">
                    Value: ₹{product.value}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    Quick Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      width={600}
                      height={300}
                      className="w-full h-64 object-cover rounded"
                    />
                    <p>{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">
                          ₹{product.price}/day
                        </p>
                        <p className="text-sm text-taupe">
                          by {product.lender?.name}
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/products/${product.product_id}`}>
                          View Full Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Message Lender Button */}
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onMessageLender}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
