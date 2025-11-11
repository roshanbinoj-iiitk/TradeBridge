"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/components/shared/AuthContext";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    const id = searchParams.get("session_id");
    const booking = searchParams.get("booking_id");
    const dummy = searchParams.get("dummy");

    console.log("Payment success page params:", { id, booking, dummy });

    setSessionId(id);
    setBookingId(booking);

    // Update booking status if booking_id is present and user is authenticated
    if (booking && id && user && !authLoading) {
      updateBookingStatus(booking, id);
    }
  }, [searchParams, user, authLoading]);

  useEffect(() => {
    // Start countdown for redirect
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to dashboard when countdown reaches 0
      router.push("/dashboard");
    }
  }, [redirectCountdown, router]);

  const updateBookingStatus = async (bookingId: string, sessionId: string) => {
    console.log(
      "Updating booking status for bookingId:",
      bookingId,
      "sessionId:",
      sessionId
    );
    setUpdating(true);
    try {
      const response = await fetch("/api/bookings/update-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: parseInt(bookingId),
          sessionId,
        }),
      });

      const data = await response.json();
      console.log("Update response:", response.status, data);

      if (!response.ok) {
        console.error("Failed to update booking status");
      } else {
        console.log("Booking status updated successfully");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Your payment has been processed successfully. You'll receive a
          confirmation email shortly.
        </p>

        {authLoading ? (
          <p className="text-sm text-gray-500 mb-6">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Updating booking status...
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to dashboard in {redirectCountdown} second
            {redirectCountdown !== 1 ? "s" : ""}...
          </p>
        )}

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
            <p className="text-xs text-gray-700 font-mono break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View My Bookings
          </Link>
          <Link
            href="/products"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </div>
  );
}