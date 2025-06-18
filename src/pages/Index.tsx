import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Friends from "./Friends";

const Index = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen">
        <Hero />
        <Features />
        <About />
        <CTA />
        <Footer />
      </div>
    </>
  );
};

export default Index;
