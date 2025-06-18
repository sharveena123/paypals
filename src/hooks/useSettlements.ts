
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SettlementFormData {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export const useSettlements = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createSettlement = async (formData: SettlementFormData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    try {
      const { data: settlement, error } = await supabase
        .from('settlements')
        .insert({
          group_id: formData.groupId,
          from_user: formData.fromUserId,
          to_user: formData.toUserId,
          amount: formData.amount,
          status: 'completed', // Mark as completed for now
          settled_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { settlement, error: null };
    } catch (error) {
      console.error('Error creating settlement:', error);
      return { settlement: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { createSettlement, loading };
};
