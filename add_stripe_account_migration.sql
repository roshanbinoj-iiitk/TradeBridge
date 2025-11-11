-- Add stripe_account_id column to users table for Stripe Connect integration
-- This stores the Stripe Express/Standard account ID for each user who connects their Stripe account

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add index for faster lookups when querying by stripe_account_id
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id);

-- Add comment for documentation
COMMENT ON COLUMN users.stripe_account_id IS 'Stripe Connect account ID (acct_xxx) for receiving payments';
