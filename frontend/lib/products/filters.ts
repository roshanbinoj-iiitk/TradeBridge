import { Product } from "@/types/db";
import { ProductFilters } from "@/types/products";

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  return products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (product.description
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ??
        false);

    // Category filter
    const matchesCategory =
      filters.selectedCategory === "all" ||
      product.category === filters.selectedCategory ||
      (filters.selectedCategory === "Other" &&
        (!product.category || product.category.trim() === ""));

    // Condition filter
    const matchesCondition =
      filters.selectedCondition === "all" ||
      product.condition === filters.selectedCondition ||
      (filters.selectedCondition === "Other" &&
        (!product.condition || product.condition.trim() === ""));

    // Price filter
    const matchesPrice =
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1];

    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });
}

export function sortProducts(products: Product[], sortBy: string): Product[] {
  const sorted = [...products];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.start_date || 0).getTime() -
          new Date(a.start_date || 0).getTime()
        );
      default:
        return 0;
    }
  });

  return sorted;
}

export function getInitialPriceRange(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 1000];

  const prices = products.map((p) => p.price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));

  return [minPrice, maxPrice];
}
