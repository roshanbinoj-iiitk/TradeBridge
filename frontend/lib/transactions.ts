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
  borrowerAuthId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient();

  // Get the current authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    throw new Error("Authentication required");
  }

  // Get the borrower's profile using their auth UUID
  const { data: borrowerUser } = await supabase
    .from("users")
    .select("uuid")
    .eq("uuid", authUser.id)
    .single();

  if (!borrowerUser) {
    throw new Error("User profile not found. Please complete your profile first.");
  }

  // Get the product to find the lender
  const { data: product } = await supabase
    .from("products")
    .select("lender_id")
    .eq("product_id", productId)
    .single();

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if the product is available for the requested dates using bookings table
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("start_date, end_date")
    .eq("product_id", productId)
    .in("status", ["pending", "confirmed", "paid", "active"])
    .gte("end_date", startDate)
    .lte("start_date", endDate);

  if (existingBookings && existingBookings.length > 0) {
    throw new Error("Product is not available for the selected dates");
  }

  // Calculate total amount (you may want to add security deposit later)
  const { data: productData } = await supabase
    .from("products")
    .select("price")
    .eq("product_id", productId)
    .single();

  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = days * (productData?.price || 0);

  // Create a booking instead of transaction for better workflow
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      product_id: productId,
      borrower_id: borrowerUser.uuid,
      lender_id: product.lender_id,
      start_date: startDate,
      end_date: endDate,
      total_amount: totalAmount,
      status: "pending",
      pickup_method: "meetup", // Default value
    })
    .select();

  if (error) {
    throw new Error(`Failed to create rental request: ${error.message}`);
  }

  // Also create a notification for the lender
  await createNotification(
    product.lender_id,
    "booking_request",
    "New Rental Request",
    `Someone wants to rent your item for ${days} days`,
    {
      booking_id: data[0]?.booking_id,
      product_id: productId,
      borrower_id: borrowerUser.uuid,
    }
  );

  return data;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      notification_type: type,
      title,
      message,
      data,
    });

  if (error) {
    console.warn("Failed to create notification:", error);
  }
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
      price_per_day: productData.price, // Set both fields
      value: productData.value,
      availability: productData.availability,
      available_status: productData.availability,
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
