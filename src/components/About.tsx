
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const About = () => {
  const benefits = [
    "No more awkward money conversations",
    "Track expenses in real-time",
    "Multiple split methods (equal, custom, percentage)",
    "Export reports for tax purposes",
    "Multi-currency support",
    "Offline mode for remote trips"
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Why choose{" "}
              <span className="bg-gradient-to-r from-paypal-primary to-paypal-highlight bg-clip-text text-transparent">
                PayPals?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              We built PayPals because splitting expenses shouldn't be complicated. Whether it's a group dinner, weekend getaway, or shared apartment expenses, we make it simple and fair for everyone.
            </p>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-paypal-primary flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90 font-semibold hover-scale"
              >
                Start Splitting Today
              </Button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="space-y-4">
            <Card className="bg-gradient-primary border-0 text-black">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Dinner at Tony's</h3>
                  <span className="text-sm opacity-75">Tonight</span>
                </div>
                <div className="text-3xl font-bold mb-2">$156.80</div>
                <div className="text-sm opacity-75 mb-4">Split among 4 friends</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Alex: $39.20</div>
                  <div>Sarah: $39.20</div>
                  <div>Mike: $39.20</div>
                  <div>You: $39.20</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary border-0 text-black">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Vacation Rental</h3>
                  <span className="text-sm opacity-75">Last week</span>
                </div>
                <div className="text-3xl font-bold mb-2">$800.00</div>
                <div className="text-sm opacity-75 mb-4">You paid, others owe</div>
                <div className="text-sm">
                  <div className="mb-1">✓ Sarah paid back $200</div>
                  <div className="mb-1">⏳ Mike owes $200</div>
                  <div>⏳ Alex owes $200</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
