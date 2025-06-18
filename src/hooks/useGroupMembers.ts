
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export const useGroupMembers = (groupId: string | null) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching group members:', error);
      } else {
        setMembers(data || []);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    } finally {
      setLoading(false);
    }
  };

  return { members, loading, refetch: fetchGroupMembers };
};
