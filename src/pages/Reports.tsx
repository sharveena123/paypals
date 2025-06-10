
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, PieChart, BarChart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => {
  const mockData = {
    totalSpent: 2450.75,
    totalOwed: 156.25,
    totalOwing: 89.75,
    monthlyExpenses: [
      { month: "Jan", amount: 450 },
      { month: "Feb", amount: 520 },
      { month: "Mar", amount: 380 },
      { month: "Apr", amount: 650 },
      { month: "May", amount: 450.75 }
    ],
    categoryBreakdown: [
      { category: "Food & Dining", amount: 890.50, percentage: 36 },
      { category: "Transportation", amount: 445.25, percentage: 18 },
      { category: "Accommodation", amount: 612.00, percentage: 25 },
      { category: "Entertainment", amount: 334.00, percentage: 14 },
      { category: "Other", amount: 169.00, percentage: 7 }
    ],
    topGroups: [
      { name: "Weekend Friends", spent: 856.80, expenses: 12 },
      { name: "Roommates", spent: 634.50, expenses: 8 },
      { name: "Mountain Trip", spent: 1250.00, expenses: 6 },
      { name: "Date Nights", spent: 234.45, expenses: 4 }
    ]
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
                  <BarChart className="w-6 h-6 mr-3" />
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground">Your spending insights and summaries</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent (All Time)</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across all groups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Owed</CardTitle>
              <PieChart className="h-4 w-4 text-paypal-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-paypal-primary">${mockData.totalOwed.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From friends</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Owing</CardTitle>
              <PieChart className="h-4 w-4 text-paypal-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-paypal-secondary">${mockData.totalOwing.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">To friends</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Spending Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Monthly Spending Trend
              </CardTitle>
              <CardDescription>Your expense pattern over the last 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.monthlyExpenses.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="font-medium">{month.month} 2024</div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-paypal-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(month.amount / 700) * 100}%` }}
                        />
                      </div>
                      <div className="font-semibold w-16 text-right">${month.amount.toFixed(0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Spending by Category
              </CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.categoryBreakdown.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.category}</span>
                      <span>${category.amount.toFixed(2)} ({category.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-paypal-primary' : 
                          index === 1 ? 'bg-paypal-secondary' :
                          index === 2 ? 'bg-paypal-highlight' :
                          'bg-muted-foreground'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Groups</CardTitle>
              <CardDescription>Groups with highest spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.topGroups.map((group, index) => (
                  <div key={group.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.expenses} expenses</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${group.spent.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download your expense data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export as PDF Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export as CSV Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Tax Summary Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
