
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { useCreateExpense } from "@/hooks/useCreateExpense";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { groups } = useGroups();
  const { createExpense, loading } = useCreateExpense();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paidBy: user?.id || "",
    groupId: searchParams.get('groupId') || "",
    splitMethod: "equal" as "equal" | "custom",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    category: "general"
  });

  const { members } = useGroupMembers(formData.groupId || null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  // Set current user as default payer and member when component loads
  useEffect(() => {
    if (user && members.length > 0) {
      const currentUserMember = members.find(m => m.user_id === user.id);
      if (currentUserMember && !selectedMembers.includes(user.id)) {
        setSelectedMembers([user.id]);
      }
    }
  }, [user, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupId) {
      toast({
        title: "Group required",
        description: "Please select a group for this expense.",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: "Members required",
        description: "Please select at least one member to split the expense with.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Calculate splits
    let splits: Record<string, number> = {};
    
    if (formData.splitMethod === "equal") {
      const splitAmount = amount / selectedMembers.length;
      selectedMembers.forEach(memberId => {
        splits[memberId] = splitAmount;
      });
    } else {
      // Custom splits
      let totalCustom = 0;
      selectedMembers.forEach(memberId => {
        const customAmount = parseFloat(customSplits[memberId] || "0");
        splits[memberId] = customAmount;
        totalCustom += customAmount;
      });
      
      if (Math.abs(totalCustom - amount) > 0.01) {
        toast({
          title: "Split amounts don't match",
          description: `Custom splits total $${totalCustom.toFixed(2)} but expense is $${amount.toFixed(2)}.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { expense, error } = await createExpense({
        description: formData.description,
        amount: amount,
        paidBy: formData.paidBy,
        groupId: formData.groupId,
        category: formData.category,
        splits: splits,
        notes: formData.notes,
        date: formData.date
      });

      if (error) {
        toast({
          title: "Error creating expense",
          description: "Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Expense created!",
          description: `${formData.description} has been added successfully.`,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error creating expense",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const updateCustomSplit = (memberId: string, amount: string) => {
    setCustomSplits(prev => ({ ...prev, [memberId]: amount }));
  };

  const equalSplit = formData.amount && selectedMembers.length > 0 
    ? (parseFloat(formData.amount) / selectedMembers.length).toFixed(2) 
    : "0.00";

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.user_id === memberId);
    if (member?.user_id === user?.id) return "You";
    return member?.profiles?.full_name || member?.profiles?.email || "Unknown User";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Plus className="w-6 h-6 mr-3" />
                Add Expense
              </h1>
              <p className="text-muted-foreground">Record a new group expense</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupId">Group</Label>
                  <Select value={formData.groupId} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, groupId: value }));
                    setSelectedMembers([]);
                  }}>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this expense for?"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.groupId && (
                  <>
                    <div className="space-y-2">
                      <Label>Paid by</Label>
                      <Select value={formData.paidBy} onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              {getMemberName(member.user_id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Split between</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {members.map((member) => (
                          <Button
                            key={member.user_id}
                            type="button"
                            variant={selectedMembers.includes(member.user_id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleMember(member.user_id)}
                            className="justify-start"
                          >
                            {selectedMembers.includes(member.user_id) ? 
                              <Minus className="w-3 h-3 mr-2" /> : 
                              <Plus className="w-3 h-3 mr-2" />
                            }
                            {getMemberName(member.user_id)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedMembers.length > 0 && (
                      <div className="space-y-4">
                        <Label>Split method</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={formData.splitMethod === "equal" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, splitMethod: "equal" }))}
                          >
                            Equal split
                          </Button>
                          <Button
                            type="button"
                            variant={formData.splitMethod === "custom" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, splitMethod: "custom" }))}
                          >
                            Custom amounts
                          </Button>
                        </div>

                        {formData.splitMethod === "equal" && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="text-sm font-medium mb-2">Equal split breakdown:</div>
                            {selectedMembers.map((memberId) => (
                              <div key={memberId} className="flex justify-between text-sm">
                                <span>{getMemberName(memberId)}:</span>
                                <span>${equalSplit}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.splitMethod === "custom" && (
                          <div className="space-y-3">
                            {selectedMembers.map((memberId) => (
                              <div key={memberId} className="flex items-center gap-3">
                                <Label className="w-20">{getMemberName(memberId)}:</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={customSplits[memberId] || ""}
                                  onChange={(e) => updateCustomSplit(memberId, e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-paypal-primary text-black hover:bg-paypal-primary/90"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
