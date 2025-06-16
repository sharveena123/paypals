
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl font-bold text-foreground">
                Pay<span className="text-paypal-primary">Pals</span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#home" className="text-foreground hover:text-paypal-highlight transition-colors">
                Home
              </a>
              <a href="#features" className="text-foreground hover:text-paypal-highlight transition-colors">
                Features
              </a>
              <a href="#about" className="text-foreground hover:text-paypal-highlight transition-colors">
                About
              </a>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-paypal-highlight">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-border">
              <a
                href="#home"
                className="block px-3 py-2 text-foreground hover:text-paypal-highlight transition-colors"
                onClick={toggleMenu}
              >
                Home
              </a>
              <a
                href="#features"
                className="block px-3 py-2 text-foreground hover:text-paypal-highlight transition-colors"
                onClick={toggleMenu}
              >
                Features
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-foreground hover:text-paypal-highlight transition-colors"
                onClick={toggleMenu}
              >
                About
              </a>
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex flex-col space-y-2">
                  <Link to="/auth">
                    <Button variant="ghost" className="justify-start text-foreground hover:text-paypal-highlight w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-paypal-primary text-black hover:bg-paypal-primary/90 font-semibold w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
