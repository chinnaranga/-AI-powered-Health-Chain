import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Key, Activity } from 'lucide-react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline();
      
      heroTl.to('.hc-badge-pill', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
            .to('.hc-title-line', { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.4")
            .to('.hc-hero-description', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
            .to('.hc-hero-buttons', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
            .to('.hc-hero-visual', { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.7)" }, "-=0.8");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    document.querySelectorAll('.hc-ring-outer, .hc-ring-inner, .hc-orbit-chip').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  };

  const handleMouseLeave = () => {
    document.querySelectorAll('.hc-ring-outer, .hc-ring-inner, .hc-orbit-chip').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  };

  return (
    <section id="home" className="hc-hero-section" ref={heroRef}>
      <div className="hc-container hc-hero-container">
        <div className="hc-hero-content">
          <div className="hc-badge-pill">
            <span className="hc-pulse-dot"></span>
            Blockchain-Powered Healthcare
          </div>
          <h1 className="hc-hero-title">
            <span className="hc-title-line hc-title-line-1">Secure</span>
            <span className="hc-title-line hc-title-line-2">Healthcare</span>
            <span className="hc-title-line hc-title-line-3">on Blockchain</span>
          </h1>
          <p className="hc-hero-description">
            Empowering patients and providers with unbreakable medical records driven by decentalized node technology and military grade encryption.
          </p>
          <div className="hc-hero-buttons">
            <button 
              className="hc-btn hc-btn-primary hc-btn-lg"
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button 
              className="hc-btn hc-btn-outline hc-btn-lg"
              onClick={() => navigate('/login')}
            >
              Access Portal
            </button>
          </div>
        </div>
        
        <div 
          className="hc-hero-visual" 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
        >
          <div className="hc-concentric-rings">
            <div className="hc-ring hc-ring-outer"></div>
            <div className="hc-ring hc-ring-inner"></div>
            
            <div className="hc-center-card">
              <ShieldCheck className="hc-center-icon" size={48} />
            </div>
            
            <div className="hc-orbit-chip hc-chip-1">
              <Key className="hc-chip-icon" size={20} />
            </div>
            <div className="hc-orbit-chip hc-chip-2">
              <Activity className="hc-chip-icon" size={20} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
