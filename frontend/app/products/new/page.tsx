"use client";

import { useState } from "react";
import { useAuth } from "@/components/shared/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/transactions";
import {
  BasicInformationForm,
  PricingForm,
  ImageManagement,
  AvailabilityForm,
  FormActions,
  ProductPageHeader,
} from "@/components/products/forms";
import { useProductForm, useImageManagement } from "@/hooks/products";
import { ProductFormData } from "@/types/products/forms";

export default function NewProductPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formData, errors, updateFormData, validateForm } = useProductForm();

  const {
    imageInput,
    setImageInput,
    isUploading,
    addImageUrl,
    removeImageUrl,
    handleFileUpload,
  } = useImageManagement(user?.id);

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

  const handleAddUrl = () => {
    addImageUrl(imageInput, formData.image_urls, (urls) =>
      updateFormData("image_urls", urls)
    );
  };

  const handleRemoveImage = (index: number) => {
    removeImageUrl(index, formData.image_urls, (urls) =>
      updateFormData("image_urls", urls)
    );
  };

  const handleUpload = (files: FileList) => {
    handleFileUpload(files, formData.image_urls, (urls) =>
      updateFormData("image_urls", urls)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(true) || !user) return;

    setIsSubmitting(true);

    try {
      // Build product payload with proper types
      const productPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        value: parseFloat(formData.value || "0"),
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

      router.push(`/products/${product.product_id}`);
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

  return (
    <div className="container mx-auto py-10 px-6 max-w-4xl">
      <ProductPageHeader
        title="List New Product"
        description="Share your items with the community and earn money!"
        onBack={() => router.back()}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInformationForm
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
            />

            <PricingForm
              formData={formData}
              errors={errors}
              onUpdate={updateFormData}
              showValue={true}
            />

            <ImageManagement
              formData={formData}
              onUpdate={updateFormData}
              imageInput={imageInput}
              setImageInput={setImageInput}
              isUploading={isUploading}
              onFileUpload={handleUpload}
              onAddUrl={handleAddUrl}
              onRemoveImage={handleRemoveImage}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AvailabilityForm formData={formData} onUpdate={updateFormData} />

            <FormActions
              isSubmitting={isSubmitting}
              submitText="List Product"
              showTerms={true}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
