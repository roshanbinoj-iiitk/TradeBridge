import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(cookies());
  const { id } = params;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();

  // Get transaction
  const { data: txn } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_id", id)
    .single();
  if (!txn)
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 }
    );

  // Authorization logic
  if (
    (txn.status === "pending" &&
      txn.lender_id === user.id &&
      ["approved", "rejected"].includes(status)) ||
    ((txn.lender_id === user.id || txn.borrower_id === user.id) &&
      status === "completed")
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .update({ status })
      .eq("transaction_id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
