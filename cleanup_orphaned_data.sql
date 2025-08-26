-- Data cleanup script to fix foreign key constraint violations
-- Run this BEFORE applying the cascade constraints

-- Step 1: Find and clean up orphaned records

-- Check for orphaned transactions (borrowers that don't exist in users table)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Count orphaned transactions by borrower_id
    SELECT COUNT(*) INTO orphan_count
    FROM public.transactions t
    LEFT JOIN public.users u ON t.borrower_id = u.uuid
    WHERE u.uuid IS NULL;
    
    RAISE NOTICE 'Found % orphaned transactions by borrower_id', orphan_count;
    
    -- Delete orphaned transactions by borrower_id
    DELETE FROM public.transactions t
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = t.borrower_id
    );
    
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned transactions by borrower_id', orphan_count;
END $$;

-- Check for orphaned transactions (lenders that don't exist in users table)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Count orphaned transactions by lender_id
    SELECT COUNT(*) INTO orphan_count
    FROM public.transactions t
    LEFT JOIN public.users u ON t.lender_id = u.uuid
    WHERE u.uuid IS NULL;
    
    RAISE NOTICE 'Found % orphaned transactions by lender_id', orphan_count;
    
    -- Delete orphaned transactions by lender_id
    DELETE FROM public.transactions t
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = t.lender_id
    );
    
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned transactions by lender_id', orphan_count;
END $$;

-- Check for orphaned products
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Count orphaned products
    SELECT COUNT(*) INTO orphan_count
    FROM public.products p
    LEFT JOIN public.users u ON p.lender_id = u.uuid
    WHERE u.uuid IS NULL;
    
    RAISE NOTICE 'Found % orphaned products', orphan_count;
    
    -- Delete orphaned products (this will also delete related product_images due to existing FK)
    DELETE FROM public.products p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = p.lender_id
    );
    
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned products', orphan_count;
END $$;

-- Check for orphaned ratings
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Count orphaned ratings by rater_id
    SELECT COUNT(*) INTO orphan_count
    FROM public.ratings r
    LEFT JOIN public.users u ON r.rater_id = u.uuid
    WHERE u.uuid IS NULL;
    
    RAISE NOTICE 'Found % orphaned ratings by rater_id', orphan_count;
    
    -- Delete orphaned ratings by rater_id
    DELETE FROM public.ratings r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.rater_id
    );
    
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned ratings by rater_id', orphan_count;
    
    -- Count orphaned ratings by ratee_id
    SELECT COUNT(*) INTO orphan_count
    FROM public.ratings r
    LEFT JOIN public.users u ON r.ratee_id = u.uuid
    WHERE u.uuid IS NULL;
    
    RAISE NOTICE 'Found % orphaned ratings by ratee_id', orphan_count;
    
    -- Delete orphaned ratings by ratee_id
    DELETE FROM public.ratings r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users u WHERE u.uuid = r.ratee_id
    );
    
    GET DIAGNOSTICS orphan_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned ratings by ratee_id', orphan_count;
END $$;

-- Clean up orphaned records from enhanced features tables (if they exist)
DO $$
BEGIN
    -- Clean bookings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') THEN
        -- Delete bookings with non-existent borrowers
        DELETE FROM public.bookings b
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = b.borrower_id
        );
        
        -- Delete bookings with non-existent lenders
        DELETE FROM public.bookings b
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = b.lender_id
        );
        
        RAISE NOTICE 'Cleaned up orphaned bookings';
    END IF;
    
    -- Clean reviews
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        -- Delete reviews with non-existent reviewers
        DELETE FROM public.reviews r
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = r.reviewer_id
        );
        
        -- Delete reviews with non-existent reviewees
        DELETE FROM public.reviews r
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = r.reviewee_id
        );
        
        RAISE NOTICE 'Cleaned up orphaned reviews';
    END IF;
    
    -- Clean wishlists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlists' AND table_schema = 'public') THEN
        DELETE FROM public.wishlists w
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = w.user_id
        );
        RAISE NOTICE 'Cleaned up orphaned wishlists';
    END IF;
    
    -- Clean user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        DELETE FROM public.user_profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = p.user_id
        );
        RAISE NOTICE 'Cleaned up orphaned user profiles';
    END IF;
    
    -- Clean user_follows
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows' AND table_schema = 'public') THEN
        DELETE FROM public.user_follows f
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = f.follower_id
        ) OR NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = f.following_id
        );
        RAISE NOTICE 'Cleaned up orphaned user follows';
    END IF;
    
    -- Clean notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        DELETE FROM public.notifications n
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users u WHERE u.uuid = n.user_id
        );
        RAISE NOTICE 'Cleaned up orphaned notifications';
    END IF;
    
END $$;

-- Step 2: Create a view to check for any remaining orphaned records
CREATE OR REPLACE VIEW public.orphaned_records_check AS
WITH orphaned_transactions AS (
    SELECT 'transactions' as table_name, 'borrower_id' as column_name, COUNT(*) as orphan_count
    FROM public.transactions t
    LEFT JOIN public.users u ON t.borrower_id = u.uuid
    WHERE u.uuid IS NULL
    UNION ALL
    SELECT 'transactions' as table_name, 'lender_id' as column_name, COUNT(*) as orphan_count
    FROM public.transactions t
    LEFT JOIN public.users u ON t.lender_id = u.uuid
    WHERE u.uuid IS NULL
),
orphaned_products AS (
    SELECT 'products' as table_name, 'lender_id' as column_name, COUNT(*) as orphan_count
    FROM public.products p
    LEFT JOIN public.users u ON p.lender_id = u.uuid
    WHERE u.uuid IS NULL
),
orphaned_ratings AS (
    SELECT 'ratings' as table_name, 'rater_id' as column_name, COUNT(*) as orphan_count
    FROM public.ratings r
    LEFT JOIN public.users u ON r.rater_id = u.uuid
    WHERE u.uuid IS NULL
    UNION ALL
    SELECT 'ratings' as table_name, 'ratee_id' as column_name, COUNT(*) as orphan_count
    FROM public.ratings r
    LEFT JOIN public.users u ON r.ratee_id = u.uuid
    WHERE u.uuid IS NULL
)
SELECT * FROM orphaned_transactions
UNION ALL SELECT * FROM orphaned_products
UNION ALL SELECT * FROM orphaned_ratings
ORDER BY table_name, column_name;

-- Step 3: Show summary of cleanup
SELECT 
    'Data cleanup completed. Check orphaned_records_check view for any remaining issues.' as status;

-- Query to check the results
-- SELECT * FROM public.orphaned_records_check WHERE orphan_count > 0;
