
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Users, ArrowLeft, Receipt, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Groups = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState([
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
  ]);

  const handleDeleteGroup = (groupId: number, groupName: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    toast({
      title: "Group deleted",
      description: `${groupName} has been deleted successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Groups
                </h1>
                <p className="text-muted-foreground">Manage your expense groups</p>
              </div>
            </div>
            <Link to="/groups/create">
              <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>
        </div>
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
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${group.balance > 0 ? 'text-paypal-primary' : 'text-paypal-secondary'}`}>
                        {group.balance > 0 ? '+' : ''}${Math.abs(group.balance).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {group.balance > 0 ? 'You are owed' : 'You owe'}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Group</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{group.name}"? This action cannot be undone and will remove all expenses and data associated with this group.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Group
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
