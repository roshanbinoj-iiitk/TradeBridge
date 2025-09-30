import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import crypto from "crypto";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  try {
    const bookingIdNum = Number(bookingId);
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get authenticated user
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
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        product:products(lender_id),
        borrower:users!bookings_borrower_id_fkey(uuid, name),
        lender:users!bookings_lender_id_fkey(uuid, name)
      `
      )
      .eq("booking_id", bookingIdNum)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Determine flow based on query parameter or infer from user role
    const url = new URL(request.url);
    const flow = url.searchParams.get("flow") || "borrow";

    // Validate authorization based on flow
    let isAuthorized = false;
    if (flow === "borrow") {
      // Lender shows QR, borrower scans
      isAuthorized = booking.lender.uuid === authUser.id;
    } else if (flow === "return") {
      // Lender shows QR, borrower scans (same as borrow flow)
      isAuthorized = booking.lender.uuid === authUser.id;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized to generate QR for this booking" },
        { status: 403 }
      );
    }

    // Check if booking is in appropriate state for collection
    if (flow === "borrow" && !["paid", "confirmed"].includes(booking.status)) {
      return NextResponse.json(
        {
          error: "Booking must be paid or confirmed to generate collection QR",
        },
        { status: 400 }
      );
    }

    if (flow === "return" && booking.status !== "active") {
      return NextResponse.json(
        { error: "Booking must be active to generate return QR" },
        { status: 400 }
      );
    }

    // Additional check for return flow - must have been collected first
    if (flow === "return" && !booking.collected_at) {
      return NextResponse.json(
        { error: "Item must be collected before generating return QR" },
        { status: 400 }
      );
    }

    // Generate JWT payload
    const payload = {
      booking_id: bookingIdNum,
      action: "collect",
      flow,
      issuer: authUser.id,
      iat: Math.floor(Date.now() / 1000),
    };

    const secret =
      process.env.QR_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign(payload, secret, { expiresIn: "10m" });
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store token hash in database using admin client (bypasses RLS)
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        collection_token_hash: tokenHash,
        collection_token_expires_at: expiresAt,
      })
      .eq("booking_id", bookingIdNum);

    if (updateError) {
      console.error("Failed to update booking with token hash:", updateError);
      return NextResponse.json(
        { error: "Failed to generate QR token" },
        { status: 500 }
      );
    }

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 256,
    });

    return NextResponse.json({
      qrDataUrl,
      expiresIn: 600, // 10 minutes in seconds
      flow,
      bookingId: bookingIdNum,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
