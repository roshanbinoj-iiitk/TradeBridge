import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { productId, rentalDays = 1, bookingId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get authenticated user (the borrower/buyer)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let totalAmount = 0;
    let bookingData = null;

    if (bookingId) {
      // Fetch booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("borrower_id", user.id) // Ensure user owns this booking
        .single();

      if (bookingError || !booking) {
        return NextResponse.json(
          { error: "Booking not found or access denied" },
          { status: 404 }
        );
      }

      if (booking.status !== "confirmed") {
        return NextResponse.json(
          { error: "Booking is not in a payable state" },
          { status: 400 }
        );
      }

      totalAmount = Math.round(Number(booking.total_amount) * 100); // Convert to cents
      bookingData = booking;
    }

    // Fetch product details with lender info
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
        product_id,
        name,
        description,
        price,
        lender_id,
        category,
        lender:users!products_lender_id_fkey(uuid, name, email, stripe_account_id)
      `
      )
      .eq("product_id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if lender has connected Stripe account
    // Type assertion since Supabase returns array for relations
    const lenderData = Array.isArray(product.lender)
      ? product.lender[0]
      : product.lender;
    const lenderStripeAccountId = lenderData?.stripe_account_id;

    if (!lenderStripeAccountId) {
      return NextResponse.json(
        {
          error: "This seller hasn't connected their Stripe account yet",
          needsConnect: true,
        },
        { status: 400 }
      );
    }

    if (!bookingId) {
      // Calculate total amount for non-booking payments (price per day * rental days)
      const pricePerDay = Number(product.price);
      totalAmount = Math.round(pricePerDay * rentalDays * 100); // Convert to cents
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid price or rental duration" },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_ORIGIN || "https://trade-bridge-five.vercel.app";

    // Check if dummy mode
    const isDummyMode = process.env.STRIPE_DUMMY_MODE === "true";

    if (isDummyMode) {
      // DUMMY MODE: Skip Stripe, just redirect to success
      console.log("⚠️ DUMMY MODE: Simulating checkout for product", productId);
      return NextResponse.json({
        success: true,
        sessionId: `dummy_session_${Date.now()}`,
        url: `${origin}/payments/success?session_id=dummy_${Date.now()}${
          bookingId ? `&booking_id=${bookingId}` : ""
        }&dummy=true`,
        isDummy: true,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: bookingId
                ? `${product.name} - Rental Booking`
                : `${product.name} - Rental`,
              description: bookingId
                ? `Rental booking from ${new Date(
                    bookingData.start_date
                  ).toLocaleDateString()} to ${new Date(
                    bookingData.end_date
                  ).toLocaleDateString()}`
                : `${rentalDays} day(s) rental of ${product.name}`,
              images: [], // You can add product images here if available
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(totalAmount * 0.1), // 10% platform fee
        transfer_data: {
          destination: lenderStripeAccountId,
        },
        metadata: {
          product_id: String(productId),
          lender_id: String(product.lender_id),
          borrower_id: user.id,
          rental_days: bookingId
            ? String(
                Math.ceil(
                  (new Date(bookingData.end_date).getTime() -
                    new Date(bookingData.start_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : String(rentalDays),
          booking_id: bookingId ? String(bookingId) : "",
        },
      },
      metadata: {
        product_id: String(productId),
        lender_id: String(product.lender_id),
        borrower_id: user.id,
        rental_days: bookingId
          ? String(
              Math.ceil(
                (new Date(bookingData.end_date).getTime() -
                  new Date(bookingData.start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : String(rentalDays),
        booking_id: bookingId ? String(bookingId) : "",
      },
      success_url: `${origin}/payments/success?session_id={CHECKOUT_SESSION_ID}${
        bookingId ? `&booking_id=${bookingId}` : ""
      }`,
      cancel_url: `${origin}/products/${productId}?payment_cancelled=1`,
      customer_email: user.email,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
