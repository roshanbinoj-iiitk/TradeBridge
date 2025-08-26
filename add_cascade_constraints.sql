-- Migration to add CASCADE DELETE constraints
-- This should be run on your Supabase database

-- IMPORTANT: Run cleanup_orphaned_data.sql FIRST to fix data integrity issues
-- before running this migration!

-- Step 1: Temporarily disable foreign key constraints for cleanup
SET session_replication_role = replica;

-- Step 2: Clean up orphaned data first
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting data cleanup...';
    
    -- Delete orphaned transactions
    DELETE FROM public.transactions t
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = t.borrower_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = t.lender_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned transactions', orphan_count;
    
    -- Delete orphaned products  
    DELETE FROM public.products p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = p.lender_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned products', orphan_count;
    
    -- Delete orphaned ratings
    DELETE FROM public.ratings r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.rater_uuid
    ) OR NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.ratee_uuid
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned ratings', orphan_count;
    
    -- Delete orphaned bookings
    DELETE FROM public.bookings b
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = b.borrower_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = b.lender_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.products p WHERE p.product_id = b.product_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned bookings', orphan_count;
    
    -- Delete orphaned reviews
    DELETE FROM public.reviews r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.reviewer_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.reviewee_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.products p WHERE p.product_id = r.product_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned reviews', orphan_count;
    
    -- Delete orphaned wishlists
    DELETE FROM public.wishlists w
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = w.user_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.products p WHERE p.product_id = w.product_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned wishlists', orphan_count;
    
    -- Delete orphaned user_profiles
    DELETE FROM public.user_profiles up
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = up.user_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned user profiles', orphan_count;
    
    -- Delete orphaned user_follows
    DELETE FROM public.user_follows uf
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = uf.follower_id
    ) OR NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = uf.following_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned user follows', orphan_count;
    
    -- Delete orphaned notifications
    DELETE FROM public.notifications n
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = n.user_id
    );
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned notifications', orphan_count;
    
    RAISE NOTICE 'Data cleanup completed';
END $$;

-- Step 3: Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Step 4: Update existing foreign key constraints to include CASCADE DELETE

-- For products table
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_lender_id_fkey,
DROP CONSTRAINT IF EXISTS fk_lender,
ADD CONSTRAINT products_lender_id_fkey 
  FOREIGN KEY (lender_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

-- For product_images table  
ALTER TABLE public.product_images
DROP CONSTRAINT IF EXISTS product_images_product_id_fkey,
ADD CONSTRAINT product_images_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;

-- For transactions table
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_borrower_id_fkey,
ADD CONSTRAINT transactions_borrower_id_fkey
  FOREIGN KEY (borrower_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_lender_id_fkey,
ADD CONSTRAINT transactions_lender_id_fkey
  FOREIGN KEY (lender_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_product_id_fkey,
ADD CONSTRAINT transactions_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;

-- For ratings table
ALTER TABLE public.ratings
DROP CONSTRAINT IF EXISTS ratings_transaction_id_fkey,
ADD CONSTRAINT ratings_transaction_id_fkey
  FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id) ON DELETE CASCADE;

ALTER TABLE public.ratings
DROP CONSTRAINT IF EXISTS ratings_rater_uuid_fkey,
ADD CONSTRAINT ratings_rater_uuid_fkey
  FOREIGN KEY (rater_uuid) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.ratings
DROP CONSTRAINT IF EXISTS ratings_ratee_uuid_fkey,
ADD CONSTRAINT ratings_ratee_uuid_fkey
  FOREIGN KEY (ratee_uuid) REFERENCES public.users(uuid) ON DELETE CASCADE;

-- For bookings table (if it exists from enhanced_features.sql)
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_borrower_id_fkey,
ADD CONSTRAINT bookings_borrower_id_fkey
  FOREIGN KEY (borrower_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_lender_id_fkey,
ADD CONSTRAINT bookings_lender_id_fkey
  FOREIGN KEY (lender_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_product_id_fkey,
ADD CONSTRAINT bookings_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;

-- For reviews table (if it exists from enhanced_features.sql)
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey,
ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewee_id_fkey,
ADD CONSTRAINT reviews_reviewee_id_fkey
  FOREIGN KEY (reviewee_id) REFERENCES public.users(uuid) ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_transaction_id_fkey,
ADD CONSTRAINT reviews_transaction_id_fkey
  FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id) ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_product_id_fkey,
ADD CONSTRAINT reviews_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;

-- Update the cascade deletion function to be more robust
CREATE OR REPLACE FUNCTION public.handle_auth_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the user from the public.users table
  -- This will now cascade to all related tables due to foreign key constraints
  DELETE FROM public.users WHERE uuid = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_delete_cascade ON auth.users;
CREATE TRIGGER on_auth_user_delete_cascade
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_deletion();

-- Add CASCADE constraints for all additional tables from schema
DO $$
BEGIN
  -- Wishlists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlists' AND table_schema = 'public') THEN
    ALTER TABLE public.wishlists
    DROP CONSTRAINT IF EXISTS wishlists_user_id_fkey,
    ADD CONSTRAINT wishlists_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.wishlists
    DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey,
    ADD CONSTRAINT wishlists_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
  END IF;

  -- User profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey,
    ADD CONSTRAINT user_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
  END IF;

  -- User follows
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows' AND table_schema = 'public') THEN
    ALTER TABLE public.user_follows
    DROP CONSTRAINT IF EXISTS user_follows_follower_id_fkey,
    ADD CONSTRAINT user_follows_follower_id_fkey
      FOREIGN KEY (follower_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.user_follows
    DROP CONSTRAINT IF EXISTS user_follows_following_id_fkey,
    ADD CONSTRAINT user_follows_following_id_fkey
      FOREIGN KEY (following_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
  END IF;

  -- Notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
    ADD CONSTRAINT notifications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_related_user_id_fkey,
    ADD CONSTRAINT notifications_related_user_id_fkey
      FOREIGN KEY (related_user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_related_product_id_fkey,
    ADD CONSTRAINT notifications_related_product_id_fkey
      FOREIGN KEY (related_product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
      
    ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_related_post_id_fkey,
    ADD CONSTRAINT notifications_related_post_id_fkey
      FOREIGN KEY (related_post_id) REFERENCES public.forum_posts(post_id) ON DELETE CASCADE;
  END IF;

  -- User trust scores
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_trust_scores' AND table_schema = 'public') THEN
    ALTER TABLE public.user_trust_scores
    DROP CONSTRAINT IF EXISTS user_trust_scores_user_id_fkey,
    ADD CONSTRAINT user_trust_scores_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
  END IF;

  -- User badges
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges' AND table_schema = 'public') THEN
    ALTER TABLE public.user_badges
    DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey,
    ADD CONSTRAINT user_badges_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.user_badges
    DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey,
    ADD CONSTRAINT user_badges_badge_id_fkey
      FOREIGN KEY (badge_id) REFERENCES public.badge_definitions(badge_id) ON DELETE CASCADE;
  END IF;

  -- User activities
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities' AND table_schema = 'public') THEN
    ALTER TABLE public.user_activities
    DROP CONSTRAINT IF EXISTS user_activities_user_id_fkey,
    ADD CONSTRAINT user_activities_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.user_activities
    DROP CONSTRAINT IF EXISTS user_activities_related_user_id_fkey,
    ADD CONSTRAINT user_activities_related_user_id_fkey
      FOREIGN KEY (related_user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.user_activities
    DROP CONSTRAINT IF EXISTS user_activities_related_product_id_fkey,
    ADD CONSTRAINT user_activities_related_product_id_fkey
      FOREIGN KEY (related_product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
      
    ALTER TABLE public.user_activities
    DROP CONSTRAINT IF EXISTS user_activities_related_post_id_fkey,
    ADD CONSTRAINT user_activities_related_post_id_fkey
      FOREIGN KEY (related_post_id) REFERENCES public.forum_posts(post_id) ON DELETE CASCADE;
  END IF;

  -- Notification settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_settings' AND table_schema = 'public') THEN
    ALTER TABLE public.notification_settings
    DROP CONSTRAINT IF EXISTS notification_settings_user_id_fkey,
    ADD CONSTRAINT notification_settings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
  END IF;

  -- Product views
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_views' AND table_schema = 'public') THEN
    ALTER TABLE public.product_views
    DROP CONSTRAINT IF EXISTS product_views_user_id_fkey,
    ADD CONSTRAINT product_views_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.product_views
    DROP CONSTRAINT IF EXISTS product_views_product_id_fkey,
    ADD CONSTRAINT product_views_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
  END IF;

  -- Product availability
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_availability' AND table_schema = 'public') THEN
    ALTER TABLE public.product_availability
    DROP CONSTRAINT IF EXISTS product_availability_product_id_fkey,
    ADD CONSTRAINT product_availability_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
      
    ALTER TABLE public.product_availability
    DROP CONSTRAINT IF EXISTS product_availability_booking_id_fkey,
    ADD CONSTRAINT product_availability_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;
  END IF;

  -- Social shares
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_shares' AND table_schema = 'public') THEN
    ALTER TABLE public.social_shares
    DROP CONSTRAINT IF EXISTS social_shares_user_id_fkey,
    ADD CONSTRAINT social_shares_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.social_shares
    DROP CONSTRAINT IF EXISTS social_shares_product_id_fkey,
    ADD CONSTRAINT social_shares_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
      
    ALTER TABLE public.social_shares
    DROP CONSTRAINT IF EXISTS social_shares_forum_post_id_fkey,
    ADD CONSTRAINT social_shares_forum_post_id_fkey
      FOREIGN KEY (forum_post_id) REFERENCES public.forum_posts(post_id) ON DELETE CASCADE;
  END IF;

  -- Review helpfulness
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_helpfulness' AND table_schema = 'public') THEN
    ALTER TABLE public.review_helpfulness
    DROP CONSTRAINT IF EXISTS review_helpfulness_user_id_fkey,
    ADD CONSTRAINT review_helpfulness_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.review_helpfulness
    DROP CONSTRAINT IF EXISTS review_helpfulness_review_id_fkey,
    ADD CONSTRAINT review_helpfulness_review_id_fkey
      FOREIGN KEY (review_id) REFERENCES public.reviews(review_id) ON DELETE CASCADE;
  END IF;

  -- Review responses
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_responses' AND table_schema = 'public') THEN
    ALTER TABLE public.review_responses
    DROP CONSTRAINT IF EXISTS review_responses_responder_id_fkey,
    ADD CONSTRAINT review_responses_responder_id_fkey
      FOREIGN KEY (responder_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.review_responses
    DROP CONSTRAINT IF EXISTS review_responses_review_id_fkey,
    ADD CONSTRAINT review_responses_review_id_fkey
      FOREIGN KEY (review_id) REFERENCES public.reviews(review_id) ON DELETE CASCADE;
  END IF;

  -- Forum tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts' AND table_schema = 'public') THEN
    ALTER TABLE public.forum_posts
    DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey,
    ADD CONSTRAINT forum_posts_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.forum_posts
    DROP CONSTRAINT IF EXISTS forum_posts_category_id_fkey,
    ADD CONSTRAINT forum_posts_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.forum_categories(category_id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_replies' AND table_schema = 'public') THEN
    ALTER TABLE public.forum_replies
    DROP CONSTRAINT IF EXISTS forum_replies_author_id_fkey,
    ADD CONSTRAINT forum_replies_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.forum_replies
    DROP CONSTRAINT IF EXISTS forum_replies_post_id_fkey,
    ADD CONSTRAINT forum_replies_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.forum_posts(post_id) ON DELETE CASCADE;
      
    ALTER TABLE public.forum_replies
    DROP CONSTRAINT IF EXISTS forum_replies_parent_reply_id_fkey,
    ADD CONSTRAINT forum_replies_parent_reply_id_fkey
      FOREIGN KEY (parent_reply_id) REFERENCES public.forum_replies(reply_id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_likes' AND table_schema = 'public') THEN
    ALTER TABLE public.forum_likes
    DROP CONSTRAINT IF EXISTS forum_likes_user_id_fkey,
    ADD CONSTRAINT forum_likes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.forum_likes
    DROP CONSTRAINT IF EXISTS forum_likes_post_id_fkey,
    ADD CONSTRAINT forum_likes_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.forum_posts(post_id) ON DELETE CASCADE;
      
    ALTER TABLE public.forum_likes
    DROP CONSTRAINT IF EXISTS forum_likes_reply_id_fkey,
    ADD CONSTRAINT forum_likes_reply_id_fkey
      FOREIGN KEY (reply_id) REFERENCES public.forum_replies(reply_id) ON DELETE CASCADE;
  END IF;

  -- Conversations and messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
    ALTER TABLE public.conversations
    DROP CONSTRAINT IF EXISTS conversations_participant1_id_fkey,
    ADD CONSTRAINT conversations_participant1_id_fkey
      FOREIGN KEY (participant1_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.conversations
    DROP CONSTRAINT IF EXISTS conversations_participant2_id_fkey,
    ADD CONSTRAINT conversations_participant2_id_fkey
      FOREIGN KEY (participant2_id) REFERENCES public.users(uuid) ON DELETE CASCADE;
      
    ALTER TABLE public.conversations
    DROP CONSTRAINT IF EXISTS conversations_product_id_fkey,
    ADD CONSTRAINT conversations_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
  END IF;

END $$;

-- Create a view to check all foreign key constraints
CREATE OR REPLACE VIEW public.foreign_key_constraints AS
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
