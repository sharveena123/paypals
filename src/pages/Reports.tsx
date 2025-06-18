import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart2, PieChart, TrendingUp, Users } from "lucide-react";
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

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSplits, setExpenseSplits] = useState<ExpenseSplit[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

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

      setExpenses(expensesData || []);
      setExpenseSplits(splitsData || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalSpent = expenses
      .filter(expense => expense.paid_by === (supabase.auth.getUser() as any).data.user.id)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalOwed = expenseSplits.reduce((sum, split) => sum + split.amount, 0);

    const totalBalance = totalSpent - totalOwed;

    return {
      totalSpent,
      totalOwed,
      totalBalance,
    };
  };

  const getGroupTotals = () => {
    const groupTotals = expenses.reduce((acc, expense) => {
      const groupName = expense.groups.name;
      if (!acc[groupName]) {
        acc[groupName] = {
          total: 0,
          count: 0,
        };
      }
      acc[groupName].total += expense.amount;
      acc[groupName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(groupTotals).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { totalSpent, totalOwed, totalBalance } = calculateTotals();
  const groupTotals = getGroupTotals();

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm font-medium">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Amount you've paid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm font-medium">
                  <PieChart className="w-4 h-4 mr-2" />
                  Total Owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalOwed.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Amount you owe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  totalBalance > 0 ? "text-paypal-primary" : "text-paypal-secondary"
                }`}>
                  {totalBalance > 0 ? "+" : ""}${Math.abs(totalBalance).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalBalance > 0 ? "You are owed" : "You owe"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Group Summary
              </CardTitle>
              <CardDescription>Expense breakdown by group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupTotals.map((group) => (
                  <div
                    key={group.name}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.count} {group.count === 1 ? "expense" : "expenses"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${group.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                ))}

                {groupTotals.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No expenses found</p>
                    <Button
                      onClick={() => navigate("/add-expense")}
                      className="mt-4 bg-paypal-primary text-black hover:bg-paypal-primary/90"
                    >
                      Add Your First Expense
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

export default Reports;
