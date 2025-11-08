import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    // Check if this is a new user who signed up with OAuth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", user.id)
        .single();

      if (userCheckError && userCheckError.code === "PGRST116") {
        // User doesn't exist in users table, create them
        const { error: insertError } = await supabase.from("users").insert({
          uuid: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          role: "both", // Default role for OAuth users
        });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          // Continue anyway, user can complete profile later
        }
      }
    }
  }

  // Check if there's a stored redirect URL
  const redirectTo = requestUrl.searchParams.get("redirectTo");

  if (redirectTo && redirectTo !== "/login" && redirectTo !== "/signup") {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
