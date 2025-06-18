import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, Calendar, Users, SplitSquareHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import Navigation from "@/components/Navigation";

type Group = Database["public"]["Tables"]["groups"]["Row"] & {
  group_members: (Database["public"]["Tables"]["group_members"]["Row"] & {
    profiles: Database["public"]["Tables"]["profiles"]["Row"];
  })[];
};

const AddExpense = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    groupId: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paidBy: "",
    splitMethod: "equal",
    splits: {} as Record<string, number>,
    notes: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (formData.groupId) {
      const group = groups.find(g => g.id === formData.groupId);
      if (group) {
        // Set paid by to current user if not set
        if (!formData.paidBy && currentUser) {
          const currentMember = group.group_members.find(m => m.user_id === currentUser);
          if (currentMember) {
            setFormData(prev => ({ ...prev, paidBy: currentMember.user_id }));
          }
        }
        // Initialize splits
        const newSplits: Record<string, number> = {};
        group.group_members.forEach(member => {
          // Use member.id as the key for non-registered members
          const key = member.user_id || member.id;
          newSplits[key] = formData.splitMethod === "equal" ? 1 : 0;
        });
        setFormData(prev => ({ ...prev, splits: newSplits }));
      }
    }
  }, [formData.groupId, formData.splitMethod, groups, currentUser]);

  // Add effect to automatically calculate splits when amount changes
  useEffect(() => {
    if (formData.amount && formData.splitMethod === "equal") {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount)) {
        const group = groups.find(g => g.id === formData.groupId);
        if (group) {
          const memberCount = group.group_members.length;
          if (memberCount > 0) {
            const equalShare = Number((amount / memberCount).toFixed(2));
            const newSplits: Record<string, number> = {};
            group.group_members.forEach(member => {
              // Use member.id as the key for non-registered members
              const key = member.user_id || member.id;
              newSplits[key] = equalShare;
            });
            setFormData(prev => ({ ...prev, splits: newSplits }));
          }
        }
      }
    }
  }, [formData.amount, formData.splitMethod, formData.groupId, groups]);

  const fetchGroups = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user.id);

      const { data: groupsData, error: groupsError } = await supabase
        .from("groups")
        .select(`
          *,
          group_members(
            *,
            profiles:user_id(full_name)
          )
        `)
        .order("name");

      if (groupsError) {
        console.error("Groups fetch error:", groupsError);
        throw new Error(`Failed to fetch groups: ${groupsError.message}`);
      }

      setGroups(groupsData || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        navigate("/login");
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Get the selected member
      const selectedGroup = groups.find(g => g.id === formData.groupId);
      if (!selectedGroup) {
        throw new Error("Selected group not found");
      }

      const selectedMember = selectedGroup.group_members.find(m => 
        (m.user_id || m.id) === formData.paidBy
      );
      if (!selectedMember) {
        throw new Error("Selected member not found");
      }

      // Create expense
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          group_id: formData.groupId,
          paid_by: selectedMember.user_id || user.id, // Use current user's ID if member is not registered
          amount,
          description: formData.description,
          date: formData.date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (expenseError) {
        console.error("Expense creation error:", expenseError);
        throw new Error(`Failed to create expense: ${expenseError.message}`);
      }

      if (!expenseData) {
        throw new Error("No expense data returned after creation");
      }

      // Calculate split amounts
      const totalSplits = Object.values(formData.splits).reduce((sum, value) => sum + value, 0);
      if (totalSplits <= 0) {
        throw new Error("Please specify how to split the expense");
      }

      const splitAmounts = Object.entries(formData.splits).map(([memberId, value]) => {
        const member = selectedGroup.group_members.find(m => (m.user_id || m.id) === memberId);
        if (!member) {
          throw new Error("Member not found");
        }

        return {
          expense_id: expenseData.id,
          user_id: member.user_id || null, // Set to null for non-registered members
          amount: Number(((amount * value) / totalSplits).toFixed(2)),
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // Create expense splits
      const { error: splitsError } = await supabase
        .from("expense_splits")
        .insert(splitAmounts);

      if (splitsError) {
        console.error("Expense splits creation error:", splitsError);
        throw new Error(`Failed to create expense splits: ${splitsError.message}`);
      }

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitChange = (memberId: string, value: string) => {
    const numValue = Number(parseFloat(value || "0").toFixed(2));
    setFormData(prev => ({
      ...prev,
      splits: {
        ...prev.splits,
        [memberId]: numValue,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto">
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

  const selectedGroup = groups.find(g => g.id === formData.groupId);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto space-y-6">
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
                Add Expense
              </CardTitle>
              <CardDescription>Add a new expense to split with your group</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Group</Label>
                  <Select
                    value={formData.groupId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGroup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What's this expense for?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          className="pl-9"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Paid By</Label>
                      <Select
                        value={formData.paidBy}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGroup.group_members.map((member) => (
                            <SelectItem 
                              key={member.user_id || member.id} 
                              value={member.user_id || member.id}
                            >
                              {member.profiles?.full_name || member.member_name || 'Unknown Member'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Split Method</Label>
                      <Select
                        value={formData.splitMethod}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, splitMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select split method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equal">Equal</SelectItem>
                          <SelectItem value="exact">Exact Amounts</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Split Between</Label>
                      <div className="space-y-2">
                        {selectedGroup.group_members.map((member) => (
                          <div key={member.user_id || member.id} className="flex items-center space-x-2">
                            <Label className="flex-1">{member.profiles?.full_name || member.member_name || 'Unknown Member'}</Label>
                            <div className="relative w-32">
                              {formData.splitMethod === "percentage" && (
                                <span className="absolute right-3 top-3 text-muted-foreground">%</span>
                              )}
                              {formData.splitMethod === "exact" && (
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              )}
                              <Input
                                type="number"
                                step={formData.splitMethod === "percentage" ? "1" : "0.01"}
                                min="0"
                                value={formData.splits[member.user_id || member.id] || 0}
                                onChange={(e) => handleSplitChange(member.user_id || member.id, e.target.value)}
                                className={formData.splitMethod === "exact" ? "pl-9" : "pr-9"}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any additional notes about this expense"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Adding Expense..." : "Add Expense"}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AddExpense;
