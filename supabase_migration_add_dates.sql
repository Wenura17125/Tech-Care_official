-- Migration to add missing optional date columns to user_devices table
-- Run this in your Supabase SQL Editor

ALTER TABLE user_devices
ADD COLUMN IF NOT EXISTS purchase_date DATE NULL,
ADD COLUMN IF NOT EXISTS warranty_expiry DATE NULL;

-- If columns exist but are NOT NULL, alter them
ALTER TABLE user_devices
ALTER COLUMN purchase_date DROP NOT NULL;

ALTER TABLE user_devices
ALTER COLUMN warranty_expiry DROP NOT NULL;
