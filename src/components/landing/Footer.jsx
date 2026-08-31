import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
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
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Patient App</a></li>
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Doctor Portal</a></li>
              <li><Link to="/HospitalERP" className="hover:text-[#111111] transition-colors">Hospital ERP</Link></li>
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Lab Gateway</a></li>
            </ul>
          </div>

          {/* Links Column 2: Solutions */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Solutions</h4>
            <ul className="space-y-4 text-xs font-semibold text-[#666666]">
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Hospitals</a></li>
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Clinics</a></li>
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Laboratories</a></li>
              <li><a href="/#solutions" className="hover:text-[#111111] transition-colors">Insurers</a></li>
            </ul>
          </div>

          {/* Links Column 3: Developers */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Developers</h4>
            <ul className="space-y-4 text-xs font-semibold text-[#666666]">
              <li><a href="/#developers" className="hover:text-[#111111] transition-colors">API Reference</a></li>
              <li><a href="/#developers" className="hover:text-[#111111] transition-colors">Smart Contracts</a></li>
              <li><a href="/#developers" className="hover:text-[#111111] transition-colors">Documentation</a></li>
              <li><a href="/#developers" className="hover:text-[#111111] transition-colors">GitHub Node</a></li>
            </ul>
          </div>

          {/* Links Column 4: Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-6">Company</h4>
            <ul className="space-y-4 text-xs font-semibold text-[#666666]">
              <li><Link to="/about" className="hover:text-[#111111] transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-[#111111] transition-colors">Careers</Link></li>
              <li><a href="/#security" className="hover:text-[#111111] transition-colors">Security</a></li>
              <li><a href="/#pricing" className="hover:text-[#111111] transition-colors">Pricing</a></li>
            </ul>
          </div>

        </div>

        {/* Newsletter Signup & Status */}
        <div className="border-t border-[#ECECEC] pt-12 grid md:grid-cols-2 gap-8 items-center">
          
          {/* Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#ECECEC] text-[10px] font-mono text-[#666666]">
              <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full inline-block animate-pulse" />
              <span>All Node Networks Operational</span>
            </div>
            <div className="flex gap-4 text-xs text-[#666666] font-medium">
              <a href="#" className="hover:text-[#111111]">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-[#111111]">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-[#111111]">Cookie Settings</a>
            </div>
          </div>

          {/* Newsletter Input */}
          <div className="flex flex-col items-start md:items-end">
            <div className="w-full max-w-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-3">Newsletter</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-2 text-xs border border-[#ECECEC] rounded bg-[#E8F0FE] text-[#111111] focus:outline-none focus:border-[#666666]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
                >
                  Subscribe
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
  );
}