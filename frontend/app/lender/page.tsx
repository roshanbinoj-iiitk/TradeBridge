"use client";

import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Product, Transaction } from "@/types/db";
import { updateTransactionStatus } from "@/lib/transactions";

export default function LenderPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [rentalRequests, setRentalRequests] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLenderData();
    }
    // fetchLenderData is stable, so it's safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const fetchLenderData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      const supabase = createClient();

      console.log("Fetching lender data for user:", user?.id);

      // Fetch lender's products
      const { data: lenderProducts, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("lender_id", user?.id)
        .order("product_id", { ascending: false });

      if (productError) {
        console.error("Error fetching products:", productError);
        setError(`Failed to load products: ${productError.message}`);
        return;
      }

      console.log("Fetched products:", lenderProducts);

      // Fetch product images for all products
      const productIds = lenderProducts?.map((p) => p.product_id) || [];
      let productImages: any[] = [];

      if (productIds.length > 0) {
        const { data: images, error: imageError } = await supabase
          .from("product_images")
          .select("*")
          .in("product_id", productIds);

        if (imageError) {
          console.error("Error fetching product images:", imageError);
        } else {
          productImages = images || [];
        }
      }

      // Enrich products with images
      const enrichedProducts =
        lenderProducts?.map((product) => ({
          ...product,
          images: productImages.filter(
            (img) => img.product_id === product.product_id
          ),
        })) || [];

      setProducts(enrichedProducts);

      // Fetch pending rental requests for lender's products
      const { data: requests, error: requestError } = await supabase
        .from("transactions")
        .select("*")
        .eq("lender_id", user?.id)
        .eq("status", "pending")
        .order("transaction_id", { ascending: false });

      if (requestError) {
        console.error("Error fetching rental requests:", requestError);
      } else {
        console.log("Fetched rental requests:", requests);

        if (requests && requests.length > 0) {
          // Get borrower details and product details for requests
          const borrowerIds = requests.map((r) => r.borrower_id);
          const requestProductIds = requests.map((r) => r.product_id);

          // Fetch borrowers
          const { data: borrowers, error: borrowerError } = await supabase
            .from("users")
            .select("*")
            .in("uuid", borrowerIds);

          if (borrowerError) {
            console.error("Error fetching borrowers:", borrowerError);
          }

          // Fetch products for requests
          const { data: requestProducts, error: reqProductError } =
            await supabase
              .from("products")
              .select("*")
              .in("product_id", requestProductIds);

          if (reqProductError) {
            console.error("Error fetching request products:", reqProductError);
          }

          // Enrich requests with borrower and product data
          const enrichedRequests = requests.map((request) => {
            const borrower = borrowers?.find(
              (b) => b.uuid === request.borrower_id
            );
            const product = requestProducts?.find(
              (p) => p.product_id === request.product_id
            );

            return {
              ...request,
              borrower,
              product,
            };
          });

          setRentalRequests(enrichedRequests);
        } else {
          setRentalRequests([]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load lender data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleRequestAction = async (
    transactionId: number,
    action: "approved" | "rejected"
  ) => {
    try {
      setActionLoading(transactionId);
      await updateTransactionStatus(transactionId, action);

      // Refresh the data
      await fetchLenderData();

      // Show success message (you can add a toast here)
      console.log(`Request ${action} successfully`);
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      setError(`Failed to ${action} request. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getProductAvailabilityStatus = (product: Product) => {
    if (!product.availability)
      return { text: "Unavailable", color: "bg-red-500" };

    const now = new Date();
    const startDate = product.start_date ? new Date(product.start_date) : null;
    const endDate = product.end_date ? new Date(product.end_date) : null;

    if (startDate && now < startDate) {
      return { text: "Available Later", color: "bg-yellow-500" };
    }

    if (endDate && now > endDate) {
      return { text: "Expired", color: "bg-red-500" };
    }

    return { text: "Available", color: "bg-green-500" };
  };

  const getImageUrl = (product: Product) => {
    // First try the main image_url from products table
    if (product.image_url) {
      return product.image_url;
    }
    // Then try the first image from product_images table
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url;
    }
    return null;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || !user)
    return <div className="text-center py-10 text-taupe">Loading...</div>;

  if (dataLoading)
    return (
      <div className="text-center py-10 text-taupe">Loading products...</div>
    );

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={fetchLenderData}
            className="bg-jet text-isabelline hover:bg-taupe"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet">My Products</h1>
        <div className="flex gap-4">
          <Button
            onClick={fetchLenderData}
            variant="outline"
            className="border-jet text-jet hover:bg-jet hover:text-isabelline"
          >
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/products/new")}
            className="bg-jet text-isabelline hover:bg-taupe"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-jet mb-4">
          Rental Requests ({rentalRequests.length})
        </h2>
        {rentalRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentalRequests.map((request) => (
              <Card key={request.transaction_id}>
                <CardHeader>
                  <CardTitle>Request for {request.product?.name}</CardTitle>
                  <CardDescription>
                    From: {request.borrower?.name || "Unknown User"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-taupe">
                    Dates: {formatDate(request.start_date)} -{" "}
                    {formatDate(request.end_date)}
                  </p>
                  <p className="text-sm text-taupe">
                    Contact:{" "}
                    {request.borrower?.contact ||
                      request.borrower?.email ||
                      "No contact info"}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() =>
                      handleRequestAction(request.transaction_id, "approved")
                    }
                    disabled={actionLoading === request.transaction_id}
                  >
                    {actionLoading === request.transaction_id
                      ? "Approving..."
                      : "Approve"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handleRequestAction(request.transaction_id, "rejected")
                    }
                    disabled={actionLoading === request.transaction_id}
                  >
                    {actionLoading === request.transaction_id
                      ? "Rejecting..."
                      : "Deny"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-taupe">You have no pending rental requests.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">
          My Listed Products ({products.length})
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const status = getProductAvailabilityStatus(product);
              const imageUrl = getImageUrl(product);

              return (
                <Card key={product.product_id} className="overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>₹{product.price} / day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className={`${status.color} text-white mb-2`}>
                      {status.text}
                    </Badge>
                    <p className="text-sm text-taupe">{product.description}</p>
                    {product.start_date && (
                      <p className="text-xs text-taupe">
                        Available from: {formatDate(product.start_date)}
                      </p>
                    )}
                    {product.end_date && (
                      <p className="text-xs text-taupe">
                        Available until: {formatDate(product.end_date)}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/products/${product.product_id}`)
                      }
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        console.log("Edit product:", product.product_id);
                      }}
                    >
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-taupe mb-4">
              You haven&apos;t listed any products yet.
            </p>
            <Button
              onClick={() => router.push("/products/new")}
              className="bg-jet text-isabelline hover:bg-taupe"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
