-- Remove member_email column and keep only member_name
ALTER TABLE group_members
DROP COLUMN IF EXISTS member_email;

-- Update existing rows to use profile information for member_name
UPDATE group_members gm
SET member_name = p.full_name
FROM profiles p
WHERE gm.user_id = p.id AND gm.member_name IS NULL; 