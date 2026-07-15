-- SQL Schema for Spymals Word Database
-- Copy and run this in your Supabase SQL Editor to create the required table.

CREATE TABLE IF NOT EXISTS spymals_words (
  id BIGSERIAL PRIMARY KEY,
  civilian TEXT NOT NULL,
  undercover TEXT NOT NULL,
  pack_name TEXT NOT NULL, -- 'standard', 'pop-culture', 'abstract', 'animals', 'geek', 'travel', 'food', 'fun'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Disable Row Level Security for simple read/write access (so we can seed it from client)
ALTER TABLE spymals_words DISABLE ROW LEVEL SECURITY;
