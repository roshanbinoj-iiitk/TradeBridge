import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/transactions";
import { sendMessage } from "@/lib/messages";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const secret =
      process.env.QR_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify JWT token
    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const { booking_id, action, flow, issuer } = payload;

    if (action !== "collect" || !booking_id) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 400 }
      );
    }

    // Get authenticated user (scanner)
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Load booking with related data
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        product:products(product_id, name, lender_id),
        borrower:users!bookings_borrower_id_fkey(uuid, name),
        lender:users!bookings_lender_id_fkey(uuid, name)
      `
      )
      .eq("booking_id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check token expiry
    if (
      !booking.collection_token_expires_at ||
      new Date(booking.collection_token_expires_at) < new Date()
    ) {
      // Clear expired token
      await supabaseAdmin
        .from("bookings")
        .update({
          collection_token_hash: null,
          collection_token_expires_at: null,
        })
        .eq("booking_id", booking_id);

      return NextResponse.json(
        { error: "QR code has expired. Please generate a new one." },
        { status: 400 }
      );
    }

    // Verify token hash
    const tokenHash = hashToken(token);
    if (booking.collection_token_hash !== tokenHash) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Validate scanner's authorization based on flow
    let isAuthorized = false;
    let newStatus = "";
    let notificationTarget = "";
    let notificationMessage = "";

    if (flow === "borrow") {
      // Borrower should be scanning lender's QR
      isAuthorized = booking.borrower.uuid === authUser.id;
      newStatus = "active";
      notificationTarget = booking.lender.uuid;
      notificationMessage = `${booking.borrower.name} has collected the item via QR scan`;
    } else if (flow === "return") {
      // Borrower should be scanning lender's QR (changed to match new QR generation logic)
      isAuthorized = booking.borrower.uuid === authUser.id;
      newStatus = "completed";
      notificationTarget = booking.lender.uuid;
      notificationMessage = `${booking.borrower.name} has returned the item via QR scan`;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to scan this QR code" },
        { status: 403 }
      );
    }

    // Check if already collected - different logic for borrow vs return
    if (flow === "borrow" && booking.collected_at) {
      return NextResponse.json(
        { error: "Booking already collected" },
        { status: 400 }
      );
    }

    if (flow === "return" && !booking.collected_at) {
      return NextResponse.json(
        { error: "Booking must be collected before return" },
        { status: 400 }
      );
    }

    if (flow === "return" && booking.status === "completed") {
      return NextResponse.json(
        { error: "Booking already returned" },
        { status: 400 }
      );
    }

    // Atomically update booking
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: newStatus,
        collected_at: new Date().toISOString(),
        collected_by: authUser.id,
        collection_method: "qr",
        collection_token_hash: null, // Clear token to prevent reuse
        collection_token_expires_at: null,
      })
      .eq("booking_id", booking_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Create notification
    await createNotification(
      notificationTarget,
      "booking_confirmed",
      flow === "borrow" ? "Item Collected" : "Item Returned",
      notificationMessage,
      {
        booking_id: booking_id,
        product_id: booking.product.product_id,
        collected_by: authUser.id,
        collection_method: "qr",
      }
    );

    // Send system message in conversation
    try {
      const conversationParticipants = [
        booking.borrower.uuid,
        booking.lender.uuid,
      ];
      const otherParticipant = conversationParticipants.find(
        (id) => id !== authUser.id
      );

      if (otherParticipant) {
        await sendMessage(
          authUser.id,
          otherParticipant,
          `System: ${notificationMessage}`,
          booking.product.product_id
        );
      }
    } catch (messageError) {
      console.warn("Failed to send system message:", messageError);
      // Don't fail the whole operation if messaging fails
    }

    return NextResponse.json({
      ok: true,
      booking: updatedBooking,
      message:
        flow === "borrow"
          ? "Item collection confirmed successfully"
          : "Item return confirmed successfully",
    });
  } catch (error) {
    console.error("Collection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
