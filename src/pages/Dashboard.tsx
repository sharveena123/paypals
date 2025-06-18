import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Receipt, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const mockData = {
    totalSpent: 1245.50,
    youOwe: 156.25,
    youAreOwed: 89.75,
    recentActivities: [
      { id: 1, description: "Dinner at Tony's", amount: 39.20, group: "Weekend Friends", time: "2 hours ago" },
      { id: 2, description: "Grocery shopping", amount: 45.60, group: "Roommates", time: "1 day ago" },
      { id: 3, description: "Movie tickets", amount: 12.50, group: "Date Night", time: "3 days ago" }
    ],
    groups: [
      { id: 1, name: "Weekend Friends", members: 4, balance: -39.20, lastActivity: "2 hours ago" },
      { id: 2, name: "Roommates", balance: 67.50, members: 3, lastActivity: "1 day ago" },
      { id: 3, name: "Mountain Trip", balance: -89.75, members: 5, lastActivity: "1 week ago" }
    ]
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Pay<span className="text-paypal-primary">Pals</span>
              </h1>
              <p className="text-muted-foreground">Welcome back, Alex!</p>
            </div>
            <div className="flex gap-3">
              <Link to="/add-expense">
                <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
              <Link to="/groups">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across all groups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You Owe</CardTitle>
              <Receipt className="h-4 w-4 text-paypal-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-paypal-secondary">${mockData.youOwe.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">To your friends</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You Are Owed</CardTitle>
              <DollarSign className="h-4 w-4 text-paypal-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-paypal-primary">${mockData.youAreOwed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From your friends</p>
            </CardContent>
          </Card>
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
              <div className="space-y-4">
                {mockData.groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.members} members • {group.lastActivity}</div>
                    </div>
                    <div className={`font-semibold ${group.balance > 0 ? 'text-paypal-primary' : 'text-paypal-secondary'}`}>
                      {group.balance > 0 ? '+' : ''}${Math.abs(group.balance).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {mockData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-muted-foreground">{activity.group} • {activity.time}</div>
                    </div>
                    <div className="font-semibold">${activity.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
