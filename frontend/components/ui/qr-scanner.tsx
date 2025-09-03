"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, CameraOff, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess?: (result: string) => void;
  onScanError?: (error: string) => void;
  expectedFlow?: "borrow" | "return";
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  expectedFlow,
}: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (!scannerRef.current) return;

    setError(null);
    setSuccess(false);
    setScanning(true);

    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    qrScanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
        // Only log errors, don't show to user as they're usually just "No QR code found"
        console.debug("QR scan error:", errorMessage);
      }
    );

    setScanner(qrScanner);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setScanning(false);
  };

  const handleScanSuccess = async (token: string) => {
    try {
      setScanning(false);
      if (scanner) {
        scanner.clear().catch(console.error);
        setScanner(null);
      }

      const response = await fetch("/api/bookings/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process QR code");
      }

      setSuccess(true);
      toast({
        title: "Success!",
        description:
          expectedFlow === "borrow"
            ? "Item collection confirmed successfully"
            : "Item return confirmed successfully",
      });

      onScanSuccess?.(token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process QR code";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      onScanError?.(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Collection confirmed successfully!
            </AlertDescription>
          </Alert>
        )}

        <div id="qr-reader" ref={scannerRef} className="w-full" />

        {!scanning && !success && (
          <Button onClick={startScanning} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        )}

        {scanning && (
          <div className="space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              Position the QR code within the camera view
            </div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}

        {expectedFlow && (
          <div className="text-center text-sm text-muted-foreground">
            Scanning for {expectedFlow === "borrow" ? "collection" : "return"}{" "}
            QR code
          </div>
        )}
      </CardContent>
    </Card>
  );
}
