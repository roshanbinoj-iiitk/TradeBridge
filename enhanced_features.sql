-- Enhanced Review and Rating System

-- Reviews table (enhanced)
CREATE TABLE public.reviews (
  review_id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES public.transactions(transaction_id),
  reviewer_id UUID NOT NULL REFERENCES public.users(uuid),
  reviewee_id UUID NOT NULL REFERENCES public.users(uuid),
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  
  -- Ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  product_condition_rating INTEGER CHECK (product_condition_rating >= 1 AND product_condition_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Review content
  review_title VARCHAR(200),
  review_text TEXT,
  review_photos TEXT[], -- Array of image URLs
  
  -- Review type
  review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('lender_to_borrower', 'borrower_to_lender')),
  
  -- Metadata
  is_verified BOOLEAN DEFAULT FALSE, -- Only from actual completed rentals
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate reviews for same transaction
  UNIQUE(transaction_id, reviewer_id, reviewee_id)
);

-- Review responses (lenders can respond to reviews)
CREATE TABLE public.review_responses (
  response_id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES public.reviews(review_id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.users(uuid),
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Review helpfulness tracking
CREATE TABLE public.review_helpfulness (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES public.reviews(review_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- User trust scores (calculated from reviews)
CREATE TABLE public.user_trust_scores (
  user_id UUID PRIMARY KEY REFERENCES public.users(uuid),
  
  -- As a lender
  lender_rating DECIMAL(3,2) DEFAULT 0.00,
  lender_review_count INTEGER DEFAULT 0,
  
  -- As a borrower  
  borrower_rating DECIMAL(3,2) DEFAULT 0.00,
  borrower_review_count INTEGER DEFAULT 0,
  
  -- Overall metrics
  total_completed_rentals INTEGER DEFAULT 0,
  trust_level VARCHAR(20) DEFAULT 'new' CHECK (trust_level IN ('new', 'bronze', 'silver', 'gold', 'platinum')),
  verification_level VARCHAR(20) DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'email', 'phone', 'identity', 'full')),
  
  -- Badges
  badges TEXT[], -- Array of earned badges
  
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Booking and Availability System
CREATE TABLE public.bookings (
  booking_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  borrower_id UUID NOT NULL REFERENCES public.users(uuid),
  lender_id UUID NOT NULL REFERENCES public.users(uuid),
  
  -- Booking details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'active', 'completed', 'cancelled', 'disputed')),
  
  -- Payment information
  payment_intent_id VARCHAR(255), -- Stripe payment intent ID
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  
  -- Pickup/Return details
  pickup_method VARCHAR(20) DEFAULT 'meetup' CHECK (pickup_method IN ('meetup', 'delivery', 'pickup')),
  pickup_location TEXT,
  pickup_instructions TEXT,
  return_instructions TEXT,
  
  -- Condition tracking
  pre_rental_condition_photos TEXT[],
  post_rental_condition_photos TEXT[],
  damage_reported BOOLEAN DEFAULT FALSE,
  damage_description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product availability calendar
CREATE TABLE public.product_availability (
  availability_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  reason VARCHAR(100), -- 'booked', 'maintenance', 'blocked'
  booking_id INTEGER REFERENCES public.bookings(booking_id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, date)
);

-- Wishlist system
CREATE TABLE public.wishlists (
  wishlist_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  
  UNIQUE(user_id, product_id)
);

-- Price alerts
CREATE TABLE public.price_alerts (
  alert_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  target_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  triggered_at TIMESTAMP,
  
  UNIQUE(user_id, product_id)
);

-- Product views tracking
CREATE TABLE public.product_views (
  view_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(product_id),
  user_id UUID REFERENCES public.users(uuid), -- NULL for anonymous views
  viewed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Search history and suggestions
CREATE TABLE public.search_history (
  search_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(uuid),
  search_query TEXT NOT NULL,
  category VARCHAR(50),
  results_count INTEGER,
  clicked_product_id INTEGER REFERENCES public.products(product_id),
  searched_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON public.reviews(overall_rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

CREATE INDEX idx_bookings_product ON public.bookings(product_id);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

CREATE INDEX idx_availability_product_date ON public.product_availability(product_id, date);
CREATE INDEX idx_product_views_product ON public.product_views(product_id);
CREATE INDEX idx_product_views_time ON public.product_views(viewed_at DESC);

-- Functions for calculating ratings
CREATE OR REPLACE FUNCTION update_user_trust_score(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  lender_avg DECIMAL(3,2);
  lender_count INTEGER;
  borrower_avg DECIMAL(3,2);
  borrower_count INTEGER;
  total_rentals INTEGER;
  trust_level_val VARCHAR(20);
BEGIN
  -- Calculate lender ratings
  SELECT 
    COALESCE(AVG(overall_rating), 0),
    COUNT(*)
  INTO lender_avg, lender_count
  FROM public.reviews 
  WHERE reviewee_id = user_uuid AND review_type = 'borrower_to_lender';
  
  -- Calculate borrower ratings  
  SELECT 
    COALESCE(AVG(overall_rating), 0),
    COUNT(*)
  INTO borrower_avg, borrower_count
  FROM public.reviews 
  WHERE reviewee_id = user_uuid AND review_type = 'lender_to_borrower';
  
  -- Get total completed rentals
  SELECT COUNT(*)
  INTO total_rentals
  FROM public.bookings 
  WHERE (borrower_id = user_uuid OR lender_id = user_uuid) 
    AND status = 'completed';
  
  -- Determine trust level
  CASE 
    WHEN total_rentals >= 50 AND ((lender_avg + borrower_avg) / 2) >= 4.5 THEN trust_level_val := 'platinum';
    WHEN total_rentals >= 25 AND ((lender_avg + borrower_avg) / 2) >= 4.0 THEN trust_level_val := 'gold';
    WHEN total_rentals >= 10 AND ((lender_avg + borrower_avg) / 2) >= 3.5 THEN trust_level_val := 'silver';
    WHEN total_rentals >= 3 THEN trust_level_val := 'bronze';
    ELSE trust_level_val := 'new';
  END CASE;
  
  -- Update trust score
  INSERT INTO public.user_trust_scores (
    user_id, lender_rating, lender_review_count, 
    borrower_rating, borrower_review_count, 
    total_completed_rentals, trust_level, last_updated
  ) VALUES (
    user_uuid, lender_avg, lender_count,
    borrower_avg, borrower_count,
    total_rentals, trust_level_val, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    lender_rating = EXCLUDED.lender_rating,
    lender_review_count = EXCLUDED.lender_review_count,
    borrower_rating = EXCLUDED.borrower_rating,
    borrower_review_count = EXCLUDED.borrower_review_count,
    total_completed_rentals = EXCLUDED.total_completed_rentals,
    trust_level = EXCLUDED.trust_level,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trust scores when reviews are added
CREATE OR REPLACE FUNCTION trigger_update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_user_trust_score(NEW.reviewee_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_trust_score_update
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_trust_score();

-- Function to update product availability when booking is confirmed
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  current_date DATE;
BEGIN
  IF NEW.status = 'confirmed' OR NEW.status = 'paid' THEN
    -- Mark dates as unavailable
    current_date := NEW.start_date;
    WHILE current_date <= NEW.end_date LOOP
      INSERT INTO public.product_availability (product_id, date, is_available, reason, booking_id)
      VALUES (NEW.product_id, current_date, FALSE, 'booked', NEW.booking_id)
      ON CONFLICT (product_id, date) DO UPDATE SET
        is_available = FALSE,
        reason = 'booked',
        booking_id = NEW.booking_id;
      
      current_date := current_date + INTERVAL '1 day';
    END LOOP;
  ELSIF OLD.status IN ('confirmed', 'paid') AND NEW.status IN ('cancelled', 'completed') THEN
    -- Free up dates when booking is cancelled or completed
    DELETE FROM public.product_availability 
    WHERE product_id = NEW.product_id 
      AND date BETWEEN NEW.start_date AND NEW.end_date
      AND booking_id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_availability_update
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_on_booking();

-- Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their transactions" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = borrower_id OR auth.uid() = lender_id);
CREATE POLICY "Users can create bookings as borrower" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Users can update their bookings" ON public.bookings FOR UPDATE USING (auth.uid() = borrower_id OR auth.uid() = lender_id);

CREATE POLICY "Users can manage their wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their price alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- ===============================
-- SOCIAL FEATURES
-- ===============================

-- User profiles (enhanced)
CREATE TABLE public.user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  
  -- Basic profile info
  display_name VARCHAR(100),
  bio TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  location VARCHAR(100),
  website_url TEXT,
  
  -- Social stats
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_rentals_as_lender INTEGER DEFAULT 0,
  total_rentals_as_borrower INTEGER DEFAULT 0,
  
  -- Profile visibility
  is_public BOOLEAN DEFAULT TRUE,
  show_rental_history BOOLEAN DEFAULT TRUE,
  show_reviews BOOLEAN DEFAULT TRUE,
  show_contact_info BOOLEAN DEFAULT FALSE,
  
  -- Social verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_type VARCHAR(20) DEFAULT 'none' CHECK (verification_type IN ('none', 'email', 'phone', 'id', 'business')),
  
  -- Activity tracking
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Follow system
CREATE TABLE public.user_follows (
  follow_id SERIAL PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.users(uuid),
  following_id UUID NOT NULL REFERENCES public.users(uuid),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent self-following and duplicate follows
  CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Community forum categories
CREATE TABLE public.forum_categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  moderator_ids UUID[], -- Array of moderator user IDs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Forum posts
CREATE TABLE public.forum_posts (
  post_id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.forum_categories(category_id),
  author_id UUID NOT NULL REFERENCES public.users(uuid),
  
  -- Post content
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(20) DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'review')),
  
  -- Post metadata
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE, -- For question posts
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- Tags and attachments
  tags TEXT[], -- Array of tags
  attachments TEXT[], -- Array of file URLs
  
  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Forum replies
CREATE TABLE public.forum_replies (
  reply_id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.forum_posts(post_id) ON DELETE CASCADE,
  parent_reply_id INTEGER REFERENCES public.forum_replies(reply_id), -- For nested replies
  author_id UUID NOT NULL REFERENCES public.users(uuid),
  
  -- Reply content
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  
  -- Best answer (for questions)
  is_best_answer BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post and reply likes
CREATE TABLE public.forum_likes (
  like_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  post_id INTEGER REFERENCES public.forum_posts(post_id),
  reply_id INTEGER REFERENCES public.forum_replies(reply_id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one like per user per post/reply
  CHECK ((post_id IS NULL) != (reply_id IS NULL)),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Social sharing tracking
CREATE TABLE public.social_shares (
  share_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(uuid),
  product_id INTEGER REFERENCES public.products(product_id),
  forum_post_id INTEGER REFERENCES public.forum_posts(post_id),
  
  -- Share details
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy_link')),
  share_url TEXT NOT NULL,
  referrer_url TEXT,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  shared_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure something is being shared
  CHECK ((product_id IS NULL) != (forum_post_id IS NULL))
);

-- User activity feed
CREATE TABLE public.user_activities (
  activity_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'product_listed', 'product_rented', 'review_given', 'review_received',
    'forum_post_created', 'forum_reply_created', 'user_followed', 'achievement_earned'
  )),
  
  -- Activity details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Related entities
  related_product_id INTEGER REFERENCES public.products(product_id),
  related_user_id UUID REFERENCES public.users(uuid),
  related_post_id INTEGER REFERENCES public.forum_posts(post_id),
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- User badges and achievements
CREATE TABLE public.badge_definitions (
  badge_id SERIAL PRIMARY KEY,
  badge_name VARCHAR(100) NOT NULL UNIQUE,
  badge_description TEXT NOT NULL,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(20),
  
  -- Requirements
  criteria JSONB NOT NULL, -- JSON object defining requirements
  points_value INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User earned badges
CREATE TABLE public.user_badges (
  user_badge_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  badge_id INTEGER NOT NULL REFERENCES public.badge_definitions(badge_id),
  earned_date TIMESTAMP DEFAULT NOW(),
  progress JSONB, -- Track progress towards badge requirements
  
  UNIQUE(user_id, badge_id)
);

-- Notification system (enhanced)
CREATE TABLE public.notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(uuid),
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'booking_request', 'booking_confirmed', 'booking_cancelled', 
    'payment_received', 'payment_due', 'message_received', 
    'review_received', 'product_returned', 'system_update',
    'new_follower', 'forum_reply', 'post_liked', 'achievement_earned'
  )),
  
  -- Notification content
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_user_id UUID REFERENCES public.users(uuid),
  related_product_id INTEGER REFERENCES public.products(product_id),
  related_post_id INTEGER REFERENCES public.forum_posts(post_id),
  data JSONB, -- Additional notification data
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification settings
CREATE TABLE public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(uuid),
  
  -- Delivery methods
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Notification types
  booking_requests BOOLEAN DEFAULT TRUE,
  booking_confirmations BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  social_notifications BOOLEAN DEFAULT TRUE,
  forum_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for social features
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

CREATE INDEX idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX idx_forum_posts_created_at ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_activity ON public.forum_posts(last_activity DESC);

CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id);
CREATE INDEX idx_forum_replies_parent ON public.forum_replies(parent_reply_id);
CREATE INDEX idx_forum_replies_author ON public.forum_replies(author_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX idx_user_activities_user ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_public ON public.user_activities(is_public, created_at DESC);

-- Functions for social features

-- Update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.user_profiles 
    SET following_count = following_count + 1, updated_at = NOW()
    WHERE user_id = NEW.follower_id;
    
    -- Increment follower count for following
    UPDATE public.user_profiles 
    SET follower_count = follower_count + 1, updated_at = NOW()
    WHERE user_id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.user_profiles 
    SET following_count = GREATEST(following_count - 1, 0), updated_at = NOW()
    WHERE user_id = OLD.follower_id;
    
    -- Decrement follower count for following
    UPDATE public.user_profiles 
    SET follower_count = GREATEST(follower_count - 1, 0), updated_at = NOW()
    WHERE user_id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follower_count_update
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- Update forum post reply counts and activity
CREATE OR REPLACE FUNCTION update_forum_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts 
    SET reply_count = reply_count + 1, 
        last_activity = NOW(),
        updated_at = NOW()
    WHERE post_id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts 
    SET reply_count = GREATEST(reply_count - 1, 0),
        updated_at = NOW()
    WHERE post_id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_post_stats_update
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_stats();

-- Update like counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts 
      SET like_count = like_count + 1, updated_at = NOW()
      WHERE post_id = NEW.post_id;
    ELSIF NEW.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies 
      SET like_count = like_count + 1, updated_at = NOW()
      WHERE reply_id = NEW.reply_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts 
      SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW()
      WHERE post_id = OLD.post_id;
    ELSIF OLD.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies 
      SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW()
      WHERE reply_id = OLD.reply_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER like_count_update
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, icon, color, sort_order) VALUES
  ('General Discussion', 'General topics and conversations about renting', 'MessageCircle', 'blue', 1),
  ('Questions & Help', 'Ask questions and get help from the community', 'HelpCircle', 'green', 2),
  ('Product Recommendations', 'Share and discover great rental products', 'Star', 'yellow', 3),
  ('Rental Tips', 'Share tips and best practices for renting', 'Lightbulb', 'purple', 4),
  ('Marketplace', 'Buy, sell, and trade rental-related items', 'ShoppingBag', 'orange', 5),
  ('Local Communities', 'Connect with renters in your area', 'MapPin', 'red', 6);

-- Insert default badge definitions
INSERT INTO public.badge_definitions (badge_name, badge_description, badge_icon, badge_color, criteria, points_value, rarity) VALUES
  ('First Rental', 'Completed your first rental', 'Award', 'bronze', '{"rentals_completed": 1}', 10, 'common'),
  ('Trusted Lender', 'Maintained 4.5+ rating with 10+ rentals as lender', 'Shield', 'gold', '{"lender_rating": 4.5, "lender_rentals": 10}', 50, 'uncommon'),
  ('Reliable Borrower', 'Maintained 4.5+ rating with 10+ rentals as borrower', 'CheckCircle', 'gold', '{"borrower_rating": 4.5, "borrower_rentals": 10}', 50, 'uncommon'),
  ('Community Helper', 'Received 50+ likes on forum posts', 'Heart', 'pink', '{"forum_likes_received": 50}', 25, 'uncommon'),
  ('Early Adopter', 'Joined in the first month', 'Rocket', 'purple', '{"early_adopter": true}', 100, 'rare'),
  ('Super Host', 'Top 1% of lenders by rating and volume', 'Crown', 'gold', '{"super_host": true}', 200, 'epic');

-- Row Level Security for social features
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social features
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Follow relationships are public" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Forum categories are public" ON public.forum_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Forum posts are public" ON public.forum_posts FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Forum replies are public" ON public.forum_replies FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can manage their own likes" ON public.forum_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "System can create activities" ON public.user_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification settings" ON public.notification_settings FOR ALL USING (auth.uid() = user_id);
