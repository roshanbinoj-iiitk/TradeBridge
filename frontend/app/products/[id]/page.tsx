"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Product } from "@/types/db";
import ProductImageGallery from "./ProductImageGallery";
import Link from "next/link";
import RentalCard from "./RentalCard";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*), lender:users(*)")
        .eq("product_id", Number(params.id))
        .single();
      if (error) {
        setError(error.message);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-10 text-taupe">Loading...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  if (!product) {
    return (
      <div className="text-center py-10 text-taupe">Product not found.</div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen mt-8 lg:mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery */}
        <div>
          <ProductImageGallery
            images={
              product.images && product.images.length > 0
                ? product.images
                : product.image_url
                ? [{ image_url: product.image_url, image_id: 0 }]
                : []
            }
            productName={product.name}
          />
        </div>

        {/* Right Column: Product Info & Rental Box */}
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold font-serif text-jet">
            {product.name}
          </h1>
          <div className="mt-4">
            {product.lender && (
              <Link
                href={`/profile/${product.lender.id}`}
                className="text-battleship-gray hover:text-jet"
              >
                Lender: {product.lender.name}
              </Link>
            )}
          </div>
          <p className="mt-6 text-taupe leading-relaxed">
            {product.description}
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <p>
              <span className="font-semibold text-jet">Category:</span>{" "}
              {product.category || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-jet">Condition:</span>{" "}
              {product.condition || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-jet">Value:</span> $
              {product.value || "N/A"}
            </p>
          </div>
          <RentalCard price={product.price} productId={product.product_id} />
        </div>
      </div>
    </div>
  );
}
