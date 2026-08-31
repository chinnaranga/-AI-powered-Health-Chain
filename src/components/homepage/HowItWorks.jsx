import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Lock, Database } from 'lucide-react';

const steps = [
    {
        icon: Upload,
        number: '01',
        title: 'Upload Record',
        description: 'Patient or doctor uploads the medical record through our secure portal interface.',
    },
    {
        icon: Lock,
        number: '02',
        title: 'Encrypt & Hash',
        description: 'Data is encrypted with AES-256 and a SHA-256 hash is generated for integrity verification.',
    },
    {
        icon: Database,
        number: '03',
        title: 'Store on Blockchain',
        description: 'Encrypted record stored on IPFS; hash and metadata anchored permanently on blockchain.',
    },
];

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="relative py-24 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        How It{' '}
                        <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Three simple steps to secure your medical records on the blockchain forever.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-0">
                    {/* Connecting Line (desktop) */}
                    <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-neon-cyan/40 via-neon-blue/40 to-neon-cyan/40" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="flex-1 flex flex-col items-center text-center px-6"
                            >
                                {/* Step Circle */}
                                <motion.div
                                    whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(0, 245, 255, 0.4)' }}
                                    className="relative w-32 h-32 rounded-full bg-navy-800/80 backdrop-blur-md border-2 border-neon-cyan/30 flex items-center justify-center mb-8 shadow-neon-sm"
                                >
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-neon-cyan text-navy-900 font-bold text-sm flex items-center justify-center shadow-neon">
                                        {step.number}
                                    </div>
                                    <Icon className="w-12 h-12 text-neon-cyan" />
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                    {step.description}
                                </p>

                                {/* Arrow for mobile */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden my-4 text-neon-cyan/40 text-2xl">↓</div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
