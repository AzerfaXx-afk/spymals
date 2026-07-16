-- SQL Schema for Spymals Database
-- Copy and run this in your Supabase SQL Editor to create the required tables.

-- 1. Words Table
CREATE TABLE IF NOT EXISTS spymals_words (
  id BIGSERIAL PRIMARY KEY,
  civilian TEXT NOT NULL,
  undercover TEXT NOT NULL,
  pack_name TEXT NOT NULL, -- 'standard', 'pop-culture', 'abstract', 'animals', 'geek', 'travel', 'food', 'fun'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE spymals_words DISABLE ROW LEVEL SECURITY;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS spymals_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT 'fox-detective',
  coins INTEGER DEFAULT 150,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  unlocked_items JSONB DEFAULT '["default", "theme-safari"]'::jsonb,
  equipped_color TEXT DEFAULT 'default',
  equipped_banner TEXT DEFAULT 'default',
  equipped_theme TEXT DEFAULT 'safari',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for profiles
ALTER TABLE spymals_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all profiles (so multiplayer users can see player names & avatars)
DROP POLICY IF EXISTS "Allow public read profiles" ON spymals_profiles;
CREATE POLICY "Allow public read profiles" ON spymals_profiles FOR SELECT USING (true);

-- Allow individual insert
DROP POLICY IF EXISTS "Allow individual insert" ON spymals_profiles;
CREATE POLICY "Allow individual insert" ON spymals_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow individual update
DROP POLICY IF EXISTS "Allow individual update" ON spymals_profiles;
CREATE POLICY "Allow individual update" ON spymals_profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Feedback Table
CREATE TABLE IF NOT EXISTS spymals_feedback (
  id BIGSERIAL PRIMARY KEY,
  username TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE spymals_feedback DISABLE ROW LEVEL SECURITY;
