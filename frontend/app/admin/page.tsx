"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthContext";
import {
  User,
  Product,
  Booking,
  Review,
  ForumPost,
  ForumReply,
} from "@/types/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Package,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  flaggedPosts: number;
  totalReviews: number;
  activeUsers: number;
  totalForumPosts: number;
}

export default function AdminPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    flaggedPosts: 0,
    totalReviews: 0,
    activeUsers: 0,
    totalForumPosts: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [forumReplies, setForumReplies] = useState<ForumReply[]>([]);

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

      setStats({
        totalUsers: userCount || 0,
        totalProducts: productCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue,
        pendingBookings: pendingCount || 0,
        flaggedPosts: flaggedCount || 0,
        totalReviews: reviewCount || 0,
        activeUsers: activeUserCount || 0,
        totalForumPosts: forumPostCount || 0,
      });

      // Fetch recent data
      const [
        { data: recentUsers },
        { data: recentProducts },
        { data: recentBookings },
        { data: recentReviews },
        { data: recentPosts },
        { data: recentReplies },
      ] = await Promise.all([
        supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
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

      setUsers(recentUsers || []);
      setProducts(recentProducts || []);
      setBookings(recentBookings || []);
      setReviews(recentReviews || []);
      setForumPosts(recentPosts || []);
      setForumReplies(recentReplies || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: "ban" | "unban") => {
    const supabase = createClient();
    try {
      const newRole = action === "ban" ? "banned" : "borrower"; // Assuming banned is a valid role or we can use this
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
    action: "edit" | "view" | "toggle"
  ) => {
    const supabase = createClient();
    try {
      if (action === "view") {
        router.push(`/products/${productId}`);
      } else if (action === "edit") {
        // For edit, we might need to navigate to an edit page or open a modal
        toast({
          title: "Feature Coming Soon",
          description: "Product editing will be implemented.",
        });
      } else if (action === "toggle") {
        // Toggle product availability
        const product = products.find((p) => p.product_id === productId);
        if (product) {
          const { error } = await supabase
            .from("products")
            .update({ availability: !product.availability })
            .eq("product_id", productId);

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

  const handleReviewAction = async (
    reviewId: number,
    action: "feature" | "view" | "delete"
  ) => {
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
        // View review details - could open modal or navigate
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

  const handleUserView = async (userId: string) => {
    // Navigate to user profile or open user details modal
    router.push(`/profile?user=${userId}`);
  };

  const handleBookingView = async (bookingId: number) => {
    // Open booking details modal or navigate to booking page
    toast({
      title: "View Booking",
      description: "Booking details modal will be implemented.",
    });
  };

  const handleBookingAction = async (
    bookingId: number,
    action: "approve" | "reject"
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

  const handleReplyAction = async (
    replyId: number,
    action: "approve" | "delete"
  ) => {
    const supabase = createClient();
    try {
      if (action === "delete") {
        const { error } = await supabase
          .from("forum_replies")
          .delete()
          .eq("reply_id", replyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forum_replies")
          .update({ is_flagged: false, is_approved: true })
          .eq("reply_id", replyId);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Reply ${action}d successfully.`,
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reply.",
        variant: "destructive",
      });
    }
  };

  const handlePostAction = async (
    postId: number,
    action: "approve" | "delete"
  ) => {
    const supabase = createClient();
    try {
      if (action === "delete") {
        const { error } = await supabase
          .from("forum_posts")
          .delete()
          .eq("post_id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forum_posts")
          .update({ is_flagged: false, is_approved: true })
          .eq("post_id", postId);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Post ${action}d successfully.`,
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jet mx-auto mb-4"></div>
          <p className="text-taupe">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet mb-2">
          Admin Dashboard
        </h1>
        <p className="text-taupe">
          Manage users, products, bookings, and platform content.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">{stats.totalUsers}</p>
              <p className="text-sm text-taupe">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {stats.totalProducts}
              </p>
              <p className="text-sm text-taupe">Total Products</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {stats.totalBookings}
              </p>
              <p className="text-sm text-taupe">Total Bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                ₹{stats.totalRevenue}
              </p>
              <p className="text-sm text-taupe">Total Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {stats.pendingBookings}
              </p>
              <p className="text-sm text-taupe">Pending Bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <MessageSquare className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {stats.flaggedPosts}
              </p>
              <p className="text-sm text-taupe">Flagged Posts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">
                {stats.totalReviews}
              </p>
              <p className="text-sm text-taupe">Total Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-teal-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-jet">{stats.activeUsers}</p>
              <p className="text-sm text-taupe">Verified Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-taupe">{user.email}</p>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserView(user.uuid)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUserAction(
                              user.uuid,
                              user.role === "banned" ? "unban" : "ban"
                            )
                          }
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {user.role === "banned" ? "Unban" : "Ban"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-taupe">
                        Lender: {product.lender?.name || "Unknown"} | ₹
                        {product.price_per_day}/day
                      </p>
                      <Badge
                        variant={product.availability ? "default" : "secondary"}
                      >
                        {product.availability ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleProductAction(product.product_id, "view")
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleProductAction(product.product_id, "edit")
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleProductAction(product.product_id, "toggle")
                        }
                      >
                        {product.availability ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {booking.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-taupe">
                        Borrower: {booking.borrower?.name || "Unknown"} |
                        Lender: {booking.lender?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-taupe">
                        {new Date(booking.start_date).toLocaleDateString()} -{" "}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                      <Badge
                        variant={
                          booking.status === "pending"
                            ? "secondary"
                            : booking.status === "confirmed"
                            ? "default"
                            : booking.status === "completed"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleBookingAction(booking.booking_id, "approve")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleBookingAction(booking.booking_id, "reject")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingView(booking.booking_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.review_id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">
                          {review.product?.name || "Product"}
                        </p>
                        <p className="text-sm text-taupe">
                          By {review.reviewer?.name || "Unknown"} for{" "}
                          {review.reviewee?.name || "Unknown"}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < review.overall_rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <Badge
                        variant={review.is_featured ? "default" : "secondary"}
                      >
                        {review.is_featured ? "Featured" : "Regular"}
                      </Badge>
                    </div>
                    <p className="text-sm">{review.review_text}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleReviewAction(review.review_id, "view")
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleReviewAction(review.review_id, "feature")
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Feature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleReviewAction(review.review_id, "delete")
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle>Forum Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forumPosts.map((post) => (
                  <div key={post.post_id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-taupe">
                          By {post.author?.name || "Unknown"}
                        </p>
                        <Badge variant="destructive">Flagged Post</Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-2">
                      {post.content.substring(0, 200)}...
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handlePostAction(post.post_id, "approve")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePostAction(post.post_id, "delete")}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Flagged Replies */}
                {forumReplies.length > 0 && (
                  <>
                    <h4 className="font-semibold text-lg mt-6 mb-4">
                      Flagged Replies
                    </h4>
                    {forumReplies.map((reply) => (
                      <div
                        key={reply.reply_id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">
                              Reply to: {reply.post?.title || "Post"}
                            </p>
                            <p className="text-sm text-taupe">
                              By {reply.author?.name || "Unknown"}
                            </p>
                            <Badge variant="destructive">Flagged Reply</Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-2">
                          {reply.content.substring(0, 200)}...
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReplyAction(reply.reply_id, "approve")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReplyAction(reply.reply_id, "delete")
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
