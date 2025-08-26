import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Also create a service role client for admin operations
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting user deletion for:", user.id);

    // Manual cascade deletion in the correct order
    try {
      // 1. Delete ratings first (depends on transactions)
      const { error: ratingsError } = await supabase
        .from("ratings")
        .delete()
        .or(`rater_id.eq.${user.id},ratee_id.eq.${user.id}`);

      if (ratingsError) {
        console.log("Ratings deletion:", ratingsError.message);
        // Continue even if ratings deletion fails
      }

      // 2. Delete reviews (if table exists)
      const { error: reviewsError } = await supabase
        .from("reviews")
        .delete()
        .or(`reviewer_id.eq.${user.id},reviewee_id.eq.${user.id}`);

      if (reviewsError) {
        console.log("Reviews deletion:", reviewsError.message);
        // Continue even if reviews deletion fails
      }

      // 3. Delete bookings (if table exists)
      const { error: bookingsError } = await supabase
        .from("bookings")
        .delete()
        .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);

      if (bookingsError) {
        console.log("Bookings deletion:", bookingsError.message);
        // Continue even if bookings deletion fails
      }

      // 4. Delete transactions
      const { error: transactionsError } = await supabase
        .from("transactions")
        .delete()
        .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);

      if (transactionsError) {
        console.log("Transactions deletion:", transactionsError.message);
        // Continue even if transactions deletion fails
      }

      // 5. Delete product images for user's products
      const { data: userProducts } = await supabase
        .from("products")
        .select("product_id")
        .eq("lender_id", user.id);

      if (userProducts && userProducts.length > 0) {
        const productIds = userProducts.map((p) => p.product_id);
        const { error: imagesError } = await supabase
          .from("product_images")
          .delete()
          .in("product_id", productIds);

        if (imagesError) {
          console.log("Product images deletion:", imagesError.message);
        }
      }

      // 6. Delete products
      const { error: productsError } = await supabase
        .from("products")
        .delete()
        .eq("lender_id", user.id);

      if (productsError) {
        console.log("Products deletion:", productsError.message);
        // Continue even if products deletion fails
      }

      // 7. Delete other user-related data
      const relatedTables = [
        "wishlists",
        "price_alerts",
        "product_views",
        "search_history",
        "user_trust_scores",
        "user_profiles",
        "user_follows",
        "forum_posts",
        "forum_replies",
        "forum_likes",
        "social_shares",
        "user_activities",
        "user_badges",
        "notifications",
        "notification_settings",
      ];

      for (const table of relatedTables) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("user_id", user.id);

          if (error && !error.message.includes("does not exist")) {
            console.log(`${table} deletion:`, error.message);
          }
        } catch (err) {
          console.log(`${table} deletion failed:`, err);
        }
      }

      // Handle tables with different column names
      try {
        // Delete follows where user is follower or following
        await supabase
          .from("user_follows")
          .delete()
          .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
      } catch (err) {
        console.log("User follows deletion failed:", err);
      }

      try {
        // Delete forum content
        await supabase.from("forum_posts").delete().eq("author_id", user.id);
        await supabase.from("forum_replies").delete().eq("author_id", user.id);
      } catch (err) {
        console.log("Forum content deletion failed:", err);
      }

      // 8. Finally delete the user from users table
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("uuid", user.id);

      if (deleteError) {
        console.error("Error deleting user data:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete user data: " + deleteError.message },
          { status: 500 }
        );
      }

      console.log("User data deleted successfully");
    } catch (cascadeError) {
      console.error("Error in cascade deletion:", cascadeError);
      return NextResponse.json(
        { error: "Failed to delete related user data" },
        { status: 500 }
      );
    }

    // Sign out the user first
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Error signing out user:", signOutError);
      // Continue even if sign out fails
    }

    // Delete the auth user using admin client
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      // Don't fail the whole operation if auth deletion fails
      // The user data is already deleted from our tables
      console.log("User data deleted but auth user deletion failed");
    } else {
      console.log("Auth user deleted successfully");
    }

    console.log("User deletion completed successfully");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during account deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
