import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, IndianRupee, Scan, QrCode } from "lucide-react";
import { QRScanner } from "@/components/ui/qr-scanner";
import { QRDisplay } from "@/components/ui/qr-display";
import { Booking } from "@/types/db";

interface BookingCardProps {
  booking: Booking;
  type: "borrowing" | "lending";
  onScanSuccess: () => void;
  onBookingAction?: (
    bookingId: number,
    action: "confirmed" | "cancelled"
  ) => void;
}

export default function BookingCard({
  booking,
  type,
  onScanSuccess,
  onBookingAction,
}: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      active: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      disputed: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-jet">
            {booking.product?.name || "Product"}
          </h4>
          <p className="text-sm text-taupe">
            {type === "borrowing" ? "Lender" : "Borrower"}:{" "}
            {type === "borrowing"
              ? booking.lender?.name || "Unknown"
              : booking.borrower?.name || "Unknown"}
          </p>
        </div>
        {getStatusBadge(booking.status)}
      </div>

      <div className="flex items-center text-sm text-taupe space-x-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {booking.start_date && (
            <span>{new Date(booking.start_date).toLocaleDateString()}</span>
          )}
          {booking.end_date && (
            <span>
              {" - "}
              {new Date(booking.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <IndianRupee className="h-4 w-4 mr-1" />
          <span>{booking.total_amount || 0} total</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-2">
        {booking.status === "confirmed" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                {type === "borrowing" ? (
                  <>
                    <Scan className="h-4 w-4 mr-1" />
                    Scan Collection QR
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-1" />
                    Collection QR
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {type === "borrowing"
                    ? "Scan Collection QR Code"
                    : "Collection QR Code"}
                </DialogTitle>
              </DialogHeader>
              {type === "borrowing" ? (
                <QRScanner
                  expectedFlow="borrow"
                  onScanSuccess={onScanSuccess}
                />
              ) : (
                <QRDisplay
                  bookingId={booking.booking_id}
                  flow="borrow"
                  onSuccess={onScanSuccess}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {booking.status === "active" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                {type === "borrowing" ? (
                  <>
                    <Scan className="h-4 w-4 mr-1" />
                    Scan Return QR
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-1" />
                    Return QR
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {type === "borrowing"
                    ? "Scan Return QR Code"
                    : "Return QR Code"}
                </DialogTitle>
              </DialogHeader>
              {type === "borrowing" ? (
                <QRScanner
                  expectedFlow="return"
                  onScanSuccess={onScanSuccess}
                />
              ) : (
                <QRDisplay
                  bookingId={booking.booking_id}
                  flow="return"
                  onSuccess={onScanSuccess}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {booking.status === "pending" &&
          type === "lending" &&
          onBookingAction && (
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBookingAction(booking.booking_id, "confirmed")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBookingAction(booking.booking_id, "cancelled")}
              >
                Decline
              </Button>
            </div>
          )}
      </div>
    </Card>
  );
}
