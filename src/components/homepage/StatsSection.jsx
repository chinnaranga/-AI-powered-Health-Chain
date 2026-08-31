import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, Building2, Zap, ShieldCheck } from 'lucide-react';

const stats = [
    { icon: Database, value: 1000000, suffix: '+', label: 'Records Secured', display: '1M+' },
    { icon: Building2, value: 50, suffix: '+', label: 'Hospitals', display: '50+' },
    { icon: Zap, value: 99.99, suffix: '%', label: 'Uptime', display: '99.99%' },
    { icon: ShieldCheck, value: 256, suffix: '-bit', label: 'Encryption', display: '256-bit' },
];

const AnimatedCounter = ({ value, suffix, display, inView }) => {
    const [count, setCount] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!inView || hasAnimated.current) return;
        hasAnimated.current = true;

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;

        const timer = setInterval(() => {
            current++;
            const progress = current / steps;
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(eased);

            if (current >= steps) {
                clearInterval(timer);
                setCount(1);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [inView, value]);

    if (!inView && !hasAnimated.current) {
        return <span className="text-4xl md:text-5xl font-extrabold text-white">0</span>;
    }

    // Use the display string once animation completes
    if (count >= 1) {
        return <span className="text-4xl md:text-5xl font-extrabold text-white">{display}</span>;
    }

    // During animation
    if (value >= 1000000) {
        const current = (count * value / 1000000).toFixed(1);
        return <span className="text-4xl md:text-5xl font-extrabold text-white">{current}M{suffix}</span>;
    }
    if (value === 99.99) {
        const current = (count * value).toFixed(2);
        return <span className="text-4xl md:text-5xl font-extrabold text-white">{current}{suffix}</span>;
    }
    const current = Math.floor(count * value);
    return <span className="text-4xl md:text-5xl font-extrabold text-white">{current}{suffix}</span>;
};

const StatsSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section className="relative py-24 px-6 lg:px-20" ref={ref}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl bg-gradient-to-r from-neon-cyan/[0.05] via-neon-blue/[0.08] to-neon-cyan/[0.05] backdrop-blur-md border border-white/[0.08] p-12"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    className="text-center"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-neon-cyan" />
                                    </div>
                                    <AnimatedCounter
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        display={stat.display}
                                        inView={inView}
                                    />
                                    <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsSection;
