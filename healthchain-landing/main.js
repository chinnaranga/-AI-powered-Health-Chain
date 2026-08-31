/**
 * HealthChain - Main JavaScript
 * Handles particle background, scroll animations, counters, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Initialize Particles Background
  initParticles();

  // Initialize Scroll Animations (GSAP & ScrollTrigger)
  initScrollAnimations();

  // Initialize Header Scroll Effect
  initHeaderScroll();

  // Initialize Number Counters
  initCounters();
});

/* ==========================================================================
   Header Scroll Effect
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Trigger once on load in case page is already scrolled
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  }
}

/* ==========================================================================
   Particle Canvas Background
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  // Settings
  const particleCount = window.innerWidth < 768 ? 80 : 160;
  const baseSpeed = 0.18;
  const colors = [
    'rgba(255, 255, 255, 0.35)',
    'rgba(255, 255, 255, 0.15)',
    'rgba(0, 212, 255, 0.55)',   // Cyan accent
    'rgba(0, 212, 255, 0.2)',
    'rgba(168, 85, 247, 0.45)',  // Purple accent
    'rgba(168, 85, 247, 0.2)'
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      
      // Random direction between 0 and 2PI
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * baseSpeed + 0.1;
      
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // For pulsing effect
      this.isPulse = Math.random() > 0.9;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.baseOpac = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Wrap around edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      
      // Update pulse
      if (this.isPulse) {
        this.pulsePhase += 0.02;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      if (this.isPulse) {
        // Opacity varies between baseOpac and baseOpac+0.5
        const currentOpac = this.baseOpac + Math.sin(this.pulsePhase) * 0.4;
        ctx.fillStyle = `rgba(0, 212, 255, ${Math.max(0.1, currentOpac)})`;
        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
      } else {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw faint connection lines between close particles
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 90) {
          const alpha = 0.06 * (1 - dist / 90);
          // Alternate between cyan and purple connections
          const isCyanNode = particles[i].color.includes('212') || particles[j].color.includes('212');
          const isPurpleNode = particles[i].color.includes('168') || particles[j].color.includes('168');
          let strokeColor;
          if (isPurpleNode) {
            strokeColor = `rgba(168, 85, 247, ${alpha})`;
          } else if (isCyanNode) {
            strokeColor = `rgba(0, 212, 255, ${alpha})`;
          } else {
            strokeColor = `rgba(255, 255, 255, ${alpha * 0.5})`;
          }
          ctx.beginPath();
          ctx.strokeStyle = strokeColor;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    // Recreate particles on significant resize to spread them evenly
    createParticles();
  });

  resize();
  createParticles();
  animate();
}

/* ==========================================================================
   GSAP ScrollTrigger Animations
   ========================================================================== */
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Animation (On Load)
  const heroTl = gsap.timeline();
  
  heroTl.to('.badge-pill', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
        .to('.title-line', { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.4")
        .to('.hero-description', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .to('.hero-buttons', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .to('.hero-visual', { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.7)" }, "-=0.8");

  // 2. Features Grid (Scroll)
  gsap.to('.feature-card', {
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%',
      // toggleActions: 'play none none reverse' // Optional: reverse on scroll up
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.08,
    ease: "power2.out"
  });

  // 3. Process Steps (Scroll)
  gsap.to('.step-item', {
    scrollTrigger: {
      trigger: '.process-section',
      start: 'top 80%',
    },
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.2)"
  });

  // 4. Dashboard Mockup (Scroll)
  gsap.to('.dashboard-mockup', {
    scrollTrigger: {
      trigger: '.dashboard-section',
      start: 'top 75%',
    },
    scale: 1,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out"
  });

  // 5. Cinematic Image Sections (Scroll Reveal + Parallax)
  document.querySelectorAll('.cinematic-section').forEach((section) => {
    const content = section.querySelector('.cinematic-content');
    const img = section.querySelector('.cinematic-img');

    // Content fade-in
    if (content) {
      gsap.to(content, {
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      });
    }

    // Parallax image effect on scroll
    if (img) {
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        }
      );
    }
  });

  // 6. Orbit Chips rotation handling — pause on hover
  const visualContainer = document.querySelector('.hero-visual');
  if (visualContainer) {
    visualContainer.addEventListener('mouseenter', () => {
      document.querySelectorAll('.ring-outer, .ring-inner, .orbit-chip').forEach(el => {
        el.style.animationPlayState = 'paused';
      });
    });
    visualContainer.addEventListener('mouseleave', () => {
      document.querySelectorAll('.ring-outer, .ring-inner, .orbit-chip').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    });
  }

  // 7. Mouse-tracking spotlight on feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spotlight-x', `${x}%`);
      card.style.setProperty('--spotlight-y', `${y}%`);
      // Apply real-time radial gradient background
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(168, 85, 247, 0.1) 0%, rgba(13, 27, 46, 0.6) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // 8. Stat items staggered reveal
  gsap.to('.stat-item', {
    scrollTrigger: {
      trigger: '.statistics-section',
      start: 'top 80%',
    },
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.12,
    ease: "power2.out"
  });

  // 9. Section labels animated underline reveal
  document.querySelectorAll('.section-label').forEach(label => {
    gsap.fromTo(label,
      { opacity: 0, letterSpacing: '0.3em' },
      {
        opacity: 1,
        letterSpacing: '0.1em',
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: label,
          start: 'top 85%',
        }
      }
    );
  });
}

/* ==========================================================================
   Number Counters (IntersectionObserver)
   ========================================================================== */
function initCounters() {
  const counterElements = document.querySelectorAll('.stat-number');
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const endValue = parseInt(target.getAttribute('data-target'), 10);
        
        // Counter animation logic using requestAnimationFrame
        let startTimestamp = null;
        const duration = 2000; // 2 seconds

        const updateCounter = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          
          // Use easeOutQuart easing for counting
          const easeProgress = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.floor(easeProgress * endValue);
          
          target.innerText = formatNumber(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            target.innerText = formatNumber(endValue);
          }
        };
        
        requestAnimationFrame(updateCounter);
        
        // Stop observing once animated
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  counterElements.forEach(el => {
    counterObserver.observe(el);
  });
}
