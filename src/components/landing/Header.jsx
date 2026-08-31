import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Solutions', href: '/#solutions' },
    { name: 'Hospitals', href: '/hospital/landing' },
    { name: 'Doctors', href: '/doctor-portal' },
    { name: 'Patients', href: '/patient-app' },
    { name: 'Developers', href: '/#developers' },
    { name: 'Security', href: '/#security' },
    { name: 'Resources', href: '/#resources' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#ECECEC] shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => {
            if (window.location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
        >
          <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Shield className="w-4.5 h-4.5 text-[#F7F4EB]" />
          </div>
          <span className="font-sans text-xl font-bold tracking-tight text-[#111111]">
            HealthChain
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-medium uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors duration-200 px-4 py-2 border border-transparent rounded hover:border-[#ECECEC] bg-transparent cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
            className="text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors duration-200 px-4 py-2 border border-transparent rounded hover:border-[#ECECEC] bg-transparent cursor-pointer"
          >
            Register
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate('/book-demo');
            }}
            className="px-6 py-2.5 rounded bg-[#111111] text-[#FFFFFF] font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#000000] transition-colors duration-200 shadow-sm border border-transparent cursor-pointer"
          >
            Book a Demo
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-[#111111] hover:text-[#666666] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu container */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-[#FFFFFF] border-b border-[#ECECEC] shadow-lg max-h-[85vh] overflow-y-auto"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-[#666666] hover:text-[#111111] transition-colors duration-200 py-2 border-b border-[#F3F3F3] last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-[#111111] border border-[#111111] rounded hover:bg-[#F7F4EB] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-[#111111] border border-[#111111] rounded hover:bg-[#F7F4EB] transition-colors"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/book-demo');
                  }}
                  className="w-full text-center py-3 bg-[#111111] hover:bg-[#000000] text-[#FFFFFF] text-xs font-bold uppercase tracking-widest rounded transition-colors"
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
