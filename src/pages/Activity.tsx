import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Receipt, ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";

type Expense = Database["public"]["Tables"]["expenses"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"];
  groups: Database["public"]["Tables"]["groups"]["Row"];
};
type Settlement = Database["public"]["Tables"]["settlements"]["Row"] & {
  from_profile: Database["public"]["Tables"]["profiles"]["Row"];
  to_profile: Database["public"]["Tables"]["profiles"]["Row"];
  groups: Database["public"]["Tables"]["groups"]["Row"];
};

const Activity = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
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
        .order("created_at", { ascending: false })
        .limit(10);

      if (expensesError) throw expensesError;

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
        .order("created_at", { ascending: false })
        .limit(10);

      if (settlementsError) throw settlementsError;

      setExpenses(expensesData || []);
      setSettlements(settlementsData || []);
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast({
        title: "Error",
        description: "Failed to load activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allActivity = [
    ...expenses.map(expense => ({
      type: "expense" as const,
      data: expense,
      date: expense.created_at,
    })),
    ...settlements.map(settlement => ({
      type: "settlement" as const,
      data: settlement,
      date: settlement.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                <Receipt className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent expenses and settlements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allActivity.map((activity, index) => (
                  <div
                    key={`${activity.type}-${activity.data.id}`}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {activity.type === "expense" ? (
                        <div className="p-2 bg-paypal-primary/10 rounded-full">
                          <Receipt className="w-5 h-5 text-paypal-primary" />
                        </div>
                      ) : (
                        <div className="p-2 bg-paypal-highlight/10 rounded-full">
                          <Users className="w-5 h-5 text-paypal-highlight" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {activity.type === "expense" ? (
                            activity.data.description
                          ) : (
                            `${activity.data.from_profile.full_name} paid ${activity.data.to_profile.full_name}`
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.data.groups.name} • {formatDate(activity.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        activity.type === "expense"
                          ? "text-paypal-primary"
                          : "text-paypal-highlight"
                      }`}>
                        ${activity.type === "expense"
                          ? activity.data.amount.toFixed(2)
                          : activity.data.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.type === "expense" ? "Expense" : "Settlement"}
                      </div>
                    </div>
                  </div>
                ))}

                {allActivity.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
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

export default Activity;
