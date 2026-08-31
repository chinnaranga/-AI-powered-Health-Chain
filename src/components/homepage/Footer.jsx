import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Globe, FileText, Mail, ExternalLink } from 'lucide-react';
import { PrivacyPolicyModal, TermsOfServiceModal, CookieSettingsModal } from '../common/LegalModals';

export default function Footer() {
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isCookiesOpen, setIsCookiesOpen] = useState(false);

    return (
        <>
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
                                    href="https://github.com/chinnaranga/-AI-powered-Health-Chain"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>

                                <Link
                                    to="/book-demo"
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                                >
                                    <Mail className="w-4 h-4" />
                                </Link>

                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                                Product
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link to="/patient-app" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        Patient App
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/doctor-portal" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        Doctor Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/HospitalERP" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        Hospital ERP
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/book-demo" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        Book a Demo
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Developers */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                                Developers
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <a href="https://github.com/chinnaranga/-AI-powered-Health-Chain#readme" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                        Documentation <FileText className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/chinnaranga/-AI-powered-Health-Chain" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                                        GitHub Repository <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                                <li>
                                    <Link to="/admin/api-logs" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        API Reference
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company & Legal */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                                Company & Legal
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link to="/about" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/careers" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivacyOpen(true)}
                                        className="text-sm text-slate-500 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsTermsOpen(true)}
                                        className="text-sm text-slate-500 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setIsCookiesOpen(true)}
                                        className="text-sm text-slate-500 hover:text-cyan-400 transition-colors text-left cursor-pointer"
                                    >
                                        Cookie Settings
                                    </button>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom */}
                    <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">

                        <p className="text-xs text-slate-600">
                            © 2026 HealthChain. All rights reserved. Registered under HIPAA, GDPR, & ABDM guidelines.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            All systems operational
                        </div>

                    </div>

                </div>
            </footer>

            {/* Interactive Modals */}
            <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
            <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            <CookieSettingsModal isOpen={isCookiesOpen} onClose={() => setIsCookiesOpen(false)} />
        </>
    );
}