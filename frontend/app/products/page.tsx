"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/db";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">
        Browse Products
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <aside className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-jet mb-4">Filters</h2>
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
            {/* Placeholder for more filters */}
            <p className="text-taupe">
              Category filters, price sliders, and date pickers will go here.
            </p>
          </div>
        </aside>

        {/* Right Column: Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-10 text-taupe">
              Loading products...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-taupe">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.product_id}
                  href={`/products/${product.product_id}`}
                >
                  <Card className="overflow-hidden group">
                    <div className="overflow-hidden">
                      <Image
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].image_url
                            : "https://placehold.co/400x250?text=No+Image"
                        }
                        alt={product.name}
                        width={400}
                        height={250}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-jet">
                        {product.name}
                      </h3>
                      <p className="text-taupe">${product.price} / day</p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {product.availability ? "Available" : "Unavailable"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
