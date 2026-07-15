-- SQL Update for spymals_profiles Table
-- Run this in your Supabase SQL Editor to add cosmetics columns.

ALTER TABLE spymals_profiles 
  ADD COLUMN IF NOT EXISTS unlocked_items JSONB DEFAULT '["default"]'::jsonb,
  ADD COLUMN IF NOT EXISTS equipped_color TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS equipped_banner TEXT DEFAULT 'default';
