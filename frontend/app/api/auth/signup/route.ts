import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const {
    email,
    password,
    name,
    role = "borrower",
    contact,
  } = await req.json();
  const supabase = createClient(cookies());

  // Sign up user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, contact },
    },
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Profile row is auto-created by trigger
  return NextResponse.json({ user: data.user }, { status: 201 });
}
