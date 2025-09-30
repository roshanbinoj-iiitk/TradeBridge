export interface AdminStats {
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

export interface AdminData {
  stats: AdminStats;
  users: any[];
  products: any[];
  bookings: any[];
  reviews: any[];
  forumPosts: any[];
  forumReplies: any[];
}

export type UserAction = "ban" | "unban";
export type ProductAction = "edit" | "view" | "toggle";
export type ReviewAction = "feature" | "view" | "delete";
export type BookingAction = "approve" | "reject";
export type ForumAction = "approve" | "delete";
