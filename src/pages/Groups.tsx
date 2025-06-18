import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Users, X } from "lucide-react";
import { Link } from "react-router-dom";

const Groups = () => {
  const groups = [
    {
      id: 1,
      name: "Weekend Friends",
      members: ["Alex", "Sarah", "Mike", "Emma"],
      totalExpenses: 456.80,
      yourShare: 114.20,
      balance: -39.20,
      expenses: [
        { id: 1, description: "Dinner at Tony's", amount: 156.80, paidBy: "Alex", date: "2024-01-10" },
        { id: 2, description: "Uber rides", amount: 45.60, paidBy: "Sarah", date: "2024-01-10" },
        { id: 3, description: "Coffee", amount: 24.40, paidBy: "Mike", date: "2024-01-09" }
      ]
    },
    {
      id: 2,
      name: "Roommates",
      members: ["Alex", "Jordan", "Casey"],
      totalExpenses: 234.50,
      yourShare: 78.17,
      balance: 67.50,
      expenses: [
        { id: 4, description: "Grocery shopping", amount: 89.30, paidBy: "Alex", date: "2024-01-09" },
        { id: 5, description: "Internet bill", amount: 55.20, paidBy: "Jordan", date: "2024-01-08" },
        { id: 6, description: "Cleaning supplies", amount: 90.00, paidBy: "Alex", date: "2024-01-07" }
      ]
    },
    {
      id: 3,
      name: "Mountain Trip",
      members: ["Alex", "Sarah", "Mike", "Emma", "Tom"],
      totalExpenses: 1250.00,
      yourShare: 250.00,
      balance: -89.75,
      expenses: [
        { id: 7, description: "Cabin rental", amount: 800.00, paidBy: "Sarah", date: "2024-01-05" },
        { id: 8, description: "Gas", amount: 120.00, paidBy: "Mike", date: "2024-01-05" },
        { id: 9, description: "Groceries", amount: 330.00, paidBy: "Alex", date: "2024-01-05" }
      ]
    }
  ];

    return (
      <Dialog open={!!showAddMembersModal} onOpenChange={() => setShowAddMembersModal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
            <DialogDescription>
              Search and select members to add to this group
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search members by name or email..."
                value={addMembersFormData.memberSearch}
                onChange={(e) => setAddMembersFormData({ ...addMembersFormData, memberSearch: e.target.value })}
                className="pr-8"
              />
              <Users className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Search Results */}
            {addMembersFormData.memberSearch && (
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {getFilteredAvailableMembers(showAddMembersModal).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No members found
                  </p>
                ) : (
                  getFilteredAvailableMembers(showAddMembersModal).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary font-medium">
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.full_name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAddMember(member.id)}
                        className="flex-shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Members */}
            {addMembersFormData.selectedMembers.size > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Selected Members</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {Array.from(addMembersFormData.selectedMembers).map((memberId) => {
                    const member = availableMembers.find(m => m.id === memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-paypal-primary/10 flex items-center justify-center text-paypal-primary font-medium">
                            {getInitials(member.full_name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {member.full_name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAddMember(memberId)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddMembersModal(null)}
                disabled={isAddingMembers}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAddMembers(showAddMembersModal)}
                disabled={isAddingMembers || addMembersFormData.selectedMembers.size === 0}
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
              >
                {isAddingMembers ? "Adding..." : "Add Members"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
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
            <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-paypal-primary text-black hover:bg-paypal-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showCreateForm ? "Cancel" : "Create Group"}
            </Button>
          </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription>{group.members.length} members • ${group.totalExpenses.toFixed(2)} total</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${group.balance > 0 ? 'text-paypal-primary' : 'text-paypal-secondary'}`}>
                      {group.balance > 0 ? '+' : ''}${Math.abs(group.balance).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {group.balance > 0 ? 'You are owed' : 'You owe'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.members.map((member, index) => (
                    <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                      {member}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center">
                      <Receipt className="w-4 h-4 mr-2" />
                      Recent Expenses
                    </h4>
                    <div className="flex gap-2">
                      <Link to="/add-expense">
                        <Button size="sm" variant="outline">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Expense
                        </Button>
                      </Link>
                      <Link to="/settle-up">
                        <Button size="sm" className="bg-paypal-highlight text-white hover:bg-paypal-highlight/90">
                          Settle Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {group.expenses.slice(0, 3).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium text-sm">{expense.description}</div>
                          <div className="text-xs text-muted-foreground">Paid by {expense.paidBy} • {expense.date}</div>
                        </div>
                        <div className="font-semibold">${expense.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
