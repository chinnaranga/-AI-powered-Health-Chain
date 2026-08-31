import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Shield, Database, Lock, KeyRound, Eye, CheckCircle2,
  AlertTriangle, Copy, Check, ChevronRight, ArrowRight, Terminal,
  ExternalLink, Layers, Sparkles, Binary, Server, FileText
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function SmartContracts() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);
  const [activeContractTab, setActiveContractTab] = useState('solidity');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HealthChain Healthcare Registry
 * @notice Manages patient-controlled access policies and verifiable IPFS record hashes.
 * @dev Raw medical files are encrypted and stored off-chain. Only hashes and consent are on-chain.
 */
contract Healthcare {
    struct Record {
        uint256 id;
        string ipfsHash;
        uint256 timestamp;
        string description;
        address uploadedBy;
    }

    struct Access {
        address patient;
        address doctor;
        bool hasAccess;
    }

    // Mapping: Patient Address => Encrypted Record Hashes
    mapping(address => Record[]) public patientRecords;

    // Mapping: Patient Address => (Doctor Address => Access Boolean)
    mapping(address => mapping(address => bool)) public doctorAccess;

    // Events for real-time auditability
    event RecordAdded(uint256 id, address indexed patient, string ipfsHash);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    /**
     * @notice Commits an encrypted record reference to the patient's decentralized ledger.
     * @param _ipfsHash The SHA-256 / CID pointer to off-chain encrypted ciphertext.
     * @param _description Encrypted or masked metadata descriptor.
     */
    function addRecord(string memory _ipfsHash, string memory _description) public {
        uint256 recordId = patientRecords[msg.sender].length;
        patientRecords[msg.sender].push(Record(
            recordId,
            _ipfsHash,
            block.timestamp,
            _description,
            msg.sender
        ));
        emit RecordAdded(recordId, msg.sender, _ipfsHash);
    }

    /**
     * @notice Grants cryptographic reading authorization to a verified doctor address.
     * @param _doctor Verified Ethereum address of attending clinician.
     */
    function grantAccess(address _doctor) public {
        doctorAccess[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    /**
     * @notice Instantly revokes clinician access to all patient record references.
     * @param _doctor Verified Ethereum address of clinician to revoke.
     */
    function revokeAccess(address _doctor) public {
        doctorAccess[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    /**
     * @notice Retrieves record references for the caller if they are the patient or an authorized doctor.
     */
    function getPatientRecords(address _patient) public view returns (Record[] memory) {
        if (msg.sender == _patient || doctorAccess[_patient][msg.sender]) {
            return patientRecords[_patient];
        }
        revert("Access Denied");
    }

    /**
     * @notice Checks active authorization state between a patient and doctor.
     */
    function isDoctor(address _patient, address _doctor) public view returns (bool) {
        return doctorAccess[_patient][_doctor];
    }
}`;

  // 5-Stage Architecture Flow
  const architectureSteps = [
    {
      step: '01',
      title: 'Patient Record Generation',
      subtitle: 'Local Clinical Encounter',
      icon: FileText,
      desc: 'The clinical encounter notes, diagnostic findings, or prescriptions are synthesized on the practitioner workstation.'
    },
    {
      step: '02',
      title: 'Encrypted Off-Chain Storage',
      subtitle: 'Client-Side Encryption',
      icon: Lock,
      desc: 'The record is encrypted client-side using strong AES-GCM ciphers and persisted off-chain (Cloudflare R2 / IPFS clusters).'
    },
    {
      step: '03',
      title: 'Cryptographic Hash Reference',
      subtitle: 'SHA-256 Digest',
      icon: Binary,
      desc: 'A deterministic SHA-256 hash / IPFS CID pointer is calculated from the encrypted ciphertext, guaranteeing immutable proof.'
    },
    {
      step: '04',
      title: 'Blockchain Ledger Commitment',
      subtitle: 'Smart Contract Call',
      icon: Server,
      desc: 'The cryptographic hash and patient-governed access permissions are committed to the Healthcare smart contract ledger.'
    },
    {
      step: '05',
      title: 'Integrity Verification',
      subtitle: 'Mathematical Trust',
      icon: Shield,
      desc: 'Any authorized party can verify data authenticity by matching the decrypted payload hash with the on-chain seal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#E8F0FE] selection:text-[#2563EB] scroll-smooth">
      {/* Universal Navigation Header */}
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-[#ECECEC] bg-gradient-to-b from-[#F7F4EB]/70 via-white to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/5 border border-[#111111]/10 mb-6">
                <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  HealthChain Smart Contracts & Architecture
                </span>
              </div>

              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#111111] leading-[1.08] mb-6">
                Decentralized Ledger & <br />
                <span className="font-bold">Cryptographic Health Contracts</span>
              </h1>

              <p className="text-base sm:text-lg text-[#666666] leading-relaxed mb-6">
                Explore the underlying Solidity smart contracts and zero-knowledge consent architecture powering patient-governed medical records and verifiable auditability.
              </p>

              {/* Critical Privacy Warning Alert */}
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#B45309]">Fundamental Privacy Architecture:</strong> Raw medical records and unencrypted personal health data <span className="underline font-bold">are NEVER stored directly on a public blockchain</span>. All clinical data is encrypted client-side and persisted in off-chain distributed storage (IPFS/R2); only cryptographic hashes, timestamps, and access control policies are committed to the ledger.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5-STAGE ARCHITECTURE PIPELINE                                             */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#FAFAFA] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full border border-[#2563EB]/20">
                Off-Chain Storage & On-Chain Proof
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                The 5-Stage Ledger <span className="font-bold">Verification Architecture</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                How HealthChain guarantees patient privacy while delivering mathematical verification and non-repudiation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {architectureSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="p-6 rounded-2xl bg-white border border-[#ECECEC] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F7F4EB] text-[#111111] flex items-center justify-center font-bold">
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xl font-bold text-[#CCCCCC]">
                          {step.step}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">
                        {step.subtitle}
                      </p>
                      <h3 className="text-base font-bold text-[#111111] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[10px] font-mono text-[#888888]">
                      Phase {idx + 1} of 5
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* REAL SMART CONTRACT IMPLEMENTATION                                        */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#FFFFFF] border-b border-[#ECECEC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            <div className="max-w-3xl mb-12">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-full border border-[#16A34A]/20">
                Live Repository Implementation
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#111111] mt-4 mb-4">
                Healthcare.sol <span className="font-bold">Smart Contract</span>
              </h2>
              <p className="text-base sm:text-lg text-[#666666]">
                The actual Solidity contract implemented in <code className="px-2 py-0.5 rounded bg-[#F7F4EB] font-mono text-xs text-[#111111]">blockchain/contracts/Healthcare.sol</code> powering patient record hashing and doctor consent gates.
              </p>
            </div>

            {/* Code Block Container */}
            <div className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden shadow-xl">
              
              {/* Code Bar Header */}
              <div className="px-6 py-4 bg-[#1A1A1A] border-b border-[#2D2D2D] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  </div>
                  <span className="font-mono text-xs text-[#A3A3A3] pl-2">
                    contracts/Healthcare.sol
                  </span>
                  <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                    Solidity ^0.8.0
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(solidityCode, 'solidity-code')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === 'solidity-code' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'solidity-code' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code Content */}
              <pre className="p-6 md:p-8 font-mono text-xs md:text-sm text-[#E5E7EB] overflow-x-auto leading-relaxed max-h-[550px] overflow-y-auto">
                <code>{solidityCode}</code>
              </pre>

              {/* Code Summary Footer */}
              <div className="p-4 bg-[#161616] border-t border-[#2D2D2D] grid sm:grid-cols-3 gap-4 text-xs font-mono text-[#888888]">
                <div>
                  <span className="text-[#A3A3A3]">Events:</span> RecordAdded, AccessGranted, AccessRevoked
                </div>
                <div>
                  <span className="text-[#A3A3A3]">State:</span> patientRecords, doctorAccess
                </div>
                <div>
                  <span className="text-[#A3A3A3]">Functions:</span> addRecord, grantAccess, revokeAccess
                </div>
              </div>

            </div>

            {/* Development Environment Note */}
            <div className="mt-8 p-6 rounded-2xl bg-[#FAFAFA] border border-[#ECECEC] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111111]">Local Hardhat & Testnet Environment</h4>
                  <p className="text-xs text-[#666666]">Contracts can be deployed locally using <code className="font-mono bg-[#EAEAEA] px-1.5 py-0.5 rounded">npx hardhat run blockchain/scripts/deploy.cjs</code>. Default development address: <code className="font-mono text-[#2563EB]">0x5FbDB...aa3</code>.</p>
                </div>
              </div>
              <a
                href="https://github.com/chinnaranga/-AI-powered-Health-Chain"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (CTA)                                               */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#F7F4EB] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111] bg-white px-4 py-1.5 rounded-full border border-[#ECECEC] shadow-sm">
              Developer Ecosystem
            </span>

            <h2 className="font-sans text-4xl sm:text-5xl font-normal tracking-tight text-[#111111] mt-6 mb-6 leading-[1.1]">
              Explore the Open-Source <br />
              <span className="font-bold">HealthChain Repository</span>
            </h2>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-xl mx-auto mb-10">
              Review Hardhat scripts, integration tests, and smart contracts directly on GitHub.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <a
                href="https://github.com/chinnaranga/-AI-powered-Health-Chain"
                target="_blank"
                rel="noreferrer"
                className="px-9 py-4 rounded-xl bg-[#111111] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => navigate('/developers/api')}
                className="px-9 py-4 rounded-xl bg-white text-[#111111] font-sans text-xs font-bold uppercase tracking-widest border border-[#ECECEC] hover:border-[#111111] hover:bg-[#111111]/5 transition-all duration-200 cursor-pointer"
              >
                View REST APIs
              </button>
            </div>

            <p className="mt-8 text-xs text-[#888888]">
              MIT License • Verifiable Cryptographic Ledger • Off-Chain Data Protection
            </p>
          </div>
        </section>
      </main>

      {/* Universal Footer with Legal Modals & Newsletter */}
      <Footer />
    </div>
  );
}
