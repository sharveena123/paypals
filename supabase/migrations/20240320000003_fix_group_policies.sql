-- Drop existing group and group_members policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- Create updated group policies
CREATE POLICY "Users can view their own groups"
    ON groups FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can view groups they are members of"
    ON groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Create updated group_members policies
CREATE POLICY "Users can view members of their groups"
    ON group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_members.group_id
            AND (g.created_by = auth.uid() OR group_members.user_id = auth.uid())
        )
    );

CREATE POLICY "Group creators can add members"
    ON group_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_members.group_id
            AND g.created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators can update members"
    ON group_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_members.group_id
            AND g.created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators can delete members"
    ON group_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_members.group_id
            AND g.created_by = auth.uid()
        )
    ); 