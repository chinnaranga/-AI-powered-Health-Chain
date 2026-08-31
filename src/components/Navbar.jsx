import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, ChevronRight } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => setMobileOpen(false), [location]);

    const links = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/careers', label: 'Careers' },
        { to: '/login/patient', label: 'Login' },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <img src="/logo.svg" alt="HealthChain Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform" />
                    <span className="font-heading text-lg font-bold text-navy-900 tracking-wide">
                        Health<span className="text-sage-600">Chain</span>
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                (link.to.includes('/login') ? location.pathname.startsWith('/login') : location.pathname === link.to)
                                    ? 'text-sage-600 bg-sage-50'
                                    : 'text-slate-500 hover:text-navy-900 hover:bg-slate-50'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        to="/register"
                        className="ml-3 px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold hover:shadow-md transition-all duration-300 flex items-center gap-1.5"
                    >
                        Get Started <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-1">
                            {links.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === link.to
                                            ? 'text-sage-600 bg-sage-50'
                                            : 'text-slate-500 hover:text-navy-900 hover:bg-slate-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to="/register"
                                className="block text-center mt-3 px-5 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-semibold"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
