import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Pagination and filtering
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  let query = supabaseAdmin
    .from("products")
    .select("*, images:product_images(*), lender:users(*)")
    .eq("availability", true);

  if (category) query = query.eq("category", category);
  if (minPrice) query = query.gte("price", minPrice);
  if (maxPrice) query = query.lte("price", maxPrice);

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data?.map((product) => ({
    ...product,
    images: product.images || [],
  }));

  return NextResponse.json(products, { status: 200 });
}

// NOTE: The POST route still uses the user-context client to respect user permissions.
// This is important for security.
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "lender") {
    return NextResponse.json(
      { error: "Only lenders can create products" },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const productData = JSON.parse(formData.get("product") as string);
  const images = formData.getAll("images") as File[];

  const { data: product, error: prodErr } = await supabase
    .from("products")
    .insert({ ...productData, lender_id: user.id })
    .select()
    .single();

  if (prodErr)
    return NextResponse.json({ error: prodErr.message }, { status: 400 });

  const imageRecords = [];
  for (const file of images) {
    if (!(file instanceof Blob)) continue;

    const { data: storageData, error: storageErr } = await supabase.storage
      .from("product-images")
      .upload(`${product.product_id}/${file.name}`, file, { upsert: true });

    if (storageErr) {
      return NextResponse.json({ error: storageErr.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storageData.path);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL for image." },
        { status: 500 }
      );
    }

    const { data: imgData, error: imgErr } = await supabase
      .from("product_images")
      .insert({
        product_id: product.product_id,
        image_url: publicUrlData.publicUrl,
      })
      .select()
      .single();

    if (imgErr) {
      return NextResponse.json({ error: imgErr.message }, { status: 500 });
    }

    if (imgData) imageRecords.push(imgData);
  }

  return NextResponse.json(
    { ...product, images: imageRecords },
    { status: 201 }
  );
}
