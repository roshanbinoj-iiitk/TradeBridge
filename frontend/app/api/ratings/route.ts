import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transaction_id, ratee_id, rating, comment } = await req.json();

  // Validate transaction and user participation
  const { data: txn } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_id", transaction_id)
    .single();
  if (
    !txn ||
    txn.status !== "completed" ||
    (txn.lender_id !== user.id && txn.borrower_id !== user.id)
  ) {
    return NextResponse.json(
      { error: "Invalid transaction or not allowed" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert({
      transaction_id,
      rater_id: user.id,
      ratee_id,
      rating,
      comment,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
