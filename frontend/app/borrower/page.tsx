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
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Transaction } from "@/types/db";

export default function BorrowerPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuthRedirect();
  const router = useRouter();
  const [rentals, setRentals] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowerRentalsData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      const supabase = createClient();

      console.log("Fetching rentals for user:", user?.id);

      // Fetch bookings for this borrower
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("borrower_id", user?.id)
        .order("start_date", { ascending: false });

      if (bookingError) {
        console.error("Error fetching bookings:", bookingError);
        setError(`Failed to load rentals: ${bookingError.message}`);
        return;
      }

      console.log("Fetched bookings:", bookings);

      if (!bookings || bookings.length === 0) {
        setRentals([]);
        return;
      }

      // Get all unique product IDs
      const productIds = bookings.map((b) => b.product_id);
      // Get all unique lender IDs
      const lenderIds = bookings.map((b) => b.lender_id);

      // Fetch products
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("*")
        .in("product_id", productIds);
      if (productError) {
        console.error("Error fetching products:", productError);
      }

      // Fetch product images
      const { data: productImages, error: imageError } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", productIds);
      if (imageError) {
        console.error("Error fetching product images:", imageError);
      }

      // Fetch lenders
      const { data: lenders, error: lenderError } = await supabase
        .from("users")
        .select("*")
        .in("uuid", lenderIds);
      if (lenderError) {
        console.error("Error fetching lenders:", lenderError);
      }

      // Combine the data
      const enrichedRentals = bookings.map((booking) => {
        const product = products?.find(
          (p) => p.product_id === booking.product_id
        );
        const lender = lenders?.find((l) => l.uuid === booking.lender_id);
        const images =
          productImages?.filter(
            (img) => img.product_id === booking.product_id
          ) || [];

        return {
          ...booking,
          product: product
            ? {
                ...product,
                lender,
                images,
              }
            : null,
        };
      });

      console.log("Enriched rentals:", enrichedRentals);
      setRentals(enrichedRentals || []);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load rental data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBorrowerRentalsData();
    }
  }, [user]);

  if (authLoading || !user)
    return <div className="text-center py-10 text-taupe">Loading...</div>;

  if (dataLoading)
    return (
      <div className="text-center py-10 text-taupe">Loading rentals...</div>
    );

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => fetchBorrowerRentalsData()}
            className="bg-jet text-isabelline hover:bg-taupe"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  // Bookings status: pending, confirmed, paid, active, completed, cancelled, disputed
  const currentRentals = rentals.filter(
    (rental) =>
      ["confirmed", "paid", "active"].includes(rental.status) &&
      new Date(rental.end_date || "") >= new Date()
  );

  const pendingRequests = rentals.filter(
    (rental) => rental.status === "pending"
  );

  const rentalHistory = rentals.filter(
    (rental) =>
      rental.status === "completed" ||
      (["confirmed", "paid", "active"].includes(rental.status) &&
        new Date(rental.end_date || "") < new Date())
  );

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      confirmed: "bg-green-500 text-white",
      paid: "bg-green-600 text-white",
      active: "bg-blue-500 text-white",
      completed: "bg-gray-700 text-white",
      cancelled: "bg-red-500 text-white",
      disputed: "bg-orange-500 text-white",
    };
    return statusColors[status] || "bg-gray-500 text-white";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const RentalCard = ({ rental }: { rental: any }) => {
    const getImageUrl = () => {
      // First try the main image_url from products table
      if (rental.product?.image_url) {
        return rental.product.image_url;
      }
      // Then try the first image from product_images table
      if (rental.product?.images && rental.product.images.length > 0) {
        return rental.product.images[0].image_url;
      }
      return null;
    };

    const imageUrl = getImageUrl();

    return (
      <Card className="overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={rental.product?.name || "Product"}
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
          <CardTitle className="flex items-center justify-between">
            {rental.product?.name}
            <Badge className={getStatusBadge(rental.status)}>
              {rental.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Rented from: {rental.product?.lender?.name || "Unknown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-taupe">
            Start: {formatDate(rental.start_date)}
          </p>
          <p className="text-sm text-taupe">
            End: {formatDate(rental.end_date)}
          </p>
          <p className="text-sm text-jet font-medium">
            Daily Rate: ₹{rental.product?.price}
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-jet text-isabelline hover:bg-taupe">
            Contact Lender
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet">My Rentals</h1>
        <Button
          onClick={() => fetchBorrowerRentalsData()}
          variant="outline"
          className="border-jet text-jet hover:bg-jet hover:text-isabelline"
        >
          Refresh
        </Button>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-jet mb-4">
          Current Rentals ({currentRentals.length})
        </h2>
        {currentRentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRentals.map((rental) => (
              <RentalCard key={rental.transaction_id} rental={rental} />
            ))}
          </div>
        ) : (
          <p className="text-taupe">You have no current rentals.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((rental) => (
              <RentalCard key={rental.transaction_id} rental={rental} />
            ))}
          </div>
        ) : (
          <p className="text-taupe">You have no pending rental requests.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">
          Rental History ({rentalHistory.length})
        </h2>
        {rentalHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentalHistory.map((rental) => (
              <RentalCard key={rental.transaction_id} rental={rental} />
            ))}
          </div>
        ) : (
          <p className="text-taupe">Your rental history is empty.</p>
        )}
      </section>
    </div>
  );
}
