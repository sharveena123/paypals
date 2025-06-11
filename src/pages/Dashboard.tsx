
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Receipt, Activity, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { groups } = useGroups();

  // Mock data for now - will be replaced with real data from database
  const mockData = {
    totalSpent: 1245.50,
    youOwe: 156.25,
    youAreOwed: 89.75,
    recentActivities: [
      { id: 1, description: "Dinner at Tony's", amount: 39.20, group: "Weekend Friends", time: "2 hours ago" },
      { id: 2, description: "Grocery shopping", amount: 45.60, group: "Roommates", time: "1 day ago" },
      { id: 3, description: "Movie tickets", amount: 12.50, group: "Date Night", time: "3 days ago" }
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
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email || 'User'}!
              </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Groups</span>
                <Link to="/groups">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
              <CardDescription>Your group expenses and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups.length > 0 ? (
                  groups.slice(0, 3).map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {group.description || 'No description'} • Created {new Date(group.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-semibold text-muted-foreground">
                        $0.00
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No groups yet</p>
                    <Link to="/groups/create">
                      <Button variant="link">Create your first group</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </span>
                <Link to="/activity">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
              <CardDescription>Latest expenses and settlements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No recent activity</p>
                  <Link to="/add-expense">
                    <Button variant="link">Add your first expense</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
