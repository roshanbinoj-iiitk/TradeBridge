"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, X } from "lucide-react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import {
  EditImageManagement,
  EditFormFields,
  ProductPageHeader,
} from "@/components/products/forms";

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuthRedirect();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

      // Fetch current user role to allow admins to edit any product
      let admin = false;
      try {
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("role")
          .eq("uuid", user.id)
          .single();
        if (!userErr && userRow) {
          admin = userRow.role === "admin";
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }

      // Fetch product
      let productQuery: any = supabase
        .from("products")
        .select("*")
        .eq("product_id", Number(productId));
      if (!admin) {
        productQuery = productQuery.eq("lender_id", user.id);
      }

      const { data, error } = await productQuery.single();

      if (error) {
        if (error.code === "PGRST116") {
          setError(
            isAdmin
              ? "Product not found."
              : "Product not found or you don't have permission to edit it"
          );
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
        .eq("product_id", Number(productId));
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

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      availability: checked,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
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

  const handleFileUpload = async (files: FileList) => {
    if (!user || !productId) return;
    setImageLoading(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      // Add to product_images table
      for (const url of uploadedUrls) {
        await supabase
          .from("product_images")
          .insert({ product_id: productId, image_url: url });
      }
      setImageLinks((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setImageLoading(false);
    }
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

      // Build update query: include lender check for non-admins
      let updateQuery: any = supabase.from("products").update({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        availability: form.availability,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        category: form.category,
        condition: form.condition,
      });
      updateQuery = updateQuery.eq("product_id", productId);
      if (!isAdmin) {
        updateQuery = updateQuery.eq("lender_id", user.id);
      }

      const { error } = await updateQuery;

      if (error) {
        console.error("Error updating product:", error);
        setError("Failed to update product. Please try again.");
      } else {
        try {
          router.back();
          setTimeout(() => {
            if (typeof window !== "undefined" && window.history.length <= 1) {
              router.push("/lender");
            }
          }, 250);
        } catch (e) {
          router.push("/lender");
        }
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
      <ProductPageHeader
        title="Edit Product"
        description=""
        onBack={() => router.push("/lender")}
      />

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
            <EditImageManagement
              imageLinks={imageLinks}
              newImageUrl={newImageUrl}
              setNewImageUrl={setNewImageUrl}
              imageLoading={imageLoading}
              onAddImage={handleAddImage}
              onDeleteImage={handleDeleteImage}
              onFileUpload={handleFileUpload}
            />

            <EditFormFields
              form={form}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onSelectChange={handleSelectChange}
            />

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
