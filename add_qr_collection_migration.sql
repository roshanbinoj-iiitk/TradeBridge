-- Migration: Add QR collection token fields to bookings table
-- This migration adds support for short-lived single-use QR tokens for booking collection

ALTER TABLE public.bookings
  ADD COLUMN collection_token_hash text,
  ADD COLUMN collection_token_expires_at timestamptz,
  ADD COLUMN collected_at timestamptz,
  ADD COLUMN collected_by uuid REFERENCES public.users(uuid),
  ADD COLUMN collection_method varchar(50);

-- Add index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_bookings_collection_expires
  ON public.bookings(collection_token_expires_at);

-- Add constraint to ensure collected_by is only set when collection_method is set
ALTER TABLE public.bookings
  ADD CONSTRAINT check_collection_consistency
  CHECK (
    (collected_at IS NULL AND collected_by IS NULL AND collection_method IS NULL) OR
    (collected_at IS NOT NULL AND collected_by IS NOT NULL AND collection_method IS NOT NULL)
  );

-- Add constraint for collection_method values
ALTER TABLE public.bookings
  ADD CONSTRAINT check_collection_method
  CHECK (collection_method IS NULL OR collection_method IN ('qr', 'manual', 'auto'));
