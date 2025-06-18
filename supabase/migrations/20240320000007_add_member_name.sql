-- Add member_name column to group_members table
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS member_name TEXT;

-- Update existing rows to use profile information for member_name
UPDATE group_members gm
SET member_name = p.full_name
FROM profiles p
WHERE gm.user_id = p.id AND gm.member_name IS NULL; 