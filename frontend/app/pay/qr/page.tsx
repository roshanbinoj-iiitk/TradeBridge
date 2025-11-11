"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function QRPaymentContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const productId = searchParams.get("productId");
        const rentalDays = searchParams.get("days") || "1";

        if (!productId) {
          setErrorMessage("Invalid QR code - missing product information");
          setStatus("error");
          return;
        }

        // Create checkout session
        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: parseInt(productId),
            rentalDays: parseInt(rentalDays),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.needsConnect) {
            setErrorMessage(
              "The seller hasn't set up payments yet. Please contact them directly."
            );
          } else {
            setErrorMessage(data.error || "Failed to create payment session");
          }
          setStatus("error");
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          setErrorMessage("Payment session created but no redirect URL");
          setStatus("error");
        }
      } catch (error) {
        console.error("Payment initiation error:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setStatus("error");
      }
    };

    initiatePayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Setting up payment...
            </h1>
            <p className="text-gray-600">
              You'll be redirected to Stripe Checkout in a moment.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Setup Failed
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function QRPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <QRPaymentContent />
    </Suspense>
  );
}
