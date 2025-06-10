
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calculator, PieChart, History, Smartphone, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Group Expense Tracker",
      description: "Add multiple users and track shared expenses across different groups and trips.",
      color: "text-paypal-primary"
    },
    {
      icon: Calculator,
      title: "Auto-Split & Balances",
      description: "Automatically calculate who owes what and track balances in real-time.",
      color: "text-paypal-secondary"
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description: "Beautiful charts and summaries to understand your spending patterns.",
      color: "text-paypal-highlight"
    },
    {
      icon: History,
      title: "Activity Feed",
      description: "Keep track of all transactions with a detailed history log and recent activity.",
      color: "text-paypal-primary"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your expenses anywhere with our responsive design that works on all devices.",
      color: "text-paypal-secondary"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and secure. We never share your information.",
      color: "text-paypal-highlight"
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-paypal-primary to-paypal-highlight bg-clip-text text-transparent">
              split expenses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From simple dinner splits to complex trip expenses, PayPals handles it all with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-scale border-border bg-card hover:shadow-lg transition-all duration-300 group"
            >
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg bg-muted group-hover:scale-110 transition-transform duration-300 w-fit`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
