-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create updated policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow users to create their initial profile
CREATE POLICY "Users can create their initial profile"
    ON profiles FOR INSERT
    WITH CHECK (
        auth.uid() = id AND
        NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
        )
    ); 