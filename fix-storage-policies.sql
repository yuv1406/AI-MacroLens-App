-- Fix Storage RLS Policies for meal-images bucket
-- Run this in your Supabase SQL Editor

-- First, make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload own meal images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view meal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own meal images" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own meal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all meal images
CREATE POLICY "Public can view meal images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meal-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE  
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own meal images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
