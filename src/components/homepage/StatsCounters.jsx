import React, { useEffect, useRef } from 'react';

const statsData = [
  { value: 24850, label: "Records Stored", isPercent: false },
  { value: 142, label: "Hospitals Connected", isPercent: false },
  { value: 89400, label: "Contracts Executed", isPercent: false },
  { value: 99.9, label: "Uptime SLA", isPercent: true, stringValue: "99.9%" }
];

const StatsCounters = () => {
  const sectionRef = useRef(null);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = parseFloat(target.getAttribute('data-target'));
          const isPercent = target.getAttribute('data-percent') === 'true';
          const stringValue = target.getAttribute('data-string-value');
          
          if (isPercent) {
             // For static percentages, we can just show it directly or animate to it simply
             target.innerText = stringValue;
             observer.unobserve(target);
             return;
          }

          let startTimestamp = null;
          const duration = 2000;

          const updateCounter = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
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
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    const elements = sectionRef.current.querySelectorAll('.hc-stat-number');
    elements.forEach(el => counterObserver.observe(el));

    return () => {
      elements.forEach(el => counterObserver.unobserve(el));
    };
  }, []);

  return (
    <section className="hc-stats-section" ref={sectionRef}>
      <div className="hc-container">
        <div className="hc-stats-card">
          {statsData.map((stat, index) => (
            <div key={index} className="hc-stat-item">
              <div 
                className={stat.isPercent ? "hc-stat-number-percent" : "hc-stat-number"}
                data-target={stat.value}
                data-percent={stat.isPercent}
                data-string-value={stat.stringValue}
              >
                0
              </div>
              <div className="hc-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounters;
