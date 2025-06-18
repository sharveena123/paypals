
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  created_at: string;
  group: {
    id: string;
    name: string;
  } | null;
  paid_by_profile: {
    id: string;
    full_name: string | null;
  } | null;
}

interface UserStats {
  totalSpent: number;
  youOwe: number;
  youAreOwed: number;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSpent: 0,
    youOwe: 0,
    youAreOwed: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchUserStats();
    } else {
      setExpenses([]);
      setUserStats({ totalSpent: 0, youOwe: 0, youAreOwed: 0 });
      setLoading(false);
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          category,
          created_at,
          groups:group_id (
            id,
            name
          ),
          profiles:paid_by (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching expenses:', error);
      } else {
        const formattedExpenses = (data || []).map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          category: expense.category,
          created_at: expense.created_at,
          group: expense.groups ? {
            id: expense.groups.id,
            name: expense.groups.name
          } : null,
          paid_by_profile: expense.profiles ? {
            id: expense.profiles.id,
            full_name: expense.profiles.full_name
          } : null
        }));
        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Calculate total spent (expenses paid by user)
      const { data: totalPaidData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('paid_by', user.id);

      const totalSpent = totalPaidData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      // Calculate total owed by user
      const { data: totalOwedData } = await supabase
        .from('expense_splits')
        .select('amount')
        .eq('user_id', user.id);

      const totalOwed = totalOwedData?.reduce((sum, split) => sum + Number(split.amount), 0) || 0;

      // Calculate balance (what user is owed or owes)
      const balance = totalSpent - totalOwed;

      setUserStats({
        totalSpent,
        youOwe: balance < 0 ? Math.abs(balance) : 0,
        youAreOwed: balance > 0 ? balance : 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchUserStats()]);
    setLoading(false);
  };

  return { expenses, userStats, loading, refetch };
};
