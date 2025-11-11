import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get authenticated user
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

    // Get user's email from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, stripe_account_id")
      .eq("uuid", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    let accountId = userData.stripe_account_id;

    // If user doesn't have a Stripe account yet, create one
    if (!accountId) {
      // Check if DUMMY mode is enabled (for testing without Connect)
      const isDummyMode = process.env.STRIPE_DUMMY_MODE === "true";

      if (isDummyMode) {
        // DUMMY MODE: Create a fake account ID for testing
        accountId = `acct_dummy_${user.id.slice(0, 8)}`;
        console.log("⚠️ DUMMY MODE: Using fake Stripe account:", accountId);
      } else {
        // REAL MODE: Create actual Stripe Connect account
        try {
          const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: userData.email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          });
          accountId = account.id;
        } catch (stripeError: any) {
          console.error("Stripe account creation failed:", stripeError.message);

          // If Connect not enabled, suggest dummy mode
          if (stripeError.message?.includes("signed up for Connect")) {
            return NextResponse.json(
              {
                error:
                  "Stripe Connect not enabled. Enable STRIPE_DUMMY_MODE=true in .env.local for testing, or enable Connect in your Stripe Dashboard.",
                needsConnect: true,
              },
              { status: 400 }
            );
          }
          throw stripeError;
        }
      }

      // Save the account ID to the database
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("uuid", user.id);

      if (updateError) {
        console.error("Failed to save Stripe account ID:", updateError);
        return NextResponse.json(
          { error: "Failed to save account information" },
          { status: 500 }
        );
      }
    }

    // Create an account link for onboarding or re-verification
    const origin =
      process.env.NEXT_PUBLIC_ORIGIN || "https://trade-bridge-five.vercel.app";

    // Check if dummy mode
    const isDummyMode = process.env.STRIPE_DUMMY_MODE === "true";

    if (isDummyMode) {
      // DUMMY MODE: Just redirect back with success
      return NextResponse.json({
        success: true,
        url: `${origin}/profile?stripe_connected=1&dummy=true`,
        accountId: accountId,
        isDummy: true,
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/profile?stripe_refresh=1`,
      return_url: `${origin}/profile?stripe_connected=1`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      accountId: accountId,
    });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      {
        error: "Failed to create Stripe account link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check account status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

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

    const { data: userData } = await supabase
      .from("users")
      .select("stripe_account_id")
      .eq("uuid", user.id)
      .single();

    if (!userData?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        detailsSubmitted: false,
      });
    }

    // Check if dummy mode
    const isDummyMode = process.env.STRIPE_DUMMY_MODE === "true";
    const isDummyAccount = userData.stripe_account_id.startsWith("acct_dummy_");

    if (isDummyMode || isDummyAccount) {
      // DUMMY MODE: Return fake successful status
      return NextResponse.json({
        connected: true,
        chargesEnabled: true,
        detailsSubmitted: true,
        accountId: userData.stripe_account_id,
        isDummy: true,
      });
    }

    // Fetch account details from Stripe (real mode only)
    const account = await stripe.accounts.retrieve(userData.stripe_account_id);

    return NextResponse.json({
      connected: true,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      accountId: account.id,
    });
  } catch (error) {
    console.error("Error fetching Stripe account status:", error);
    return NextResponse.json(
      { error: "Failed to fetch account status" },
      { status: 500 }
    );
  }
}
