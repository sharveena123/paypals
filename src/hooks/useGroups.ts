
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_balance?: number;
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setGroups([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      // Fetch groups where user is a member
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id)
        `)
        .eq('group_members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        // For each group, get member count and user balance
        const groupsWithDetails = await Promise.all(
          (groupsData || []).map(async (group) => {
            // Get member count
            const { count: memberCount } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            // Get user balance for this group
            const { data: balanceData } = await supabase
              .rpc('calculate_user_balance', {
                user_uuid: user.id,
                group_uuid: group.id
              });

            return {
              ...group,
              member_count: memberCount || 0,
              user_balance: balanceData || 0
            };
          })
        );

        setGroups(groupsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error deleting group:', error);
        return { error };
      } else {
        await fetchGroups();
        return { error: null };
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      return { error };
    }
  };

  return { groups, loading, deleteGroup, refetch: fetchGroups };
};
