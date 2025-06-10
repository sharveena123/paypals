
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-background to-muted pt-16 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in">
            Split Bills the{" "}
            <span className="bg-gradient-to-r from-paypal-primary to-paypal-highlight bg-clip-text text-transparent">
              Smart Way
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Track group expenses with ease – from meals to adventures.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-paypal-primary text-black hover:bg-paypal-primary/90 font-semibold text-lg px-8 py-3 hover-scale"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-paypal-highlight text-paypal-highlight hover:bg-paypal-highlight hover:text-white font-semibold text-lg px-8 py-3"
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-border">
              <div className="bg-gradient-primary rounded-xl p-8 text-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/90 rounded-lg p-4">
                    <div className="text-2xl font-bold text-paypal-highlight">$156</div>
                    <div className="text-sm text-muted-foreground">You Owe</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4">
                    <div className="text-2xl font-bold text-paypal-secondary">$89</div>
                    <div className="text-sm text-muted-foreground">You Are Owed</div>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">$1,245</div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-black mb-2">Weekend Trip to Mountains</div>
                <div className="text-sm text-black/70">5 friends • 8 expenses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-paypal-primary/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-paypal-secondary/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-paypal-highlight/20 rounded-full blur-xl"></div>
    </section>
  );
};

export default Hero;
