-- SQL script to create the friends table and RLS policies
-- Run this in your Supabase SQL Editor

-- Create friends table for user friendships
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'accepted',
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate friendships
CREATE UNIQUE INDEX IF NOT EXISTS unique_friendship ON friends (
  LEAST(user_id, friend_id),
  GREATEST(user_id, friend_id)
);

-- Enable Row Level Security on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can add friends" ON friends;
DROP POLICY IF EXISTS "Users can view their friends" ON friends;
DROP POLICY IF EXISTS "Users can delete their friends" ON friends;

-- Allow users to add friends (insert rows where they are the user_id)
CREATE POLICY "Users can add friends" ON friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their friends (both as user_id and friend_id)
CREATE POLICY "Users can view their friends" ON friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Allow users to delete their friends
CREATE POLICY "Users can delete their friends" ON friends
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Add trigger for updated_at
CREATE TRIGGER update_friends_updated_at
    BEFORE UPDATE ON friends
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 