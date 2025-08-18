import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient(cookies());

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  return NextResponse.json(
    { user: data.user, session: data.session },
    { status: 200 }
  );
}
