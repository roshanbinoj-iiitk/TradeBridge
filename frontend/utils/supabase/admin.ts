import { createClient } from '@supabase/supabase-js';

// This client is intended for server-side use ONLY.
// It uses the service role key and bypasses all RLS policies.
// NEVER expose this client or the service role key to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
