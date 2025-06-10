
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity as ActivityIcon, Plus, Minus, DollarSign, Undo } from "lucide-react";
import { Link } from "react-router-dom";

const Activity = () => {
  const activities = [
    {
      id: 1,
      type: "expense",
      description: "Dinner at Tony's",
      amount: 156.80,
      group: "Weekend Friends",
      user: "Alex",
      action: "added",
      time: "2 hours ago",
      date: "2024-01-10"
    },
    {
      id: 2,
      type: "payment",
      description: "Payment to Sarah",
      amount: 39.20,
      group: "Weekend Friends",
      user: "Mike",
      action: "paid",
      time: "3 hours ago",
      date: "2024-01-10"
    },
    {
      id: 3,
      type: "expense",
      description: "Uber rides",
      amount: 45.60,
      group: "Weekend Friends",
      user: "Sarah",
      action: "added",
      time: "5 hours ago",
      date: "2024-01-10"
    },
    {
      id: 4,
      type: "expense",
      description: "Grocery shopping",
      amount: 89.30,
      group: "Roommates",
      user: "Alex",
      action: "added",
      time: "1 day ago",
      date: "2024-01-09"
    },
    {
      id: 5,
      type: "payment",
      description: "Payment to Jordan",
      amount: 28.50,
      group: "Roommates",
      user: "Alex",
      action: "paid",
      time: "1 day ago",
      date: "2024-01-09"
    },
    {
      id: 6,
      type: "expense",
      description: "Coffee",
      amount: 24.40,
      group: "Weekend Friends",
      user: "Mike",
      action: "added",
      time: "2 days ago",
      date: "2024-01-08"
    },
    {
      id: 7,
      type: "expense",
      description: "Internet bill",
      amount: 55.20,
      group: "Roommates",
      user: "Jordan",
      action: "added",
      time: "3 days ago",
      date: "2024-01-07"
    },
    {
      id: 8,
      type: "payment",
      description: "Payment to Emma",
      amount: 160.00,
      group: "Mountain Trip",
      user: "Alex",
      action: "paid",
      time: "1 week ago",
      date: "2024-01-03"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "expense":
        return <Plus className="w-4 h-4 text-paypal-secondary" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-paypal-primary" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "expense":
        return "border-l-paypal-secondary";
      case "payment":
        return "border-l-paypal-primary";
      default:
        return "border-l-muted-foreground";
    }
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
                <ActivityIcon className="w-6 h-6 mr-3" />
                Activity Feed
              </h1>
              <p className="text-muted-foreground">All recent expenses and payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Timeline of all expenses and payments across your groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 border-l-4 ${getActivityColor(activity.type)} bg-muted/30 rounded-r-lg hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full border border-border flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {activity.user} {activity.action} "{activity.description}"
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{activity.group}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className={`font-semibold ${
                          activity.type === 'expense' ? 'text-paypal-secondary' : 'text-paypal-primary'
                        }`}>
                          {activity.type === 'expense' ? '+' : '-'}${activity.amount.toFixed(2)}
                        </div>
                        
                        {activity.time.includes('hour') && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Undo className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">Load More Activities</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activity;
