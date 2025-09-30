import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/db";
import {
  AdminData,
  AdminStats,
  UserAction,
  ProductAction,
  ReviewAction,
  BookingAction,
  ForumAction,
} from "@/types/admin";

export function useAdminPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [adminData, setAdminData] = useState<AdminData>({
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      flaggedPosts: 0,
      totalReviews: 0,
      activeUsers: 0,
      totalForumPosts: 0,
    },
    users: [],
    products: [],
    bookings: [],
    reviews: [],
    forumPosts: [],
    forumReplies: [],
  });

  useEffect(() => {
    if (!authLoading && authUser) {
      checkAdminAccess();
    } else if (!authLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, authLoading, router]);

  const checkAdminAccess = async () => {
    if (!authUser) return;

    const supabase = createClient();
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", authUser.id)
        .single();

      if (error || !userData || userData.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      setCurrentUser(userData);
      fetchAdminData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/");
    }
  };

  const fetchAdminData = async () => {
    const supabase = createClient();

    try {
      // Fetch stats
      const [
        { count: userCount },
        { count: productCount },
        { count: bookingCount },
        { data: revenueData },
        { count: pendingCount },
        { count: flaggedCount },
        { count: reviewCount },
        { count: activeUserCount },
        { count: forumPostCount },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase
          .from("bookings")
          .select("total_amount")
          .eq("status", "completed"),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("forum_posts")
          .select("*", { count: "exact", head: true })
          .eq("is_flagged", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("forum_posts")
          .select("*", { count: "exact", head: true }),
      ]);

      const totalRevenue =
        revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      const stats: AdminStats = {
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue,
        pendingBookings: pendingCount || 0,
        flaggedPosts: flaggedCount || 0,
        totalReviews: reviewCount || 0,
        activeUsers: activeUserCount || 0,
        totalForumPosts: forumPostCount || 0,
      };

      // Fetch recent data
      const [
        { data: allUsers },
        { data: recentProducts },
        { data: recentBookings },
        { data: recentReviews },
        { data: recentPosts },
        { data: recentReplies },
      ] = await Promise.all([
        supabase.from("users").select("*").order("id", { ascending: false }),
        supabase
          .from("products")
          .select("*, lender:users(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select(
            "*, product:products(name), borrower:users(name), lender:users(name)"
          )
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("reviews")
          .select(
            "*, reviewer:users(name), reviewee:users(name), product:products(name)"
          )
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("forum_posts")
          .select("*, author:users(name)")
          .eq("is_flagged", true)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("forum_replies")
          .select("*, author:users(name), post:forum_posts(title)")
          .eq("is_flagged", true)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setAdminData({
        stats,
        users: allUsers || [],
        products: recentProducts || [],
        bookings: recentBookings || [],
        reviews: recentReviews || [],
        forumPosts: recentPosts || [],
        forumReplies: recentReplies || [],
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setFetchError("Failed to load admin data. Try reloading the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: UserAction) => {
    const supabase = createClient();
    try {
      const newRole = action === "ban" ? "banned" : "borrower";
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("uuid", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${action}ned successfully.`,
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user.`,
        variant: "destructive",
      });
    }
  };

  const handleProductAction = async (
    productId: number,
    action: ProductAction
  ) => {
    const supabase = createClient();
    try {
      if (action === "view") {
        router.push(`/products/${productId}`);
      } else if (action === "edit") {
        router.push(`/products/${productId}/edit`);
      } else if (action === "toggle") {
        const product = adminData.products.find(
          (p) => p.product_id === productId
        );
        if (product) {
          const { error } = await supabase
            .from("products")
            .update({ availability: !product.availability })
            .eq("product_id", Number(productId));

          if (error) throw error;

          toast({
            title: "Success",
            description: `Product ${
              !product.availability ? "activated" : "deactivated"
            } successfully.`,
          });
          fetchAdminData();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleReviewAction = async (reviewId: number, action: ReviewAction) => {
    const supabase = createClient();
    try {
      if (action === "feature") {
        const { error } = await supabase
          .from("reviews")
          .update({ is_featured: true })
          .eq("review_id", reviewId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Review featured successfully.",
        });
        fetchAdminData();
      } else if (action === "delete") {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("review_id", reviewId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Review deleted successfully.",
        });
        fetchAdminData();
      } else {
        toast({
          title: "View Review",
          description: "Review details modal will be implemented.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review.",
        variant: "destructive",
      });
    }
  };

  const handleBookingAction = async (
    bookingId: number,
    action: BookingAction
  ) => {
    const supabase = createClient();
    try {
      const status = action === "approve" ? "confirmed" : "cancelled";
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("booking_id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${action}d successfully.`,
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking.",
        variant: "destructive",
      });
    }
  };

  const handleForumAction = async (
    id: number,
    action: ForumAction,
    type: "post" | "reply"
  ) => {
    const supabase = createClient();
    try {
      const table = type === "post" ? "forum_posts" : "forum_replies";
      const idField = type === "post" ? "post_id" : "reply_id";

      if (action === "delete") {
        const { error } = await supabase.from(table).delete().eq(idField, id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .update({ is_flagged: false, is_approved: true })
          .eq(idField, id);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${type} ${action}d successfully.`,
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${type}.`,
        variant: "destructive",
      });
    }
  };

  const handleUserView = (userId: string) => {
    router.push(`/profile?user=${userId}`);
  };

  const handleBookingView = (bookingId: number) => {
    toast({
      title: "View Booking",
      description: "Booking details modal will be implemented.",
    });
  };

  return {
    // State
    currentUser,
    loading: authLoading || loading,
    fetchError,
    adminData,

    // Actions
    handleUserAction,
    handleProductAction,
    handleReviewAction,
    handleBookingAction,
    handleForumAction,
    handleUserView,
    handleBookingView,

    // Utils
    refreshData: fetchAdminData,
  };
}
