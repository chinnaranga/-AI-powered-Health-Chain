import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;
    
    // Settings
    const particleCount = window.innerWidth < 768 ? 60 : 120; // Reduced count for cleaner look
    const baseSpeed = 0.08; // Slower speed for calming effect
    const colors = [
      'rgba(64, 93, 78, 0.08)',   // Soft Sage
      'rgba(184, 144, 71, 0.12)',  // Soft Gold
      'rgba(184, 144, 71, 0.06)',  // Faded Gold
      'rgba(64, 93, 78, 0.04)'     // Faded Sage
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3.5 + 1.0; // Larger soft particles
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * baseSpeed + 0.05;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.isPulse = Math.random() > 0.85;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.baseOpac = Math.random() * 0.3 + 0.1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        
        if (this.isPulse) {
          this.pulsePhase += 0.02;
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.isPulse) {
          const currentOpac = this.baseOpac + Math.sin(this.pulsePhase) * 0.2;
          ctx.fillStyle = `rgba(184, 144, 71, ${Math.max(0.03, currentOpac)})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#B89047';
        } else {
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }
    }

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    resize();
    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      id="particle-canvas" 
      ref={canvasRef} 
      className="hc-particle-canvas" 
      style={{ position: 'fixed', zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
