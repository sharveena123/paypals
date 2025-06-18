import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Receipt, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";

type Group = Database["public"]["Tables"]["groups"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
  group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"];
  })[];
};

type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
  groups: Database["public"]["Tables"]["groups"]["Row"] & {
    group_members?: (Database["public"]["Tables"]["group_members"]["Row"] & {
      profiles: Database["public"]["Tables"]["profiles"]["Row"];
    })[];
  };
  expense_splits: (Database["public"]["Tables"]["expense_splits"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"];
  })[];
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch recent groups (limit to 3)
      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(`
          *,
          profiles:created_by(full_name),
          group_members(
            *,
            profiles:user_id(full_name)
          )
        `)
        .eq('created_by', user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (groupsError) throw groupsError;

      // Fetch groups where user is a member
      const { data: memberGroups, error: memberGroupsError } = await supabase
        .from("groups")
        .select(`
          *,
          profiles:created_by(full_name),
          group_members(
            *,
            profiles:user_id(full_name)
          )
        `)
        .eq('group_members.user_id', user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (memberGroupsError) throw memberGroupsError;

      // Combine and deduplicate groups
      const allGroups = [...(groupsData || []), ...(memberGroups || [])];
      const uniqueGroups = allGroups.filter((group, index, self) =>
        index === self.findIndex((g) => g.id === group.id)
      ).slice(0, 3);

      // Fetch recent expenses (limit to 3)
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          profiles:paid_by(full_name),
          groups(
            name,
            group_members(
              *,
              profiles:user_id(full_name)
            )
          ),
          expense_splits(
            *,
            profiles:user_id(full_name)
          )
        `)
        .eq('paid_by', user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (expensesError) throw expensesError;

      // Fetch expenses where user is a participant
      const { data: participantExpenses, error: participantExpensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          profiles:paid_by(full_name),
          groups(
            name,
            group_members(
              *,
              profiles:user_id(full_name)
            )
          ),
          expense_splits(
            *,
            profiles:user_id(full_name)
          )
        `)
        .eq('expense_splits.user_id', user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (participantExpensesError) throw participantExpensesError;

      // Combine and deduplicate expenses
      const allExpenses = [...(expensesData || []), ...(participantExpenses || [])];
      const uniqueExpenses = allExpenses.filter((expense, index, self) =>
        index === self.findIndex((e) => e.id === expense.id)
      ).slice(0, 3);

      setGroups(uniqueGroups);
      setRecentExpenses(uniqueExpenses);

      // --- Calculate summary values ---
      // Total Spent: sum of expenses where user is the payer
      const totalSpentVal = allExpenses
        .filter(e => e.paid_by === user.id)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      setTotalSpent(totalSpentVal);

      // You Owe: sum of splits where user is not the payer and owes money
      let owe = 0;
      let areOwed = 0;
      allExpenses.forEach(exp => {
        if (Array.isArray(exp.expense_splits)) {
          exp.expense_splits.forEach(split => {
            if (split.user_id === user.id && exp.paid_by !== user.id) {
              owe += split.amount || 0;
            }
            if (exp.paid_by === user.id && split.user_id !== user.id) {
              areOwed += split.amount || 0;
            }
          });
        }
      });
      setYouOwe(owe);
      setYouAreOwed(areOwed);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Summary Cards ---
  const summaryCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">Total Spent</span>
          <span className="text-gray-400 text-xl">$</span>
        </div>
        <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
        <div className="text-gray-400 mt-1">Across all groups</div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">You Owe</span>
          <span className="text-red-400 text-xl"><DollarSign /></span>
        </div>
        <div className="text-3xl font-bold text-red-400">${youOwe.toFixed(2)}</div>
        <div className="text-gray-400 mt-1">To your friends</div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">You Are Owed</span>
          <span className="text-green-400 text-xl">$</span>
        </div>
        <div className="text-3xl font-bold text-green-400">${youAreOwed.toFixed(2)}</div>
        <div className="text-gray-400 mt-1">From your friends</div>
      </div>
    </div>
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {summaryCards}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate("/groups")}
              className="h-24 bg-paypal-primary text-black hover:bg-paypal-primary/90"
            >
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 mb-2" />
                <span>Add Group</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/add-expense")}
              className="h-24 bg-paypal-primary text-black hover:bg-paypal-primary/90"
            >
              <div className="flex flex-col items-center">
                <Receipt className="w-6 h-6 mb-2" />
                <span>Add Expense</span>
              </div>
            </Button>
            <Button
              onClick={() => navigate("/settle-up")}
              className="h-24 bg-paypal-primary text-black hover:bg-paypal-primary/90"
            >
              <div className="flex flex-col items-center">
                <DollarSign className="w-6 h-6 mb-2" />
                <span>Settle Up</span>
              </div>
            </Button>
          </div>

          {/* Recent Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recent Groups
                </div>
                <Button
                  onClick={() => navigate("/groups")}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </CardTitle>
              <CardDescription>Your most recent groups</CardDescription>
            </CardHeader>
            <CardContent>
              {groups.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {groups.map((group) => (
                    <Card key={group.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          {group.group_members.length} members
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No groups found</p>
                  <Button
                    onClick={() => navigate("/groups")}
                    className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
                  >
                    Create Your First Group
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Recent Expenses
                </div>
                <Button
                  onClick={() => navigate("/add-expense")}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Expense
                </Button>
              </CardTitle>
              <CardDescription>Your most recent expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExpenses.length > 0 ? (
                <div className="space-y-4">
                  {recentExpenses.map((expense) => {
                    // Find the payer in the group members
                    const payer =
                      (expense.groups?.group_members &&
                        expense.groups.group_members.find(
                          (m) => m.user_id === expense.paid_by
                        )) ||
                      null;
                    const payerName =
                      payer?.profiles?.full_name ||
                      payer?.member_name ||
                      expense.profiles?.full_name ||
                      "Unknown";
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.groups?.name || "Unknown Group"} • Paid by {payerName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${expense.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recent expenses</p>
                  <Button
                    onClick={() => navigate("/add-expense")}
                    className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
                  >
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
