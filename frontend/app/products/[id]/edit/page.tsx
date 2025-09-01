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
  // Category and Condition options (case preserved)
  const categories = [
    "Electronics",
    "Tools & Equipment",
    "Sports & Recreation",
    "Vehicles",
    "Home & Garden",
    "Books & Media",
    "Clothing & Accessories",
    "Musical Instruments",
    "Photography",
    "Camping & Outdoor",
    "Kitchen & Appliances",
    "Others",
  ];
  const conditions = ["Brand New", "Like New", "Good", "Fair", "Poor"];

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    availability: true,
    start_date: "",
    end_date: "",
    category: "",
    condition: "",
  });

  // For product_images table
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!productId || !user) return;
    const fetchProductAndImages = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Fetch product
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
          category: data.category || "",
          condition: data.condition || "",
        });
      }

      // Fetch product images
      const { data: images, error: imgErr } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);
      if (!imgErr && images) {
        setImageLinks(images.map((img: any) => img.image_url));
      } else {
        setImageLinks([]);
      }

      setLoading(false);
    };
    fetchProductAndImages();
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

  // Add new image URL
  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !productId) return;
    setImageLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("product_images")
      .insert({ product_id: productId, image_url: newImageUrl.trim() });
    if (!error) {
      setImageLinks((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
    setImageLoading(false);
  };

  // Delete image URL
  const handleDeleteImage = async (url: string) => {
    if (!productId) return;
    setImageLoading(true);
    const supabase = createClient();
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .eq("image_url", url);
    setImageLinks((prev) => prev.filter((img) => img !== url));
    setImageLoading(false);
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
          category: form.category,
          condition: form.condition,
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
            {/* Image URLs Section */}
            {/* ...existing code for images... */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-jet">
                Product Images
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Add new image URL"
                  className="border-taupe focus:border-jet"
                  disabled={imageLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  disabled={imageLoading || !newImageUrl.trim()}
                >
                  Add
                </Button>
              </div>
              {imageLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageLinks.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        className="w-20 h-14 object-cover rounded border"
                        style={{ background: "#f3f3f3" }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute -top-2 -right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleDeleteImage(url)}
                        disabled={imageLoading}
                        title="Delete image"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Product Name */}
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
            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-jet"
                >
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                  className="border border-taupe focus:border-jet rounded px-3 py-2 w-full bg-white"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="condition"
                  className="text-sm font-medium text-jet"
                >
                  Condition *
                </Label>
                <select
                  id="condition"
                  name="condition"
                  value={form.condition}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, condition: e.target.value }))
                  }
                  required
                  className="border border-taupe focus:border-jet rounded px-3 py-2 w-full bg-white"
                >
                  <option value="" disabled>
                    Select condition
                  </option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Description */}
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
            {/* Price */}
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
            {/* Availability Switch */}
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
            {/* Dates */}
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
            {/* Save/Cancel Buttons */}
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
