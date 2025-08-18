import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("transactions")
    .select("*, product:products(*), borrower:profiles(*), lender:profiles(*)")
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, start_date, end_date } = await req.json();

  // Get product and lender
  const { data: product } = await supabase
    .from("products")
    .select("lender_id")
    .eq("product_id", product_id)
    .single();
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      product_id,
      borrower_id: user.id,
      lender_id: product.lender_id,
      start_date,
      end_date,
      status: "pending",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
