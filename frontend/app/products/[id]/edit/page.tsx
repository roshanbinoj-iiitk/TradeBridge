"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, X } from "lucide-react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    availability: true,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!productId || !user) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // First check if the user owns this product
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", productId)
        .eq("lender_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Product not found or you don't have permission to edit it");
        } else {
          setError("Failed to fetch product");
        }
      } else {
        setProduct(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          availability: data.availability ?? true,
          start_date: data.start_date ? data.start_date.split("T")[0] : "",
          end_date: data.end_date ? data.end_date.split("T")[0] : "",
        });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      availability: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Validate form
      if (!form.name.trim() || !form.description.trim() || !form.price) {
        setError("Please fill in all required fields");
        return;
      }

      if (Number(form.price) < 0) {
        setError("Price must be a positive number");
        return;
      }

      if (form.start_date && form.end_date && form.start_date > form.end_date) {
        setError("End date must be after start date");
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          availability: form.availability,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
        })
        .eq("product_id", productId)
        .eq("lender_id", user.id); // Extra security check

      if (error) {
        console.error("Error updating product:", error);
        setError("Failed to update product. Please try again.");
      } else {
        // Redirect back to lender page with success
        router.push("/lender");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading)
    return <div className="text-center py-10 text-taupe">Loading...</div>;

  if (!user)
    return (
      <div className="text-center py-10 text-taupe">
        Please log in to continue.
      </div>
    );

  if (error && !product) {
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => router.push("/lender")}
            className="bg-jet text-isabelline hover:bg-taupe"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Products
          </Button>
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div className="text-center py-10 text-red-500">Product not found.</div>
    );

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/lender")}
          className="text-jet hover:bg-taupe/20 p-0 h-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Products
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-serif text-jet">
            Edit Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-jet">
                Product Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
                className="border-taupe focus:border-jet"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-jet"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your product..."
                rows={4}
                className="border-taupe focus:border-jet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-jet">
                Price per day (₹) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="border-taupe focus:border-jet"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="availability"
                checked={form.availability}
                onCheckedChange={handleSwitchChange}
              />
              <Label
                htmlFor="availability"
                className="text-sm font-medium text-jet"
              >
                Available for rent
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start_date"
                  className="text-sm font-medium text-jet"
                >
                  Available from
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleInputChange}
                  className="border-taupe focus:border-jet"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="end_date"
                  className="text-sm font-medium text-jet"
                >
                  Available until
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={handleInputChange}
                  className="border-taupe focus:border-jet"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-jet text-isabelline hover:bg-taupe flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/lender")}
                disabled={saving}
                className="border-jet text-jet hover:bg-jet hover:text-isabelline flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
