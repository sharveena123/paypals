-- Drop all existing group and group_members policies
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can update members" ON group_members;
DROP POLICY IF EXISTS "Group creators can delete members" ON group_members;

-- Create simplified group policies
CREATE POLICY "Users can view groups they created"
    ON groups FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can view groups they are members of"
    ON groups FOR SELECT
    USING (
        id IN (
            SELECT group_id 
            FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own groups"
    ON groups FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own groups"
    ON groups FOR DELETE
    USING (created_by = auth.uid());

-- Create simplified group_members policies
CREATE POLICY "Users can view members of their groups"
    ON group_members FOR SELECT
    USING (
        group_id IN (
            SELECT id 
            FROM groups 
            WHERE created_by = auth.uid()
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Group creators can manage members"
    ON group_members FOR ALL
    USING (
        group_id IN (
            SELECT id 
            FROM groups 
            WHERE created_by = auth.uid()
        )
    ); 