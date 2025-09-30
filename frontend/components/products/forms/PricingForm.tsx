import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, IndianRupee } from "lucide-react";
import { ProductFormData, ProductFormErrors } from "@/types/products/forms";

interface PricingFormProps {
  formData: ProductFormData;
  errors: ProductFormErrors;
  onUpdate: (field: keyof ProductFormData, value: any) => void;
  showValue?: boolean; // Only show for new products
}

export function PricingForm({
  formData,
  errors,
  onUpdate,
  showValue = false,
}: PricingFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <IndianRupee className="h-5 w-5 mr-2" />
          Pricing & Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={showValue ? "grid grid-cols-2 gap-4" : ""}>
          <div>
            <Label htmlFor="price">Daily Rental Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => onUpdate("price", e.target.value)}
              placeholder="25.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.price}
              </p>
            )}
          </div>

          {showValue && (
            <div>
              <Label htmlFor="value">Product Value ($) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value || ""}
                onChange={(e) => onUpdate("value", e.target.value)}
                placeholder="1500.00"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.value}
                </p>
              )}
            </div>
          )}
        </div>

        {showValue && (
          <p className="text-sm text-gray-600">
            Product value is used for insurance purposes and security deposits.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
