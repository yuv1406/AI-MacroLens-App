-- Add core physical attribute columns to user_settings table
-- Run this in your Supabase SQL Editor if you haven't already

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS height_cm INTEGER DEFAULT 175;

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS weight_kg FLOAT DEFAULT 70;

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 25;

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male' 
CHECK (sex IN ('male', 'female'));

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate'
CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'super_active'));
