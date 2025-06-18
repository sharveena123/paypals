-- Enable Row Level Security on friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

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