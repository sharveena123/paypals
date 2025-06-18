-- Create friends table for user friendships
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'accepted',
  created_at timestamptz DEFAULT now()
);

-- Optional: Add unique constraint to prevent duplicate friendships
CREATE UNIQUE INDEX IF NOT EXISTS unique_friendship ON friends (
  LEAST(user_id, friend_id),
  GREATEST(user_id, friend_id)
); 