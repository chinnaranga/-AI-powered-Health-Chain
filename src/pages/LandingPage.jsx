import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Lock, Zap, Globe, Database, Brain,
    ArrowRight, ChevronRight, Upload, Key, HardDrive, UserCheck,
    Activity, Building2, FileCheck
} from 'lucide-react';
import ParticleBackground from '../components/homepage/ParticleBackground';
import Footer from '../components/homepage/Footer';
import BlockchainGraph from '../components/BlockchainGraph';
import HeroSection from '../components/homepage/HeroSection';
import FeaturesSection from '../components/homepage/FeaturesSection';

/* ───── Fade-in wrapper ───── */
function FadeIn({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ───── Animated Counter ───── */
function Counter({ end, suffix = '', duration = 2 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = end / (duration * 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [inView, end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* Hero and Features now imported from components/homepage/ */

/* ───── BLOCKCHAIN VISUALIZATION ───── */
function BlockchainSection() {
    return (
        <section className="relative py-24">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center mb-12">
                        <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Network</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Live Blockchain Graph
                        </h2>
                        <p className="text-slate-400 mt-4 max-w-lg mx-auto">
                            Explore the network of medical records stored on the blockchain.
                        </p>
                    </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                    <BlockchainGraph />
                </FadeIn>
            </div>
        </section>
    );
}

/* ───── HOW IT WORKS ───── */
const steps = [
    { icon: Upload, title: 'Upload', desc: 'Upload medical records securely through the platform.' },
    { icon: Key, title: 'Encrypt', desc: 'AES-256 encryption applied before any data leaves your device.' },
    { icon: HardDrive, title: 'Store', desc: 'Encrypted files stored on IPFS with blockchain hash reference.' },
    { icon: UserCheck, title: 'Grant Access', desc: 'Use smart contracts to grant time-limited doctor access.' },
];

function HowItWorks() {
    return (
        <section className="relative py-24">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Process</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            How It Works
                        </h2>
                    </div>
                </FadeIn>
                <div className="grid md:grid-cols-4 gap-6 relative">
                    {/* Connection line */}
                    <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0" />
                    {steps.map((s, i) => (
                        <FadeIn key={s.title} delay={i * 0.15}>
                            <div className="text-center relative">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 relative z-10">
                                    <s.icon className="w-5 h-5 text-cyan-400" />
                                </div>
                                <span className="text-[10px] text-cyan-400/50 font-bold uppercase tracking-widest">Step {i + 1}</span>
                                <h3 className="text-lg font-semibold text-white mt-1 mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-400">{s.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ───── STATS ───── */
const stats = [
    { value: 24850, suffix: '+', label: 'Records Stored' },
    { value: 142, suffix: '', label: 'Hospitals Connected' },
    { value: 89400, suffix: '+', label: 'Smart Contracts Executed' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
];

function Stats() {
    return (
        <section className="relative py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="glass-card p-10 lg:p-14">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((s, i) => (
                            <FadeIn key={s.label} delay={i * 0.1}>
                                <div className="text-center">
                                    <p className="text-3xl lg:text-4xl font-display font-bold text-neon">
                                        <Counter end={s.value} suffix={s.suffix} />
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">{s.label}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ───── DASHBOARD PREVIEW ───── */
function DashboardPreview() {
    return (
        <section className="relative py-24">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center mb-12">
                        <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Platform</span>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                            Dashboard Preview
                        </h2>
                    </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                    <div className="glass-card p-2 lg:p-3 overflow-hidden">
                        <div className="rounded-xl bg-navy-900/50 p-6 lg:p-8">
                            {/* Mock dashboard UI */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {['Total Records', 'Doctors', 'Uploads', 'Contracts'].map((label, i) => (
                                    <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                                        <p className="text-xl font-bold text-white">
                                            {[128, 12, 5, 89][i]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 h-40">
                                    <p className="text-xs text-slate-500 mb-3">Recent Activity</p>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                <Activity className="w-3 h-3 text-cyan-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2.5 w-32 bg-white/10 rounded" />
                                            </div>
                                            <div className="h-2 w-16 bg-white/5 rounded" />
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-3">Network Health</p>
                                    <div className="flex items-center justify-center h-24">
                                        <div className="relative w-20 h-20">
                                            <svg viewBox="0 0 36 36" className="w-full h-full">
                                                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00F5FF" strokeWidth="3" strokeDasharray="95, 100" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-bold text-white">95%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ───── CTA ───── */
function CTA() {
    return (
        <section className="relative py-24">
            <div className="max-w-4xl mx-auto px-6">
                <FadeIn>
                    <div className="relative glass-card p-12 lg:p-16 text-center overflow-hidden">
                        {/* Glow accent */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                                Start Securing Records Today
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                Join hospitals and healthcare providers already using HealthChain for immutable, encrypted medical records.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:shadow-neon-lg transition-all duration-300"
                            >
                                Initialize Your Node <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ───── PAGE ───── */
export default function LandingPage() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <ParticleBackground />
            <div className="relative z-10">
                <HeroSection />
                <FeaturesSection />
                <BlockchainSection />
                <HowItWorks />
                <Stats />
                <DashboardPreview />
                <CTA />
                <Footer />
            </div>
        </div>
    );
}
