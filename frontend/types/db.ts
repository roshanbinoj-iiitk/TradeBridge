// types/db.ts

export interface User {
  id: number;
  uuid: string; // UUID that links to auth.users
  name: string;
  contact?: string;
  email: string;
  role: "lender" | "borrower" | "admin";
}

export interface UserProfile {
  profile_id: number;
  user_id: string; // UUID
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  location?: string;
  website_url?: string;
  follower_count: number;
  following_count: number;
  total_rentals_as_lender: number;
  total_rentals_as_borrower: number;
  is_public: boolean;
  show_rental_history: boolean;
  show_reviews: boolean;
  show_contact_info: boolean;
  is_verified: boolean;
  verification_type: "none" | "email" | "phone" | "id" | "business";
  last_active: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface UserTrustScore {
  user_id: string; // UUID
  overall_trust_score: number;
  verification_score: number;
  transaction_score: number;
  communication_score: number;
  reliability_score: number;
  total_transactions: number;
  successful_transactions: number;
  response_time_hours: number;
  last_updated: string;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  lender_id: string; // UUID
  start_date?: string;
  end_date?: string;
  category?: string;
  value?: number;
  condition?: string;
  availability: boolean;
  available_status: boolean;
  image_url?: string;
  price_per_day?: number;
  created_at: string;
  images?: ProductImage[];
  lender?: User;
}

export interface Booking {
  booking_id: number;
  product_id: number;
  borrower_id: string; // UUID
  lender_id: string; // UUID
  start_date: string;
  end_date: string;
  total_amount: number;
  security_deposit: number;
  status:
    | "pending"
    | "confirmed"
    | "paid"
    | "active"
    | "completed"
    | "cancelled"
    | "disputed";
  payment_intent_id?: string;
  payment_status: "pending" | "paid" | "refunded" | "failed";
  pickup_method: "meetup" | "delivery" | "pickup";
  pickup_location?: string;
  pickup_instructions?: string;
  return_instructions?: string;
  created_at: string;
  updated_at: string;
  // QR collection fields
  collection_token_hash?: string;
  collection_token_expires_at?: string;
  collected_at?: string;
  collected_by?: string; // UUID
  collection_method?: "qr" | "manual" | "auto";
  product?: Product;
  borrower?: User;
  lender?: User;
}

export interface Transaction {
  transaction_id: number;
  product_id: number;
  borrower_id: string; // UUID
  lender_id: string; // UUID
  start_date?: string;
  end_date?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  product?: Product;
  borrower?: User;
  lender?: User;
}

export interface Review {
  review_id: number;
  transaction_id: number;
  reviewer_id: string; // UUID
  reviewee_id: string; // UUID
  product_id: number;
  overall_rating: number;
  product_condition_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  review_title?: string;
  review_text?: string;
  review_photos?: string[];
  review_type: "lender_to_borrower" | "borrower_to_lender";
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  transaction?: Transaction;
  reviewer?: User;
  reviewee?: User;
  product?: Product;
}

export interface UserFollow {
  follow_id: number;
  follower_id: string; // UUID
  following_id: string; // UUID
  created_at: string;
  follower?: User;
  following?: User;
}

export interface ForumCategory {
  category_id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  moderator_ids?: string[]; // Array of UUIDs
  created_at: string;
}

export interface ForumPost {
  post_id: number;
  category_id: number;
  author_id: string; // UUID
  title: string;
  content: string;
  post_type: "discussion" | "question" | "announcement" | "review";
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  tags?: string[];
  attachments?: string[];
  is_approved: boolean;
  is_flagged: boolean;
  flag_count: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
  category?: ForumCategory;
  author?: User;
}

export interface ForumReply {
  reply_id: number;
  post_id: number;
  parent_reply_id?: number;
  author_id: string; // UUID
  content: string;
  like_count: number;
  is_best_answer: boolean;
  is_approved: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  post?: ForumPost;
  parent_reply?: ForumReply;
  author?: User;
}

export interface BadgeDefinition {
  badge_id: number;
  badge_name: string;
  badge_description: string;
  badge_icon?: string;
  badge_color?: string;
  criteria: any; // JSON object
  points_value: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  user_badge_id: number;
  user_id: string; // UUID
  badge_id: number;
  earned_date: string;
  progress?: any; // JSON object
  badge?: BadgeDefinition;
}

export interface Notification {
  notification_id: number;
  user_id: string; // UUID
  notification_type:
    | "booking_request"
    | "booking_confirmed"
    | "booking_cancelled"
    | "payment_received"
    | "payment_due"
    | "message_received"
    | "review_received"
    | "product_returned"
    | "system_update"
    | "new_follower"
    | "forum_reply"
    | "post_liked"
    | "achievement_earned";
  title: string;
  message: string;
  related_user_id?: string; // UUID
  related_product_id?: number;
  related_post_id?: number;
  data?: any; // JSON object
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface SocialShare {
  share_id: number;
  user_id?: string; // UUID
  product_id?: number;
  forum_post_id?: number;
  platform:
    | "facebook"
    | "twitter"
    | "linkedin"
    | "whatsapp"
    | "email"
    | "copy_link";
  share_url: string;
  referrer_url?: string;
  ip_address?: string;
  user_agent?: string;
  shared_at: string;
}
