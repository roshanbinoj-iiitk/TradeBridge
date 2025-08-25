"use client";

import { useState } from "react";
import { useAuth } from "@/components/shared/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/transactions";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Upload,
  X,
  DollarSign,
  Package,
  Camera,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  value: string;
  availability: boolean;
  start_date: Date | undefined;
  end_date: Date | undefined;
  image_urls: string[];
}

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
  "Other",
];

const conditions = ["Brand New", "Like New", "Good", "Fair", "Poor"];

export default function NewProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInput, setImageInput] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    condition: "",
    price: "",
    value: "",
    availability: true,
    start_date: undefined,
    end_date: undefined,
    image_urls: [],
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-6 text-center">Loading...</div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.value || parseFloat(formData.value) <= 0)
      newErrors.value = "Valid product value is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addImageUrl = () => {
    if (imageInput.trim() && !formData.image_urls.includes(imageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, imageInput.trim()],
      }));
      setImageInput("");
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      // Build product payload with proper types
      const productPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        value: parseFloat(formData.value),
        availability: formData.availability,
        start_date: formData.start_date
          ? formData.start_date.toISOString().split("T")[0]
          : undefined,
        end_date: formData.end_date
          ? formData.end_date.toISOString().split("T")[0]
          : undefined,
        image_urls: formData.image_urls,
        lender_id: user.id,
      };

      const product = await createProduct(productPayload);

      toast({
        title: "Success!",
        description: "Your product has been listed successfully.",
      });

      router.push(`/products/id/${product.product_id}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container mx-auto py-10 px-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold font-serif text-jet mb-2">
          List New Product
        </h1>
        <p className="text-taupe">
          Share your items with the community and earn money!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>Tell us about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="e.g. Canon EOS R5 Camera"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    placeholder="Describe your product, its features, and any important details..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        updateFormData("category", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        updateFormData("condition", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.condition ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.condition}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing & Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Daily Rental Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
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

                  <div>
                    <Label htmlFor="value">Product Value ($) *</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value}
                      onChange={(e) => updateFormData("value", e.target.value)}
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
                </div>
                <p className="text-sm text-gray-600">
                  Product value is used for insurance purposes and security
                  deposits.
                </p>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Product Images
                </CardTitle>
                <CardDescription>
                  Add image URLs to showcase your product (optional but
                  recommended)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Enter image URL"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addImageUrl())
                    }
                  />
                  <Button type="button" onClick={addImageUrl} variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>

                {formData.image_urls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Images</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.image_urls.map((url, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pr-1 max-w-xs"
                        >
                          <span className="truncate">{url}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImageUrl(index)}
                            className="ml-1 h-4 w-4 p-0 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={formData.availability}
                    onCheckedChange={(checked) =>
                      updateFormData("availability", checked)
                    }
                  />
                  <Label htmlFor="availability">Available for rent</Label>
                </div>

                <div className="space-y-3">
                  <Label>Available From (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(formData.start_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => updateFormData("start_date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label>Available Until (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? (
                          format(formData.end_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => updateFormData("end_date", date)}
                        initialFocus
                        disabled={(date) =>
                          formData.start_date
                            ? date < formData.start_date
                            : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-jet text-isabelline hover:bg-taupe"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "List Product"}
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  By listing your product, you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
