import { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Booking, Product, User } from "@/types/db";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  activeBorrowings: number;
  activeLendings: number;
  pendingRequests: number;
  totalEarnings: number;
  myProducts: number;
}

interface DashboardData {
  borrowingTransactions: Booking[];
  lendingTransactions: Booking[];
  myProducts: Product[];
  stats: DashboardStats;
}

export function useDashboardData(user: User | null) {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    borrowingTransactions: [],
    lendingTransactions: [],
    myProducts: [],
    stats: {
      activeBorrowings: 0,
      activeLendings: 0,
      pendingRequests: 0,
      totalEarnings: 0,
      myProducts: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    const supabase = createClient();

    try {
      // Fetch borrowing bookings
      const { data: borrowingBookings } = await supabase
        .from("bookings")
        .select(
          `
          *,
          product:products(*),
          lender:users!bookings_lender_id_fkey(*)
        `
        )
        .eq("borrower_id", user.id);

      // Fetch lending bookings
      const { data: lendingBookings } = await supabase
        .from("bookings")
        .select(
          `
          *,
          product:products(*),
          borrower:users!bookings_borrower_id_fkey(*)
        `
        )
        .eq("lender_id", user.id);

      // Fetch user's products
      const { data: myProducts } = await supabase
        .from("products")
        .select("*")
        .eq("lender_id", user.id);

      // Calculate stats
      const activeBorrowings =
        borrowingBookings?.filter(
          (b) =>
            b.status === "active" ||
            b.status === "confirmed" ||
            b.status === "paid"
        ).length || 0;

      const activeLendings =
        lendingBookings?.filter(
          (b) =>
            b.status === "active" ||
            b.status === "confirmed" ||
            b.status === "paid"
        ).length || 0;

      const pendingRequests =
        lendingBookings?.filter((b) => b.status === "pending").length || 0;

      const totalEarnings =
        lendingBookings?.reduce((sum, booking) => {
          if (booking.status === "completed") {
            return sum + (booking.total_amount || 0);
          }
          return sum;
        }, 0) || 0;

      setDashboardData({
        borrowingTransactions: borrowingBookings || [],
        lendingTransactions: lendingBookings || [],
        myProducts: myProducts || [],
        stats: {
          activeBorrowings,
          activeLendings,
          pendingRequests,
          totalEarnings,
          myProducts: myProducts?.length || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleBookingAction = async (
    bookingId: number,
    action: "confirmed" | "cancelled"
  ) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bookings")
        .update({ status: action })
        .eq("booking_id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${action} successfully.`,
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  return {
    dashboardData,
    isLoading,
    fetchDashboardData,
    handleBookingAction,
  };
}
