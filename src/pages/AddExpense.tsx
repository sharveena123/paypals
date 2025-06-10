
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

const AddExpense = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paidBy: "You",
    splitMethod: "equal",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [members] = useState(["You", "Sarah", "Mike", "Emma"]);
  const [selectedMembers, setSelectedMembers] = useState(["You", "Sarah", "Mike", "Emma"]);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add expense:", { ...formData, selectedMembers, customSplits });
    // TODO: Implement actual expense creation logic
  };

  const toggleMember = (member: string) => {
    setSelectedMembers(prev => 
      prev.includes(member) 
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  const updateCustomSplit = (member: string, amount: string) => {
    setCustomSplits(prev => ({ ...prev, [member]: amount }));
  };

  const equalSplit = formData.amount ? (parseFloat(formData.amount) / selectedMembers.length).toFixed(2) : "0.00";

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
                  <Label>Paid by</Label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <Button
                        key={member}
                        type="button"
                        variant={formData.paidBy === member ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, paidBy: member }))}
                      >
                        {member}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Split between</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {members.map((member) => (
                      <Button
                        key={member}
                        type="button"
                        variant={selectedMembers.includes(member) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMember(member)}
                        className="justify-start"
                      >
                        {selectedMembers.includes(member) ? <Minus className="w-3 h-3 mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
                        {member}
                      </Button>
                    ))}
                  </div>
                </div>

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
                      {selectedMembers.map((member) => (
                        <div key={member} className="flex justify-between text-sm">
                          <span>{member}:</span>
                          <span>${equalSplit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.splitMethod === "custom" && (
                    <div className="space-y-3">
                      {selectedMembers.map((member) => (
                        <div key={member} className="flex items-center gap-3">
                          <Label className="w-20">{member}:</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={customSplits[member] || ""}
                            onChange={(e) => updateCustomSplit(member, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

                <Button type="submit" className="w-full bg-paypal-primary text-black hover:bg-paypal-primary/90">
                  Add Expense
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
