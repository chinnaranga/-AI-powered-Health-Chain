import React, { useEffect, useRef } from 'react';
import { FileLock2, Zap, History, Users, HardDrive, ClipboardCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const featuresData = [
  {
    icon: <FileLock2 size={24} />,
    title: "Encrypted Records",
    description: "AES-256 military-grade encryption ensures complete patient data privacy and protection against breaches."
  },
  {
    icon: <Zap size={24} />,
    title: "Instant Smart Contract Access",
    description: "Grant or revoke doctor access in real-time via auditable, self-executing smart contracts."
  },
  {
    icon: <History size={24} />,
    title: "Immutable History",
    description: "Every medical event is cryptographically hashed and permanently chained to the blockchain ledger."
  },
  {
    icon: <Users size={24} />,
    title: "Role-Based Access",
    description: "Fine-grained permissions for patients, doctors, and admins with multi-signature verification."
  },
  {
    icon: <HardDrive size={24} />,
    title: "Decentralized Storage",
    description: "Records distributed across IPFS nodes — no single point of failure, full data sovereignty."
  },
  {
    icon: <ClipboardCheck size={24} />,
    title: "Audit & Compliance Logs",
    description: "Tamper-proof audit trails meeting HIPAA, GDPR, and healthcare regulatory compliance standards."
  }
];

const Features = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hc-feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" className="hc-features-section" ref={sectionRef}>
      <div className="hc-container">
        <div className="hc-section-header">
          <h2>Enterprise-Grade <span className="hc-text-gradient">Features</span></h2>
          <p>Built completely from the ground up to support the complex permissioning demands of healthcare networks.</p>
        </div>
        
        <div className="hc-features-grid">
          {featuresData.map((feature, index) => (
            <div key={index} className="hc-feature-card">
              <div className="hc-feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
