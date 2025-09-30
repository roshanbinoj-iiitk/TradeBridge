import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, CheckCircle, XCircle } from "lucide-react";
import { ProductAction } from "@/types/admin";

interface Product {
  product_id: number;
  name: string;
  price: number;
  category: string;
  condition: string;
  availability: boolean;
  created_at: string;
  lender?: {
    name: string;
  };
}

interface ProductsTableProps {
  products: Product[];
  onProductAction: (productId: number, action: ProductAction) => void;
}

export function ProductsTable({
  products,
  onProductAction,
}: ProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 && (
            <div className="p-4 border rounded-lg text-taupe">
              No products found.
            </div>
          )}

          {products.map((product) => (
            <div
              key={product.product_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-taupe">
                  ₹{product.price}/day • {product.category} •{" "}
                  {product.condition}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={product.availability ? "default" : "destructive"}
                  >
                    {product.availability ? "Available" : "Unavailable"}
                  </Badge>
                  <span className="text-xs text-taupe">
                    by {product.lender?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-taupe">
                    • Added {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProductAction(product.product_id, "view")}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProductAction(product.product_id, "edit")}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={product.availability ? "destructive" : "default"}
                  size="sm"
                  onClick={() => onProductAction(product.product_id, "toggle")}
                >
                  {product.availability ? (
                    <XCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  {product.availability ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
