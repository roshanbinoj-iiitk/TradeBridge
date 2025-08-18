import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());
  await supabase.auth.signOut();
  return NextResponse.json({ message: "Signed out" }, { status: 200 });
}
