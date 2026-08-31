import { Link } from 'react-router-dom';
import { Shield, Globe, FileText, Mail, ExternalLink } from 'lucide-react';

const footerLinks = [
    {
        title: 'Product',
        links: [
            { label: 'Features', to: '/#features' },
            { label: 'Security', to: '/#security' },
            { label: 'Pricing', to: '#' },
            { label: 'Roadmap', to: '#' },
        ],
    },
    {
        title: 'Developers',
        links: [
            { label: 'Documentation', to: '#', icon: FileText },
            { label: 'Website', to: '#', icon: Globe },
            { label: 'API Reference', to: '#' },
            { label: 'Smart Contracts', to: '#' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', to: '/about' },
            { label: 'Careers', to: '/careers' },
            { label: 'Contact', to: '#', icon: Mail },
            { label: 'Privacy Policy', to: '#' },
            { label: 'Terms of Service', to: '#' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-navy-950/50">

            {/* Gradient divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">

                        <Link
                            to="/"
                            className="flex items-center gap-2.5 mb-4"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                            </div>

                            <span className="font-display text-lg font-bold text-white">
                                Health
                                <span className="text-cyan-400">
                                    Chain
                                </span>
                            </span>
                        </Link>

                        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                            Decentralized healthcare records secured by blockchain
                            technology. HIPAA-compliant, AES-256 encrypted.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 mt-5">

                            <a
                                href="#"
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                            >
                                <Globe className="w-4 h-4" />
                            </a>

                            <a
                                href="#"
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                            >
                                <Mail className="w-4 h-4" />
                            </a>

                        </div>
                    </div>

                    {/* Link Columns */}
                    {footerLinks.map(section => (
                        <div key={section.title}>

                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                                {section.title}
                            </h4>

                            <ul className="space-y-2.5">

                                {section.links.map(link => (
                                    <li key={link.label}>

                                        <Link
                                            to={link.to}
                                            className="text-sm text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                                        >
                                            {link.label}

                                            {link.icon && (
                                                <link.icon className="w-3 h-3" />
                                            )}
                                        </Link>

                                    </li>
                                ))}

                            </ul>
                        </div>
                    ))}

                </div>

                {/* Bottom */}
                <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">

                    <p className="text-xs text-slate-600">
                        © 2026 HealthChain. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                        All systems operational
                    </div>

                </div>

            </div>
        </footer>
    );
}