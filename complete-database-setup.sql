-- Complete Database Setup for MacroLens Mobile App
-- Run this entire script in your Supabase SQL Editor

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO USER_SETTINGS
-- ============================================================================

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS carbs_target INTEGER DEFAULT 200;

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS fat_target INTEGER DEFAULT 60;

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS goal_mode TEXT DEFAULT 'maintain' 
CHECK (goal_mode IN ('cut', 'maintain', 'gain'));

-- ============================================================================
-- 2. ENSURE MEALS TABLE HAS ALL REQUIRED COLUMNS
-- ============================================================================

-- Add ai_model column if it doesn't exist
ALTER TABLE meals
ADD COLUMN IF NOT EXISTS ai_model TEXT;

-- Add meal_description column if it doesn't exist  
ALTER TABLE meals
ADD COLUMN IF NOT EXISTS meal_description TEXT;

-- ============================================================================
-- 3. FIX RLS POLICIES FOR MEALS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. FIX RLS POLICIES FOR USER_SETTINGS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Create RLS policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. FIX RLS POLICIES FOR WATER_LOGS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own water logs" ON water_logs;
DROP POLICY IF EXISTS "Users can insert own water logs" ON water_logs;

-- Create RLS policies
CREATE POLICY "Users can view own water logs"
  ON water_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON water_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. ENABLE RLS ON ALL TABLES (if not already enabled)
-- ============================================================================

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONE! 
-- ============================================================================

-- Verify the setup
SELECT 'Setup complete! Tables have RLS enabled and policies configured.' as status;
