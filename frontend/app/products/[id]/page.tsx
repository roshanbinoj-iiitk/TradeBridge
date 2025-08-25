import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/types/db";
import Image from "next/image";
import ProductImageGallery from "./ProductImageGallery";
import Link from "next/link";
import RentalCard from "./RentalCard";

export async function generateStaticParams() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select("product_id");

  return (
    products?.map((product) => ({
      id: product.product_id.toString(),
    })) || []
  );
}

import { useState } from "react";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), lender:users(*)")
    .eq("product_id", Number(params.id))
    .single();

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">{error.message}</div>
    );
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
          <ProductImageGallery images={product.images || []} productName={product.name} />
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
