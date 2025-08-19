import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/types/db";
import Image from "next/image";
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

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  function getProductImage(product: Product) {
    if (
      product.images &&
      product.images.length > 0 &&
      typeof product.images[0].image_url === "string" &&
      product.images[0].image_url.startsWith("http")
    ) {
      return product.images[0].image_url;
    }
    return "https://placehold.co/800x600?text=No+Image";
  }

  // Return product id for debugging or display
  // Remove or move as needed
  // return params.id;
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen mt-8 lg:mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery */}
        <div>
          <Image
            src={getProductImage(product)}
            alt={product.name}
            width={800}
            height={600}
            className="w-full rounded-lg shadow-lg object-cover aspect-video"
          />
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {product.images.map((img: any, i: number) => (
                <div
                  key={img.image_id}
                  className="border-2 border-jet rounded-md p-1"
                >
                  <Image
                    src={img.image_url}
                    alt={`Thumbnail ${i + 1}`}
                    width={150}
                    height={100}
                    className="rounded-sm object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
          <RentalCard price={product.price} />
        </div>
      </div>
    </div>
  );
}
