import { createClient } from "@/utils/supabase/client";

export async function updateTransactionStatus(
  transactionId: number,
  status: "approved" | "rejected"
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("transaction_id", transactionId)
    .select();

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  return data;
}

export async function createRentalRequest(
  productId: number,
  borrowerId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient();

  // First get the product to find the lender
  const { data: product } = await supabase
    .from("products")
    .select("lender_id")
    .eq("product_id", productId)
    .single();

  if (!product) {
    throw new Error("Product not found");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      product_id: productId,
      borrower_id: borrowerId,
      lender_id: product.lender_id,
      start_date: startDate,
      end_date: endDate,
      status: "pending",
    })
    .select();

  if (error) {
    throw new Error(`Failed to create rental request: ${error.message}`);
  }

  return data;
}

export async function createProduct(productData: {
  name: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  value: number;
  availability: boolean;
  start_date?: string;
  end_date?: string;
  image_urls: string[];
  lender_id: string;
}) {
  const supabase = createClient();

  // Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      condition: productData.condition,
      price: productData.price,
      value: productData.value,
      availability: productData.availability,
      start_date: productData.start_date,
      end_date: productData.end_date,
      lender_id: productData.lender_id,
      image_url: productData.image_urls[0] || null,
    })
    .select()
    .single();

  if (productError) {
    throw new Error(`Failed to create product: ${productError.message}`);
  }

  // Insert additional images if any
  if (productData.image_urls.length > 0) {
    const imageInserts = productData.image_urls.map((url) => ({
      product_id: product.product_id,
      image_url: url,
    }));

    const { error: imageError } = await supabase
      .from("product_images")
      .insert(imageInserts);

    if (imageError) {
      console.warn("Error inserting product images:", imageError);
    }
  }

  return product;
}

export function calculateRentalCost(
  dailyPrice: number,
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, days) * dailyPrice;
}
