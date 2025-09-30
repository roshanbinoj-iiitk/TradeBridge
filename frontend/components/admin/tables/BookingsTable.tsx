import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { BookingAction } from "@/types/admin";

interface Booking {
  booking_id: number;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
  product?: {
    name: string;
  };
  borrower?: {
    name: string;
  };
  lender?: {
    name: string;
  };
}

interface BookingsTableProps {
  bookings: Booking[];
  onBookingAction: (bookingId: number, action: BookingAction) => void;
  onBookingView: (bookingId: number) => void;
}

export function BookingsTable({
  bookings,
  onBookingAction,
  onBookingView,
}: BookingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 && (
            <div className="p-4 border rounded-lg text-taupe">
              No bookings found.
            </div>
          )}

          {bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{booking.product?.name}</p>
                <p className="text-sm text-taupe">
                  {booking.borrower?.name} → {booking.lender?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                  <span className="text-xs text-taupe">
                    ₹{booking.total_amount}
                  </span>
                  <span className="text-xs text-taupe">
                    {new Date(booking.start_date).toLocaleDateString()} -{" "}
                    {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBookingView(booking.booking_id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {booking.status === "pending" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        onBookingAction(booking.booking_id, "approve")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        onBookingAction(booking.booking_id, "reject")
                      }
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
