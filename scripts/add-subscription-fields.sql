-- Migration: Add subscription fields to profiles table
-- This migration safely adds subscription tracking without breaking existing users

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Grandfather existing users to 'active' status
UPDATE profiles 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL OR subscription_status = 'inactive';

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add comment explaining the grandfathering
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status: active, inactive, canceled, past_due. Existing users grandfathered to active.';