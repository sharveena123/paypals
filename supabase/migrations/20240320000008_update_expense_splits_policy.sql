-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own expense splits" ON expense_splits;

-- Create new policy that allows:
-- 1. Users to manage their own splits
-- 2. Group admins to manage splits for their groups
-- 3. Allow inserting splits for non-registered members (where user_id is null)
CREATE POLICY "Users can manage expense splits"
ON expense_splits
FOR ALL
USING (
  -- Allow access if user is the split owner
  auth.uid() = user_id
  OR
  -- Allow access if user is a group admin
  EXISTS (
    SELECT 1 FROM expenses e
    JOIN groups g ON e.group_id = g.id
    WHERE e.id = expense_splits.expense_id
    AND g.created_by = auth.uid()
  )
  OR
  -- Allow access for non-registered members (user_id is null)
  user_id IS NULL
)
WITH CHECK (
  -- Allow insert/update if user is the split owner
  auth.uid() = user_id
  OR
  -- Allow insert/update if user is a group admin
  EXISTS (
    SELECT 1 FROM expenses e
    JOIN groups g ON e.group_id = g.id
    WHERE e.id = expense_splits.expense_id
    AND g.created_by = auth.uid()
  )
  OR
  -- Allow insert/update for non-registered members (user_id is null)
  user_id IS NULL
); 