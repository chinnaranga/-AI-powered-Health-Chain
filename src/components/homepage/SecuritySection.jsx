import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, CheckCircle, Fingerprint } from 'lucide-react';

const badges = [
    { icon: Lock, label: 'AES-256', description: 'Encryption' },
    { icon: Fingerprint, label: 'SHA-256', description: 'Hashing' },
    { icon: Shield, label: 'RSA-2048', description: 'Key Exchange' },
    { icon: Eye, label: 'Zero-Knowledge', description: 'Proofs' },
];

const SecuritySection = () => {
    return (
        <section className="relative py-24 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                            Security &{' '}
                            <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                                Compliance
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            Every record is encrypted at-rest and in-transit using military-grade
                            cryptography. Blockchain validation ensures no record can be altered,
                            deleted, or accessed without proper authorization — providing a
                            tamper-proof chain of custody.
                        </p>

                        <div className="space-y-4">
                            {[
                                'End-to-end AES-256 encryption for all patient data',
                                'Multi-signature verification for access control changes',
                                'HIPAA & GDPR compliant audit trail logging',
                                'Decentralized key management with threshold signatures',
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Badges Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {badges.map((badge, i) => {
                            const Icon = badge.icon;
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05, borderColor: 'rgba(0, 245, 255, 0.4)' }}
                                    className="group p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] text-center transition-all duration-300 hover:shadow-neon-sm"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-4 group-hover:shadow-neon-sm transition-shadow duration-500">
                                        <Icon className="w-8 h-8 text-neon-cyan" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">{badge.label}</h3>
                                    <p className="text-gray-500 text-sm">{badge.description}</p>
                                </motion.div>
                            );
                        })}

                        {/* Blockchain Node Visualization */}
                        <motion.div
                            whileHover={{ scale: 1.02, borderColor: 'rgba(0, 245, 255, 0.3)' }}
                            className="col-span-2 p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Server className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Blockchain Validation</h3>
                                    <p className="text-gray-500 text-sm">
                                        Every transaction verified by distributed consensus across network nodes
                                    </p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {[...Array(5)].map((_, j) => (
                                        <motion.div
                                            key={j}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1.5, delay: j * 0.2, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-emerald-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default SecuritySection;
