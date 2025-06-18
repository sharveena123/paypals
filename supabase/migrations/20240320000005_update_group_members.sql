-- Update group_members table to support free-form member names
ALTER TABLE group_members
ADD COLUMN member_name TEXT,
ADD COLUMN member_email TEXT;

-- Update existing rows to use profile information
UPDATE group_members gm
SET 
  member_name = p.full_name,
  member_email = p.email
FROM profiles p
WHERE gm.user_id = p.id;

-- Make user_id nullable since we'll support non-registered members
ALTER TABLE group_members
ALTER COLUMN user_id DROP NOT NULL; 