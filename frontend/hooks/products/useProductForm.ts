import { useState } from "react";
import { ProductFormData, ProductFormErrors } from "@/types/products/forms";

export function useProductForm(initialData?: Partial<ProductFormData>) {
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
    ...initialData,
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (requireValue = false): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (requireValue && (!formData.value || parseFloat(formData.value) <= 0)) {
      newErrors.value = "Valid product value is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
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
    setErrors({});
  };

  return {
    formData,
    errors,
    updateFormData,
    validateForm,
    resetForm,
    setFormData,
  };
}
