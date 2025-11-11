"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StripeConnectCardProps {
  userId?: string;
}

export default function StripeConnectCard({ userId }: StripeConnectCardProps) {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<{
    connected: boolean;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
    accountId?: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/connect", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      } else {
        setAccountStatus({ connected: false, chargesEnabled: false, detailsSubmitted: false });
      }
    } catch (err) {
      console.error("Error fetching Stripe status:", err);
      setAccountStatus({ connected: false, chargesEnabled: false, detailsSubmitted: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError("");

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe account link");
      }

      // Open Stripe onboarding in new window
      if (data.url) {
        window.open(data.url, "_blank");
        
        // Poll for account status after a delay
        setTimeout(() => {
          fetchAccountStatus();
        }, 3000);
      }
    } catch (err) {
      console.error("Error connecting Stripe:", err);
      setError(err instanceof Error ? err.message : "Failed to connect Stripe account");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>Loading payment account status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Account (Stripe)
          {accountStatus?.chargesEnabled && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          Connect your Stripe account to receive payments from rentals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!accountStatus?.connected ? (
          <>
            <p className="text-sm text-gray-600">
              To list products and receive payments, you need to connect a
              Stripe account. This is quick, secure, and free to set up.
            </p>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect Stripe Account
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    Stripe Account Connected
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your Stripe account is active and ready to receive payments.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Account Status</p>
                <p className="font-medium">
                  {accountStatus.chargesEnabled ? "Active" : "Pending Setup"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Details Submitted</p>
                <p className="font-medium">
                  {accountStatus.detailsSubmitted ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {!accountStatus.chargesEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your account setup is incomplete. Complete your Stripe
                  onboarding to start receiving payments.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleConnect}
                disabled={connecting}
                className="flex-1"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage Account
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={fetchAccountStatus}
                disabled={loading}
              >
                Refresh Status
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Powered by Stripe. Your financial information is secure and
            encrypted. TradeBridge takes a 10% platform fee on each transaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
