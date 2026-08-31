import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Shield, Lock, Database, Globe, Zap, Brain,
    AlertTriangle, CheckCircle, ArrowRight, Layers,
    Code2, Server, Cpu, FileKey
} from 'lucide-react';
import ParticleBackground from '../components/homepage/ParticleBackground';
import Footer from '../components/homepage/Footer';

/* ── Fade-in wrapper ── */
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

/* ── Problem items ── */
const problems = [
    { icon: AlertTriangle, text: 'Fragmented medical records across hospitals' },
    { icon: AlertTriangle, text: 'Lack of patient control over data privacy' },
    { icon: AlertTriangle, text: 'Slow processing of insurance & verification' },
    { icon: AlertTriangle, text: 'Vulnerability to centralized data breaches' },
];

/* ── Solution items ── */
const solutions = [
    { icon: CheckCircle, text: 'Decentralized ledger for all records' },
    { icon: CheckCircle, text: 'Cryptographic patient keys for access' },
    { icon: CheckCircle, text: 'Interoperable standard for all clinics' },
    { icon: CheckCircle, text: 'Real-time auditing and traceability' },
];

/* ── Tech stack ── */
const techStack = [
    { icon: Code2, label: 'React.js' },
    { icon: Zap, label: 'Vite' },
    { icon: Layers, label: 'Tailwind CSS' },
    { icon: Database, label: 'IPFS Storage' },
    { icon: Lock, label: 'AES-256 Encryption' },
    { icon: Shield, label: 'Smart Contracts' },
    { icon: Server, label: 'Express.js' },
    { icon: Cpu, label: 'Ethereum / Hardhat' },
];

/* ── Core values ── */
const values = [
    { icon: Shield, title: 'Security First', desc: 'Military-grade encryption and blockchain immutability protect every record.', color: 'from-cyan-500 to-blue-600' },
    { icon: Globe, title: 'Global Access', desc: 'Access records anywhere with wallet-based authentication and zero downtime.', color: 'from-blue-500 to-purple-600' },
    { icon: Brain, title: 'AI-Powered', desc: 'Machine learning analytics on anonymized data for smarter healthcare.', color: 'from-purple-500 to-pink-600' },
    { icon: FileKey, title: 'Patient-Centric', desc: 'Full ownership and control of medical data — grant or revoke access instantly.', color: 'from-emerald-500 to-cyan-600' },
];

export default function About() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <ParticleBackground />

            <div className="relative z-10 pt-24 pb-16">
                {/* ── Hero ── */}
                <section className="max-w-5xl mx-auto px-6 text-center mb-24">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs text-cyan-400 font-medium">About HealthChain</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                            Revolutionizing Healthcare
                            <br />
                            <span className="text-neon">With Blockchain</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Empowering patients with full ownership of their medical data through
                            decentralized, immutable, and encrypted health records secured by blockchain technology.
                        </p>
                    </FadeIn>
                </section>

                {/* ── Mission ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <FadeIn>
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                            {/* Glow accent */}
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Our Mission</span>
                                <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mt-3 mb-4">
                                    Data Sovereignty for Every Patient
                                </h2>
                                <p className="text-slate-400 leading-relaxed max-w-3xl">
                                    To revolutionize the healthcare industry by empowering patients with full ownership of their medical data.
                                    Using blockchain technology, we ensure that records are immutable, secure, and instantly accessible
                                    to authorized personnel only. Our platform bridges the gap between healthcare providers while
                                    maintaining the highest standards of privacy and compliance with HIPAA regulations.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Problem / Solution Grid ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <FadeIn>
                        <div className="text-center mb-12">
                            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Why We Exist</span>
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                                Problem → Solution
                            </h2>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Problem card */}
                        <FadeIn delay={0.1}>
                            <div className="backdrop-blur-xl bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-8 h-full hover:bg-red-500/[0.08] hover:border-red-500/30 transition-all duration-500">
                                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> The Problem
                                </h3>
                                <ul className="space-y-4">
                                    {problems.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <item.icon className="w-4 h-4 text-red-400/60 mt-0.5 shrink-0" />
                                            <span className="text-sm text-slate-300 leading-relaxed">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </FadeIn>

                        {/* Solution card */}
                        <FadeIn delay={0.2}>
                            <div className="backdrop-blur-xl bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl p-8 h-full hover:bg-emerald-500/[0.08] hover:border-emerald-500/30 transition-all duration-500">
                                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> The Solution
                                </h3>
                                <ul className="space-y-4">
                                    {solutions.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <item.icon className="w-4 h-4 text-emerald-400/60 mt-0.5 shrink-0" />
                                            <span className="text-sm text-slate-300 leading-relaxed">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Core Values ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <FadeIn>
                        <div className="text-center mb-12">
                            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Values</span>
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3">
                                What We Stand For
                            </h2>
                        </div>
                    </FadeIn>
                    <div className="grid sm:grid-cols-2 gap-5">
                        {values.map((v, i) => (
                            <FadeIn key={v.title} delay={i * 0.1}>
                                <div className="group backdrop-blur-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-7 hover:from-white/[0.12] hover:to-white/[0.05] hover:border-white/25 transition-all duration-500 h-full">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <v.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* ── Tech Stack ── */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <FadeIn>
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-12">
                            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">Technology</span>
                            <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mt-3 mb-8">
                                Built With Modern Stack
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {techStack.map((t, i) => (
                                    <motion.div
                                        key={t.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 cursor-default"
                                    >
                                        <t.icon className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm text-slate-300 font-medium">{t.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── CTA ── */}
                <section className="max-w-4xl mx-auto px-6 mb-16">
                    <FadeIn>
                        <div className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-400/20 rounded-3xl p-12 lg:p-16 text-center overflow-hidden">
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
                                    Ready to Secure Your Records?
                                </h2>
                                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                    Join hospitals and healthcare providers already using HealthChain for immutable, encrypted medical records.
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:shadow-neon-lg transition-all duration-300"
                                >
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                <Footer />
            </div>
        </div>
    );
}
