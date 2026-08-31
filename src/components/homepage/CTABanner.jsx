import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTABanner = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-24 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative rounded-3xl overflow-hidden"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 via-neon-blue/30 to-neon-purple/20" />
                    <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" />

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-neon-cyan/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-neon-blue/10 blur-3xl" />

                    <div className="relative z-10 py-16 px-8 md:px-16 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="font-display text-3xl md:text-5xl font-bold text-white mb-6"
                        >
                            Ready to Secure Your
                            <br />
                            <span className="bg-gradient-to-r from-neon-cyan to-white bg-clip-text text-transparent">
                                Healthcare Data?
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-gray-300 text-lg max-w-2xl mx-auto mb-10"
                        >
                            Join the growing network of hospitals and clinics that trust HealthChain
                            for their most sensitive data. Get started in minutes.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0, 245, 255, 0.5)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/register')}
                                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-neon-cyan text-navy-900 font-bold text-lg shadow-neon hover:shadow-neon-lg transition-all duration-300"
                            >
                                Register Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/about')}
                                className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                            >
                                Learn More
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTABanner;
