import React, { useEffect, useRef } from 'react';
import { UploadCloud, Lock, Database, KeyRound } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  {
    icon: <UploadCloud size={24} />,
    title: "Upload",
    description: "Upload medical records securely through the platform."
  },
  {
    icon: <Lock size={24} />,
    title: "Encrypt",
    description: "AES-256 encryption applied before any data leaves your device."
  },
  {
    icon: <Database size={24} />,
    title: "Store",
    description: "Encrypted files stored on IPFS with blockchain hash reference."
  },
  {
    icon: <KeyRound size={24} />,
    title: "Grant Access",
    description: "Use smart contracts to grant time-limited doctor access."
  }
];

const Process = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hc-step-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.2)"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hc-process-section" ref={sectionRef}>
      <div className="hc-container">
        <div className="hc-section-header">
          <span className="hc-section-label">PROCESS</span>
          <h2>How It Works</h2>
        </div>
        
        <div className="hc-process-steps">
          <div className="hc-step-connector"></div>
          
          {processSteps.map((step, index) => (
            <div key={index} className="hc-step-item">
              <div className="hc-step-icon-container">
                {step.icon}
              </div>
              <span className="hc-step-label">STEP {index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
