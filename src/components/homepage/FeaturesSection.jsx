import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    FileKey,
    History,
    Users,
    HardDrive,
    ClipboardList
} from 'lucide-react';

const features = [
    {
        icon: FileKey,
        title: 'Encrypted Records',
        description: 'AES-256 military-grade encryption ensures complete patient data privacy and protection against breaches.',
    },
    {
        icon: ShieldCheck,
        title: 'Instant Smart Contract Access',
        description: 'Grant or revoke doctor access in real-time via auditable, self-executing smart contracts.',
    },
    {
        icon: History,
        title: 'Immutable History',
        description: 'Every medical event is cryptographically hashed and permanently chained to the blockchain ledger.',
    },
    {
        icon: Users,
        title: 'Role-Based Access',
        description: 'Fine-grained permissions for patients, doctors, and admins with multi-signature verification.',
    },
    {
        icon: HardDrive,
        title: 'Decentralized Storage',
        description: 'Records distributed across IPFS nodes — no single point of failure, full data sovereignty.',
    },
    {
        icon: ClipboardList,
        title: 'Audit & Compliance Logs',
        description: 'Tamper-proof audit trails meeting HIPAA, GDPR, and healthcare regulatory compliance standards.',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

const FeaturesSection = () => {
    return (
        <section id="features" className="relative py-24 px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        Enterprise-Grade{' '}
                        <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                            Features
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Built for hospitals, clinics, and healthcare networks that demand
                        uncompromising security and compliance.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                whileHover={{
                                    y: -8,
                                    boxShadow: '0 0 30px rgba(0, 245, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.3)',
                                    borderColor: 'rgba(0, 245, 255, 0.4)',
                                }}
                                className="group relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all duration-500 cursor-default"
                            >
                                {/* Hover glow overlay */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-6 group-hover:shadow-neon-sm transition-shadow duration-500">
                                        <Icon className="w-7 h-7 text-neon-cyan" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
