-- SQL Schema for Multiplayer Rooms in Spymals
-- Run this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS spymals_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby', -- 'lobby', 'briefing', 'playing', 'ended'
  players JSONB DEFAULT '[]'::jsonb, -- array of { id, username, avatar_emoji, is_host, is_ready, role, is_alive, word, description, vote }
  settings JSONB DEFAULT '{"pack": "animals", "spies": 1, "whites": 1}'::jsonb,
  game_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE spymals_rooms ENABLE ROW LEVEL SECURITY;

-- Allow public access for select, insert, update
DROP POLICY IF EXISTS "Allow public read access" ON spymals_rooms;
CREATE POLICY "Allow public read access" ON spymals_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON spymals_rooms;
CREATE POLICY "Allow public insert access" ON spymals_rooms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON spymals_rooms;
CREATE POLICY "Allow public update access" ON spymals_rooms FOR UPDATE USING (true);

-- Enable Realtime for the rooms table
alter publication supabase_realtime add table spymals_rooms;
