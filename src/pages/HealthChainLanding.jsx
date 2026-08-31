import React from 'react';
import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import TrustSection from '../components/landing/TrustSection';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorks from '../components/landing/HowItWorks';
import ProductShowcase from '../components/landing/ProductShowcase';
import FeaturesSection from '../components/landing/FeaturesSection';
import SecuritySection from '../components/landing/SecuritySection';
import WhyHealthChain from '../components/landing/WhyHealthChain';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import LandingAIChat from '../components/landing/LandingAIChat';

export default function HealthChainLanding() {
  return (
    <div className="hc-landing min-h-screen bg-white text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      <Header />
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Trust (Corporate Logos) */}
        <TrustSection />
        
        {/* Problem Timeline */}
        <ProblemSection />
        
        {/* Dynamic Care Journey Workflow */}
        <HowItWorks />
        
        {/* Stakeholder App Showcase */}
        <ProductShowcase />
        
        {/* Alternating Core Features */}
        <FeaturesSection />
        
        {/* Technical Security Architecture */}
        <SecuritySection />
        
        {/* Traditional vs HealthChain Matrix */}
        <WhyHealthChain />
        
        {/* Community Testimony */}
        <TestimonialsSection />
        
        {/* Predictable Pricing Plans */}
        <PricingSection />
        
        {/* Common Queries Accordion */}
        <FAQSection />
        
        {/* Bottom CTA Block */}
        <CTASection />
      </main>
      <Footer />
      <LandingAIChat />
    </div>
  );
}
