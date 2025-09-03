"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRDisplayProps {
  bookingId: number;
  flow: "borrow" | "return";
  onSuccess?: () => void;
}

export function QRDisplay({ bookingId, flow, onSuccess }: QRDisplayProps) {
  const [qrData, setQrData] = useState<{
    qrDataUrl: string;
    expiresIn: number;
    flow: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  const generateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/bookings/${bookingId}/qr?flow=${flow}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrData(data);
      setTimeLeft(data.expiresIn);

      toast({
        title: "QR Code Generated",
        description: "Show this QR code to the other party for scanning",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qrData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setQrData(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [qrData, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {flow === "borrow" ? "Collection QR Code" : "Return QR Code"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qrData ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrData.qrDataUrl}
                alt="QR Code"
                className="border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {flow === "borrow"
                ? "Have the borrower scan this code to confirm collection"
                : "Have the lender scan this code to confirm return"}
            </div>

            <Button
              onClick={generateQR}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate QR
            </Button>
          </div>
        ) : (
          <Button onClick={generateQR} className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Generate QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
