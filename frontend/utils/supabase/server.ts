import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure env vars are set
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

export const createClient = async (cookieStore?: any) => {
  // If cookieStore is provided, use SSR client (for authenticated requests)
  if (cookieStore) {
    // Await the cookies if it's a function/promise
    const store =
      typeof cookieStore === "function" ? await cookieStore() : cookieStore;
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          try {
            return store?.getAll ? store.getAll() : [];
          } catch {
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }: any) =>
                store?.set && store.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    });
  }
  // Otherwise, use the public client (for unauthenticated/public requests)
  return createSupabaseJsClient(supabaseUrl, supabaseKey);
};

export const publicClient = createSupabaseJsClient(supabaseUrl, supabaseKey);
