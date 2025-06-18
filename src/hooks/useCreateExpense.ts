
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseFormData {
  description: string;
  amount: number;
  paidBy: string;
  groupId: string;
  category?: string;
  splits: Record<string, number>;
  notes?: string;
  date: string;
}

export const useCreateExpense = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createExpense = async (formData: ExpenseFormData) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setLoading(true);
    try {
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          description: formData.description,
          amount: formData.amount,
          paid_by: formData.paidBy,
          group_id: formData.groupId,
          category: formData.category || 'general',
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense splits
      const splits = Object.entries(formData.splits).map(([userId, amount]) => ({
        expense_id: expense.id,
        user_id: userId,
        amount: amount,
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits);

      if (splitsError) throw splitsError;

      return { expense, error: null };
    } catch (error) {
      console.error('Error creating expense:', error);
      return { expense: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { createExpense, loading };
};
