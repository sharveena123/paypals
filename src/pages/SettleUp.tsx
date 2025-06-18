import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign, ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";

type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
  groups: Database["public"]["Tables"]["groups"]["Row"];
};
type ExpenseSplit = Database["public"]["Tables"]["expense_splits"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
};
type Settlement = Database["public"]["Tables"]["settlements"]["Row"] & {
  from_profile: Database["public"]["Tables"]["profiles"]["Row"];
  to_profile: Database["public"]["Tables"]["profiles"]["Row"];
  groups: Database["public"]["Tables"]["groups"]["Row"];
};

const SettleUp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSplits, setExpenseSplits] = useState<ExpenseSplit[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select("id, name")
        .order("name");

      if (groupsError) throw groupsError;
      setGroups(groupsData || []);

      if (groupsData && groupsData.length > 0) {
        setSelectedGroup(groupsData[0].id);
      }

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          profiles:paid_by(full_name),
          groups(name)
        `)
        .or(`paid_by.eq.${user.id},expense_splits.user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch expense splits
      const { data: splitsData, error: splitsError } = await supabase
        .from("expense_splits")
        .select(`
          *,
          profiles:user_id(full_name)
        `)
        .eq("user_id", user.id);

      if (splitsError) throw splitsError;

      // Fetch settlements
      const { data: settlementsData, error: settlementsError } = await supabase
        .from("settlements")
        .select(`
          *,
          from_profile:from_user(full_name),
          to_profile:to_user(full_name),
          groups(name)
        `)
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (settlementsError) throw settlementsError;

      setExpenses(expensesData || []);
      setExpenseSplits(splitsData || []);
      setSettlements(settlementsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBalances = () => {
    const balances: Record<string, number> = {};

    // Calculate expenses paid by user
    expenses
      .filter(expense => expense.paid_by === (supabase.auth.getUser() as any).data.user.id)
      .forEach(expense => {
        const splitAmount = expense.amount / expenseSplits.filter(split => split.expense_id === expense.id).length;
        expenseSplits
          .filter(split => split.expense_id === expense.id && split.user_id !== expense.paid_by)
          .forEach(split => {
            balances[split.user_id] = (balances[split.user_id] || 0) + splitAmount;
          });
      });

    // Calculate expenses owed by user
    expenseSplits
      .filter(split => split.user_id === (supabase.auth.getUser() as any).data.user.id)
      .forEach(split => {
        const expense = expenses.find(e => e.id === split.expense_id);
        if (expense) {
          balances[expense.paid_by] = (balances[expense.paid_by] || 0) - split.amount;
        }
      });

    // Apply settlements
    settlements.forEach(settlement => {
      if (settlement.from_user === (supabase.auth.getUser() as any).data.user.id) {
        balances[settlement.to_user] = (balances[settlement.to_user] || 0) - settlement.amount;
      } else if (settlement.to_user === (supabase.auth.getUser() as any).data.user.id) {
        balances[settlement.from_user] = (balances[settlement.from_user] || 0) + settlement.amount;
      }
    });

    return balances;
  };

  const handleSettleUp = async (userId: string, amount: number) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("settlements")
        .insert([
          {
            group_id: selectedGroup,
            from_user: user.id,
            to_user: userId,
            amount,
            status: "pending",
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settlement request sent successfully",
      });

      fetchData();
    } catch (error) {
      console.error("Error settling up:", error);
      toast({
        title: "Error",
        description: "Failed to settle up",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const balances = calculateBalances();
  const hasBalances = Object.values(balances).some(balance => balance !== 0);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-paypal-highlight hover:text-paypal-highlight/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Settle Up
              </CardTitle>
              <CardDescription>View and settle balances with your friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(balances).map(([userId, balance]) => {
                  if (balance === 0) return null;

                  const profile = expenses.find(e => e.paid_by === userId)?.profiles ||
                    expenseSplits.find(s => s.user_id === userId)?.profiles;

                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          balance > 0 ? "bg-paypal-primary/10" : "bg-paypal-secondary/10"
                        }`}>
                          {balance > 0 ? (
                            <ArrowUpRight className="w-5 h-5 text-paypal-primary" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-paypal-secondary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{profile?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {balance > 0 ? "owes you" : "you owe"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          balance > 0 ? "text-paypal-primary" : "text-paypal-secondary"
                        }`}>
                          ${Math.abs(balance).toFixed(2)}
                        </div>
                        <Button
                          onClick={() => handleSettleUp(userId, Math.abs(balance))}
                          disabled={isSubmitting}
                          className="mt-2"
                        >
                          {isSubmitting ? "Settling..." : "Settle Up"}
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {!hasBalances && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No balances to settle</p>
                    <Button
                      onClick={() => navigate("/add-expense")}
                      className="mt-4 bg-paypal-primary text-black hover:bg-paypal-primary/90"
                    >
                      Add an Expense
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettleUp;
