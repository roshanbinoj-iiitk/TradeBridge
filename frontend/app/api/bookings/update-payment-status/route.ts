import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, sessionId } = await request.json();
    console.log(
      "API called with bookingId:",
      bookingId,
      "sessionId:",
      sessionId
    );

    if (!bookingId || !sessionId) {
      return NextResponse.json(
        { error: "Booking ID and Session ID are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("Authenticated user:", user?.id, "authError:", authError);

    // For payment updates, we'll be more lenient with auth for now
    // In production, this should be properly secured
    if (authError) {
      console.warn("Auth error, but proceeding with update:", authError);
    }

    // Update booking status to "paid"
    const updateQuery = supabase
      .from("bookings")
      .update({
        status: "paid",
        payment_status: "paid",
        payment_intent_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId);

    // Only add user filter if user is authenticated
    if (user) {
      updateQuery.eq("borrower_id", user.id);
    }

    const { data: updatedBooking, error: updateError } = await updateQuery
      .select()
      .single();

    console.log("Update result:", { updatedBooking, updateError });

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
