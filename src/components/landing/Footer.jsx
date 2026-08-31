import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Check, Loader2, Mail } from 'lucide-react';
import { PrivacyPolicyModal, TermsOfServiceModal, CookieSettingsModal } from '../common/LegalModals';

export default function Footer() {
  // Modal states
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);

  // Newsletter states
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null); // 'success' | 'error'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubscribeStatus('invalid');
      setTimeout(() => setSubscribeStatus(null), 3000);
      return;
    }

    setSubscribing(true);
    setSubscribeStatus(null);

    // Simulate subscription process
    setTimeout(() => {
      setSubscribing(false);
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(null), 5000);
    }, 1000);
  };

  return (
    <>
      <footer className="bg-[#F7F4EB] text-[#111111] py-16 border-t border-[#ECECEC] font-sans">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
            
            {/* Logo & Info */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-[#111111] flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold tracking-tight uppercase">HealthChain</span>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed mb-6 max-w-xs">
                Enterprise-grade ledger systems for decentralized, patient-controlled health records. Secure your history on-chain.
              </p>
            </div>

            {/* Links Column 1: Products */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Products</h4>
              <ul className="space-y-4 text-xs font-semibold text-[#666666]">
                <li><Link to="/patient-app" className="hover:text-[#111111] transition-colors">Patient App</Link></li>
                <li><Link to="/doctor-portal" className="hover:text-[#111111] transition-colors">Doctor Portal</Link></li>
                <li><Link to="/HospitalERP" className="hover:text-[#111111] transition-colors">Hospital ERP</Link></li>
                <li><Link to="/lab-gateway" className="hover:text-[#111111] transition-colors">Lab Gateway</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Solutions */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Solutions</h4>
              <ul className="space-y-4 text-xs font-semibold text-[#666666]">
                <li><Link to="/solutions/hospitals" className="hover:text-[#111111] transition-colors">Hospitals</Link></li>
                <li><Link to="/clinical/workspace" className="hover:text-[#111111] transition-colors">Clinics</Link></li>
                <li><Link to="/patient/lab-imaging" className="hover:text-[#111111] transition-colors">Laboratories</Link></li>
                <li><Link to="/patient/insurance" className="hover:text-[#111111] transition-colors">Insurers</Link></li>
              </ul>
            </div>

            {/* Links Column 3: Developers */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Developers</h4>
              <ul className="space-y-4 text-xs font-semibold text-[#666666]">
                <li><Link to="/admin/api-logs" className="hover:text-[#111111] transition-colors">API Reference</Link></li>
                <li><a href="https://github.com/chinnaranga/-AI-powered-Health-Chain" target="_blank" rel="noreferrer" className="hover:text-[#111111] transition-colors">Smart Contracts</a></li>
                <li><a href="https://github.com/chinnaranga/-AI-powered-Health-Chain#readme" target="_blank" rel="noreferrer" className="hover:text-[#111111] transition-colors">Documentation</a></li>
                <li><a href="https://github.com/chinnaranga/-AI-powered-Health-Chain" target="_blank" rel="noreferrer" className="hover:text-[#111111] transition-colors">GitHub Node</a></li>
              </ul>
            </div>

            {/* Links Column 4: Company */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Company</h4>
              <ul className="space-y-4 text-xs font-semibold text-[#666666]">
                <li><Link to="/about" className="hover:text-[#111111] transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-[#111111] transition-colors">Careers</Link></li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-[#111111] transition-colors text-left"
                  >
                    Security & Privacy
                  </button>
                </li>
                <li><Link to="/book-demo" className="hover:text-[#111111] transition-colors">Pricing & Demo</Link></li>
              </ul>
            </div>

          </div>

          {/* Newsletter Signup & Status */}
          <div className="border-t border-[#ECECEC] pt-12 grid md:grid-cols-2 gap-8 items-center">
            
            {/* Status Badge & Legal Links */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#ECECEC] text-[10px] font-mono text-[#666666]">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full inline-block animate-pulse" />
                <span>All Node Networks Operational</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#666666] font-medium">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="hover:text-[#111111] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-[#111111] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsCookiesOpen(true)}
                  className="hover:text-[#111111] transition-colors cursor-pointer"
                >
                  Cookie Settings
                </button>
              </div>
            </div>

            {/* Newsletter Input */}
            <div className="flex flex-col items-start md:items-end">
              <div className="w-full max-w-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-3 flex items-center justify-between">
                  <span>Newsletter</span>
                  {subscribeStatus === 'success' && (
                    <span className="text-[#16A34A] font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Subscribed successfully!
                    </span>
                  )}
                  {subscribeStatus === 'invalid' && (
                    <span className="text-[#DC2626] font-bold text-[10px]">
                      Please enter a valid email
                    </span>
                  )}
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 text-xs border border-[#ECECEC] rounded bg-white text-[#111111] focus:outline-none focus:border-[#666666] focus:ring-1 focus:ring-[#111111]"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-5 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-[#ECECEC] mt-12 pt-8 text-center text-[10px] text-[#666666]">
            &copy; {new Date().getFullYear()} HealthChain. All rights reserved. Registered compliances under HIPAA, GDPR, & ABDM guidelines.
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