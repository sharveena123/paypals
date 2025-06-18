
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign, Users, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { useSettlements } from "@/hooks/useSettlements";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SettleUp = () => {
  const [formData, setFormData] = useState({
    groupId: "",
    fromUserId: "",
    toUserId: "",
    amount: "",
    paymentMethod: "cash",
    notes: ""
  });

  const { user } = useAuth();
  const { groups, loading: groupsLoading } = useGroups();
  const { members, loading: membersLoading } = useGroupMembers(formData.groupId);
  const { createSettlement, loading: settlementLoading } = useSettlements();
  const { toast } = useToast();
  const navigate = useNavigate();

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "venmo", label: "Venmo" },
    { value: "paypal", label: "PayPal" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "zelle", label: "Zelle" },
    { value: "apple_pay", label: "Apple Pay" },
    { value: "google_pay", label: "Google Pay" }
  ];

  // Filter members to show only valid payers and receivers
  const validPayers = members.filter(member => 
    member.user_id === user?.id || member.user_id !== formData.toUserId
  );
  
  const validReceivers = members.filter(member => 
    member.user_id !== formData.fromUserId
  );

  // Set default payer to current user when group is selected
  useEffect(() => {
    if (formData.groupId && user && members.length > 0) {
      const currentUserMember = members.find(member => member.user_id === user.id);
      if (currentUserMember && !formData.fromUserId) {
        setFormData(prev => ({ ...prev, fromUserId: currentUserMember.user_id }));
      }
    }
  }, [formData.groupId, user, members, formData.fromUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupId || !formData.fromUserId || !formData.toUserId || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { settlement, error } = await createSettlement({
        groupId: formData.groupId,
        fromUserId: formData.fromUserId,
        toUserId: formData.toUserId,
        amount: amount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });

      if (error) {
        toast({
          title: "Settlement Failed",
          description: "There was an error recording the settlement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Settlement Recorded",
        description: "The payment has been successfully recorded.",
      });

      // Reset form
      setFormData({
        groupId: "",
        fromUserId: "",
        toUserId: "",
        amount: "",
        paymentMethod: "cash",
        notes: ""
      });

      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Settlement error:", error);
      toast({
        title: "Settlement Failed",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPersonName = (userId: string) => {
    if (userId === user?.id) return "You";
    const member = members.find(m => m.user_id === userId);
    return member?.profiles?.full_name || "Unknown User";
  };

  const selectedGroup = groups.find(g => g.id === formData.groupId);

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
                <DollarSign className="w-6 h-6 mr-3 text-paypal-primary" />
                Settle Up
              </h1>
              <p className="text-muted-foreground">Record a payment between group members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-paypal-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Group Selection */}
                <div className="space-y-2">
                  <Label htmlFor="group">Select Group *</Label>
                  <Select 
                    value={formData.groupId} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      groupId: value,
                      fromUserId: "",
                      toUserId: ""
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groupsLoading ? (
                        <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                      ) : groups.length === 0 ? (
                        <SelectItem value="no-groups" disabled>No groups available</SelectItem>
                      ) : (
                        groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show group info if selected */}
                {selectedGroup && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="font-medium text-blue-900">{selectedGroup.name}</div>
                    <div className="text-sm text-blue-700">
                      {selectedGroup.description || 'No description'} • {selectedGroup.member_count} members
                    </div>
                  </div>
                )}

                {/* Payer and Receiver Selection */}
                {formData.groupId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payer">From (Payer) *</Label>
                      <Select 
                        value={formData.fromUserId} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          fromUserId: value,
                          toUserId: prev.toUserId === value ? "" : prev.toUserId
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {membersLoading ? (
                            <SelectItem value="loading" disabled>Loading members...</SelectItem>
                          ) : (
                            validPayers.map((member) => (
                              <SelectItem key={member.user_id} value={member.user_id}>
                                {member.user_id === user?.id ? "You" : member.profiles?.full_name || "Unknown User"}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiver">To (Receiver) *</Label>
                      <Select 
                        value={formData.toUserId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, toUserId: value }))}
                        disabled={!formData.fromUserId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select receiver..." />
                        </SelectTrigger>
                        <SelectContent>
                          {membersLoading ? (
                            <SelectItem value="loading" disabled>Loading members...</SelectItem>
                          ) : (
                            validReceivers.map((member) => (
                              <SelectItem key={member.user_id} value={member.user_id}>
                                {member.user_id === user?.id ? "You" : member.profiles?.full_name || "Unknown User"}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Payment reference, transaction ID, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Settlement Preview */}
                {formData.fromUserId && formData.toUserId && formData.amount && parseFloat(formData.amount) > 0 && (
                  <div className="bg-paypal-primary/10 border border-paypal-primary/20 p-4 rounded-lg">
                    <div className="font-medium text-center text-lg">
                      {getPersonName(formData.fromUserId)} pays {getPersonName(formData.toUserId)} ${parseFloat(formData.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-1">
                      via {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                    </div>
                    {selectedGroup && (
                      <div className="text-sm text-muted-foreground text-center mt-1">
                        in {selectedGroup.name}
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-paypal-highlight text-white hover:bg-paypal-highlight/90"
                  disabled={
                    !formData.groupId || 
                    !formData.fromUserId || 
                    !formData.toUserId || 
                    !formData.amount || 
                    parseFloat(formData.amount || "0") <= 0 ||
                    settlementLoading
                  }
                >
                  {settlementLoading ? "Recording Payment..." : "Record Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettleUp;
