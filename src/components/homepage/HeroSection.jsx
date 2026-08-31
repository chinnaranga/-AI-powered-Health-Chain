import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Lock } from 'lucide-react';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section id="hero" className="relative min-h-screen flex items-center px-6 lg:px-20 pt-24 pb-16 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                        <span className="text-neon-cyan text-sm font-medium tracking-wide">Blockchain-Powered Healthcare</span>
                    </motion.div>

                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                        <span className="text-white">Secure Healthcare</span>
                        <br />
                        <span className="bg-gradient-to-r from-neon-cyan via-blue-400 to-neon-blue bg-clip-text text-transparent animate-glow">
                            on Blockchain
                        </span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
                        Decentralized, immutable, and patient-centric medical records.
                        Experience next-generation healthcare data management with
                        AES-256 encryption and smart contract access controls.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 245, 255, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/register')}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-navy-900 font-bold text-lg shadow-neon transition-all duration-300 hover:shadow-neon-lg"
                        >
                            Get Started
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/login/patient')}
                            className="px-8 py-4 rounded-xl border border-neon-cyan/30 bg-white/5 backdrop-blur-md text-neon-cyan font-semibold text-lg hover:bg-white/10 hover:border-neon-cyan/50 transition-all duration-300"
                        >
                            Access Portal
                        </motion.button>
                    </div>
                </motion.div>

                {/* Right: Animated Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    className="relative flex items-center justify-center"
                >
                    <div className="relative w-80 h-80 md:w-96 md:h-96">
                        {/* Outer Glow Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-neon-cyan/20"
                        />

                        {/* Middle Ring */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-8 rounded-full border border-neon-blue/20"
                        />

                        {/* Inner Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-16 rounded-full border border-neon-cyan/30"
                        />

                        {/* Central Shield */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10 backdrop-blur-xl border border-neon-cyan/30 flex items-center justify-center shadow-neon">
                                <Shield className="w-16 h-16 text-neon-cyan" />
                            </div>
                        </motion.div>

                        {/* Floating Orbit Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0"
                        >
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-navy-700/80 backdrop-blur border border-neon-cyan/30 flex items-center justify-center shadow-neon-sm">
                                <Activity className="w-5 h-5 text-neon-cyan" />
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0"
                        >
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-navy-700/80 backdrop-blur border border-neon-cyan/30 flex items-center justify-center shadow-neon-sm">
                                <Lock className="w-5 h-5 text-neon-cyan" />
                            </div>
                        </motion.div>

                        {/* Pulse overlay */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.05, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 rounded-full bg-neon-cyan/5"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
