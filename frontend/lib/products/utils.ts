import { Product } from "@/types/db";
import { CategoryOption } from "@/types/products";
import {
  CATEGORIES,
  CONDITIONS,
  CATEGORY_URL_MAPPING,
  URL_TO_CATEGORY_MAPPING,
} from "./constants";

export function getProductImage(product: Product): string {
  // First try the main image_url from products table
  if (product.image_url && product.image_url.startsWith("http")) {
    return product.image_url;
  }
  // Then try the first image from product_images
  if (
    product.images &&
    product.images.length > 0 &&
    typeof product.images[0].image_url === "string" &&
    product.images[0].image_url.startsWith("http")
  ) {
    return product.images[0].image_url;
  }
  return "https://placehold.co/400x250?text=No+Image";
}

export function getCategoryLabel(category: string | undefined): string {
  if (!category || category.trim() === "") return "Other";

  const found = CATEGORIES.find((cat) => cat.value === category);
  return found ? found.label : category;
}

export function getCategoryCount(
  products: Product[],
  categoryValue: string
): number {
  if (categoryValue === "all") return products.length;
  return products.filter(
    (product) =>
      product.category === categoryValue ||
      (categoryValue === "Other" &&
        (!product.category || product.category.trim() === ""))
  ).length;
}

export function getConditionCount(
  products: Product[],
  conditionValue: string
): number {
  if (conditionValue === "all") return products.length;
  return products.filter(
    (product) =>
      product.condition === conditionValue ||
      (conditionValue === "Other" &&
        (!product.condition || product.condition.trim() === ""))
  ).length;
}

export function buildAvailableCategories(
  products: Product[]
): CategoryOption[] {
  if (products.length === 0) return CATEGORIES;

  // Extract unique categories from the actual data
  const uniqueCategories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((cat): cat is string => Boolean(cat && cat.trim() !== ""))
    )
  ).sort();

  // Filter out condition values that might have been mistakenly stored as categories
  const conditionValues = [
    "New",
    "Like New",
    "Good",
    "Fair",
    "Poor",
    "new",
    "like new",
    "good",
    "fair",
    "poor",
  ];
  const validCategories = uniqueCategories.filter(
    (cat) => !conditionValues.includes(cat)
  );

  // Create a comprehensive list without duplicates
  const allCategories = [{ value: "all", label: "All Categories" }];
  const addedCategories = new Set(["all"]);

  // Add categories that exist in the data, prioritizing predefined labels
  validCategories.forEach((dbCategory) => {
    if (!addedCategories.has(dbCategory)) {
      const predefinedCategory = CATEGORIES.find(
        (cat) => cat.value === dbCategory
      );
      if (predefinedCategory) {
        allCategories.push(predefinedCategory);
      } else {
        allCategories.push({ value: dbCategory, label: dbCategory });
      }
      addedCategories.add(dbCategory);
    }
  });

  return allCategories;
}

export function buildAvailableConditions(
  products: Product[]
): CategoryOption[] {
  if (products.length === 0) return CONDITIONS;

  // Extract and set unique conditions from data
  const uniqueConditions = Array.from(
    new Set(
      products
        .map((p) => p.condition)
        .filter((cond): cond is string => Boolean(cond && cond.trim() !== ""))
    )
  ).sort();

  // Create conditions list without duplicates
  const allConditions = [{ value: "all", label: "All Conditions" }];
  const addedConditions = new Set(["all"]);

  // Add conditions that exist in the data, prioritizing predefined labels
  uniqueConditions.forEach((dbCondition) => {
    if (!addedConditions.has(dbCondition)) {
      const predefinedCondition = CONDITIONS.find(
        (cond) => cond.value === dbCondition
      );
      if (predefinedCondition) {
        allConditions.push(predefinedCondition);
      } else {
        allConditions.push({ value: dbCondition, label: dbCondition });
      }
      addedConditions.add(dbCondition);
    }
  });

  return allConditions;
}

export function buildCategoryURL(category: string): string {
  return (
    CATEGORY_URL_MAPPING[category] ||
    category.toLowerCase().replace(/\s+/g, "-")
  );
}

export function parseCategoryFromURL(categoryParam: string): string {
  return URL_TO_CATEGORY_MAPPING[categoryParam] || categoryParam;
}
