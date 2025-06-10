
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-paypal-primary/10 to-paypal-highlight/10">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-paypal-primary text-paypal-primary" />
                ))}
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Ready to split bills the smart way?
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust PayPals to manage their group expenses. Start for free today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90 font-semibold text-lg px-8 py-3 hover-scale"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-paypal-highlight text-paypal-highlight hover:bg-paypal-highlight hover:text-white font-semibold text-lg px-8 py-3"
              >
                Contact Sales
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-paypal-highlight mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-paypal-secondary mb-1">$2M+</div>
                <div className="text-sm text-muted-foreground">Expenses Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-paypal-primary mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTA;
