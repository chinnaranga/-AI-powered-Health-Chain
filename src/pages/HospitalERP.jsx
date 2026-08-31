import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, UserRound, Building2, Eye,
  FileHeart, ClipboardList, ShieldAlert, BadgeInfo, Stethoscope, BriefcaseMedical,
  Activity, Pill, TestTube, Image, Scissors, ArrowDownToLine, ShieldCheck,
  TrendingUp, FileSpreadsheet, KeyRound, Wrench, Siren, LogOut, Search,
  Plus, Check, X, SlidersHorizontal, Settings, RefreshCw, Send, Sparkles, Navigation
} from 'lucide-react';

export default function HospitalERP() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'dashboard';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states for demo workflows
  const [patients, setPatients] = useState([
    { id: '1', name: 'Sarah Jenkins', abha: '91-8294-8291', age: 34, blood: 'O-Negative', status: 'Admitted (IPD)', room: 'Room 204', doctor: 'Dr. Amanda Ross', admissionDate: '2026-06-25', allergies: 'Penicillin, Latex', emergencyContact: 'Robert Jenkins (+91-98765-43210)', insurer: 'Star Health Insurance', policy: 'POL-JENK-90' },
    { id: '2', name: 'Michael Chen', abha: '91-0394-8832', age: 8, blood: 'A-Positive', status: 'OPD Queue', room: 'Room 104', doctor: 'Dr. Marcus Vance', admissionDate: '2026-06-28', allergies: 'Peanuts', emergencyContact: 'Li Chen (+91-99887-76655)', insurer: 'Max Bupa Health', policy: 'POL-CHEN-22' },
    { id: '3', name: 'Aditya Verma', abha: '91-4921-0094', age: 62, blood: 'B-Positive', status: 'Emergency', room: 'ICU-B', doctor: 'Dr. Sarah Jenkins', admissionDate: '2026-06-28', allergies: 'None', emergencyContact: 'Priya Verma (+91-90001-23456)', insurer: 'HDFC Ergo', policy: 'POL-VERM-11' },
    { id: '4', name: 'Zoya Khan', abha: '91-5829-1149', age: 29, blood: 'AB-Negative', status: 'Discharged', room: 'Outpatient', doctor: 'Dr. Amanda Ross', admissionDate: '2026-06-20', allergies: 'Sulfonamides', emergencyContact: 'Farhan Khan (+91-91112-22333)', insurer: 'ICICI Lombard', policy: 'POL-ZOYA-05' }
  ]);

  const [doctors, setDoctors] = useState([
    { id: '1', name: 'Dr. Amanda Ross', specialty: 'General Medicine', status: 'On Duty', queue: 4, email: 'amanda.ross@healthchain.in', sig: '0x8a92...e304', activeConsult: 'Sarah Jenkins' },
    { id: '2', name: 'Dr. Marcus Vance', specialty: 'Pediatrics', status: 'On Duty', queue: 2, email: 'marcus.vance@healthchain.in', sig: '0x3f1a...4bc2', activeConsult: 'Michael Chen' },
    { id: '3', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', status: 'On Call', queue: 1, email: 'sarah.jenkins@healthchain.in', sig: '0x992c...881f', activeConsult: 'Aditya Verma' },
    { id: '4', name: 'Dr. Rajiv Mehta', specialty: 'Neurology', status: 'Leave', queue: 0, email: 'rajiv.mehta@healthchain.in', sig: '0x221b...809d', activeConsult: 'None' }
  ]);

  const [appointments, setAppointments] = useState([
    { time: '09:00 AM', patient: 'Sarah Jenkins', doctor: 'Dr. Amanda Ross', type: 'IPD Consultation', status: 'Completed' },
    { time: '10:30 AM', patient: 'Michael Chen', doctor: 'Dr. Marcus Vance', type: 'Pediatric General Checkup', status: 'Active' },
    { time: '11:15 AM', patient: 'Aditya Verma', doctor: 'Dr. Sarah Jenkins', type: 'Emergency ECG Review', status: 'Pending' },
    { time: '01:00 PM', patient: 'Priya Sharma', doctor: 'Dr. Rajiv Mehta', type: 'Neurological Follow-up', status: 'Scheduled' }
  ]);

  const [labSamples, setLabSamples] = useState([
    { code: 'SMP-8902', patient: 'Sarah Jenkins', test: 'Complete Blood Count', status: 'Completed', block: '#108,495', result: 'WBC normal (7.2k/mcL)' },
    { code: 'SMP-4102', patient: 'Aditya Verma', test: 'Cardiac Troponin T', status: 'Processing', block: 'Pending Sign-off', result: 'Awaiting lab machine' },
    { code: 'SMP-9022', patient: 'Michael Chen', test: 'Pediatric Allergy Panel', status: 'Collected', block: 'Awaiting Collection', result: 'Samples sealed in vial' }
  ]);

  const [pharmacyStock, setPharmacyStock] = useState([
    { code: 'MED-1082', name: 'Amoxicillin 500mg', category: 'Antibiotics', qty: 1250, exp: '2027-12', status: 'Optimal' },
    { code: 'MED-9021', name: 'Albuterol Inhaler', category: 'Respiratory', qty: 140, exp: '2026-08', status: 'Low Stock' },
    { code: 'MED-4810', name: 'Insulin Glargine', category: 'Diabetes', qty: 900, exp: '2027-02', status: 'Optimal' },
    { code: 'MED-3001', name: 'Paracetamol 650mg', category: 'Analgesics', qty: 45, exp: '2026-07', status: 'Critical' }
  ]);

  const [radiologyRecords, setRadiologyRecords] = useState([
    { id: 'RAD-901', patient: 'Sarah Jenkins', type: 'Chest X-Ray', date: '2026-06-25', notes: 'Clear lung fields. No pleural effusion.' },
    { id: 'RAD-482', patient: 'Aditya Verma', type: 'Brain CT Scan', date: '2026-06-28', notes: 'No evidence of acute hemorrhage or infarction.' }
  ]);

  const [claims, setClaims] = useState([
    { id: 'CLAIM-4091', patient: 'Sarah Jenkins', insurer: 'Star Health Insurance', amount: '₹84,000', status: 'Approved (Auto-settled)', check: 'Contract Match 100%' },
    { id: 'CLAIM-8831', patient: 'Aditya Verma', insurer: 'HDFC Ergo', amount: '₹1,20,000', status: 'Pending Verification', check: 'Awaiting Medical Signatures' }
  ]);

  const [blockchainBlocks, setBlockchainBlocks] = useState([
    { height: 108495, hash: '0x8a92...e304', tx: 4, timestamp: '12 seconds ago', miner: 'Apex Node #4' },
    { height: 108494, hash: '0x3f1a...4bc2', tx: 8, timestamp: '2 minutes ago', miner: 'St. Jude Node #1' },
    { height: 108493, hash: '0x992c...881f', tx: 3, timestamp: '5 minutes ago', miner: 'Care Node #18' }
  ]);

  const [aiSuggestions, setAiSuggestions] = useState([
    'Warning: Paracetamol 650mg is under critical stock threshold (45 units left). Auto-generated draft purchase order created.',
    'ICD-10 Code Recommendation: For patient Aditya Verma, assign code I21.9 (Acute myocardial infarction, unspecified).',
    'Consensus Alert: Blockchain signature match verified for Doctor Amanda Ross on Prescription #RX-40922.'
  ]);

  const [newPatient, setNewPatient] = useState({
    name: '', abha: '', age: '', blood: 'O-Positive', doctor: 'Dr. Amanda Ross', allergies: '', emergencyContact: '', insurer: '', policy: ''
  });

  const handleCreatePatient = (e) => {
    e.preventDefault();
    const created = {
      id: String(patients.length + 1),
      ...newPatient,
      status: 'OPD Queue',
      room: 'Triage Room 1',
      admissionDate: new Date().toISOString().split('T')[0]
    };
    setPatients([...patients, created]);
    setNewPatient({ name: '', abha: '', age: '', blood: 'O-Positive', doctor: 'Dr. Amanda Ross', allergies: '', emergencyContact: '', insurer: '', policy: '' });
  };

  const handleBlockchainDecrypt = (patient) => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      alert(`Patient Wallet Decrypted Successfully!\nVerification Hash: SHA-256 (0x3aef...10c2)\nConsent Checked: Access granted for 2 hours.`);
    }, 1500);
  };

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', name: 'Patient Management', icon: Users },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'doctors', name: 'Doctors', icon: UserRound },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'clinical-portal', name: 'Clinical Portal', icon: Stethoscope },
    { id: 'emr', name: 'Electronic Medical Records (EMR)', icon: FileHeart },
    { id: 'pharmacy', name: 'Pharmacy', icon: Pill },
    { id: 'laboratory', name: 'Laboratory', icon: TestTube },
    { id: 'radiology', name: 'Radiology', icon: Image },
    { id: 'ot', name: 'Operation Theatre', icon: Scissors },
    { id: 'billing', name: 'Billing', icon: FileSpreadsheet },
    { id: 'insurance', name: 'Insurance', icon: ShieldCheck },
    { id: 'inventory', name: 'Inventory', icon: BriefcaseMedical },
    { id: 'bloodbank', name: 'Blood Bank', icon: Activity },
    { id: 'ambulance', name: 'Ambulance', icon: Siren },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles },
    { id: 'blockchain', name: 'Blockchain Records', icon: KeyRound },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans flex overflow-hidden">
      
      {/* ───── COLLAPSIBLE SIDEBAR ───── */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-[#F7F4EB] border-r border-[#ECECEC] flex flex-col justify-between transition-all duration-300 relative z-20`}
      >
        <div>
          {/* Logo Brand Frame */}
          <div className="p-4 border-b border-[#ECECEC] flex items-center justify-between">
            {isSidebarOpen ? (
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#111111]">
                HealthChain <span className="font-normal text-[#666666]">ERP</span>
              </span>
            ) : (
              <span className="font-sans font-bold text-xs text-[#111111]">HC</span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-[#666666] hover:text-[#111111] transition-colors p-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[80vh]">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTabParam === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSearchParams({ tab: item.id })}
                  className={`w-full flex items-center gap-3 p-2.5 rounded text-left transition-colors text-xs ${
                    isActive
                      ? 'bg-white text-[#111111] border border-[#ECECEC] font-bold shadow-sm'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#ECECEC] bg-white/20">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 p-2 rounded text-left text-xs text-[#DC2626] hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="font-bold">Exit Console</span>}
          </button>
        </div>
      </aside>

      {/* ───── MAIN CONTENT WRAPPER ───── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* ───── HEADER PANEL ───── */}
        <header className="sticky top-0 bg-white border-b border-[#ECECEC] z-10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Consensus Block Height:
            </span>
            <span className="font-mono text-[10px] bg-[#E8F0FE] text-[#2563EB] px-2 py-0.5 rounded font-bold">
              #108,495
            </span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[9px] text-[#666666] font-mono">18 Nodes online | ABDM active</span>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Global Database Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#ECECEC] bg-[#E8F0FE] text-xs text-[#111111] rounded focus:outline-none focus:border-[#666666]"
              />
            </div>
            
            <div className="flex items-center gap-2 border-l border-[#ECECEC] pl-4 shrink-0">
              <span className="text-[11px] font-bold">St. Jude Medical Admin</span>
            </div>
          </div>
        </header>

        {/* ───── WORKSPACE CONTENT PANEL ───── */}
        <div className="p-6 md:p-8 flex-1 min-w-0">
          
          {/* TAB 1: DASHBOARD */}
          {activeTabParam === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">St. Jude ERP Dashboard</h2>
                  <p className="text-xs text-[#666666] mt-1">Real-time clinical, operational, and database synchronizers.</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Today's Patients</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">104</p>
                  <p className="text-[9px] text-[#16A34A] mt-2 font-bold">↑ 8% from yesterday</p>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Emergency Admissions</p>
                  <p className="text-2xl font-bold mt-1 text-[#DC2626]">12</p>
                  <p className="text-[9px] text-[#DC2626] mt-2 font-bold">Requires attention</p>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Available IPD Beds</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">18 / 120</p>
                  <p className="text-[9px] text-[#D97706] mt-2 font-bold">85% Occupancy rate</p>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Lab reports pending</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">41</p>
                  <p className="text-[9px] text-[#2563EB] mt-2 font-bold">12 Awaiting sign-off</p>
                </div>
              </div>

              {/* Central tables & Alerts */}
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Active Alerts */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111]">System Alerts Index</h3>
                  <div className="space-y-3">
                    <div className="p-3.5 bg-red-50 text-[#DC2626] border border-red-200/50 rounded text-xs leading-relaxed">
                      <span className="font-bold uppercase tracking-wider block mb-1 text-[9px]">Blood Bank Warning</span>
                      O-Negative reserves are critical (2 units remaining). Auto-order dispatched.
                    </div>
                    <div className="p-3.5 bg-amber-50 text-[#D97706] border border-amber-200/50 rounded text-xs leading-relaxed">
                      <span className="font-bold uppercase tracking-wider block mb-1 text-[9px]">Inventory Alert</span>
                      Albuterol Inhaler (MED-9021) is below optimal safety bounds.
                    </div>
                    <div className="p-3.5 bg-emerald-50 text-[#16A34A] border border-emerald-200/50 rounded text-xs leading-relaxed">
                      <span className="font-bold uppercase tracking-wider block mb-1 text-[9px]">Consensus Sync Log</span>
                      Vite server running cleanly. SHA-256 verified block #108,495.
                    </div>
                  </div>
                </div>

                {/* Patient Queue Table */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111]">Active Patient Queue</h3>
                  <div className="border border-[#ECECEC] rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                        <tr>
                          <th className="p-3 font-bold text-[#111111]">Patient Name</th>
                          <th className="p-3 font-bold text-[#111111]">ABHA ID</th>
                          <th className="p-3 font-bold text-[#111111]">Status</th>
                          <th className="p-3 font-bold text-[#111111]">Doctor Assigned</th>
                          <th className="p-3 font-bold text-[#111111]">Room/Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECECEC]">
                        {patients.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
                            <td className="p-3 font-bold">{p.name}</td>
                            <td className="p-3 font-mono">{p.abha}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                                p.status.includes('Admitted') ? 'bg-blue-50 text-[#2563EB]' :
                                p.status.includes('Emergency') ? 'bg-red-50 text-[#DC2626]' : 'bg-gray-50 text-[#666666]'
                              }`}>{p.status}</span>
                            </td>
                            <td className="p-3">{p.doctor}</td>
                            <td className="p-3 text-[#666666]">{p.room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PATIENT MANAGEMENT */}
          {activeTabParam === 'patients' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Patient Database</h2>
                  <p className="text-xs text-[#666666] mt-1">Register records, decrypt patient details with cryptographic permissions.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Patients Table */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="border border-[#ECECEC] rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                        <tr>
                          <th className="p-3 font-bold text-[#111111]">Name</th>
                          <th className="p-3 font-bold text-[#111111]">ABHA</th>
                          <th className="p-3 font-bold text-[#111111]">Blood Group</th>
                          <th className="p-3 font-bold text-[#111111]">Status</th>
                          <th className="p-3 font-bold text-[#111111]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECECEC]">
                        {patients.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
                            <td className="p-3 font-bold">{p.name}</td>
                            <td className="p-3 font-mono">{p.abha}</td>
                            <td className="p-3 text-[#666666]">{p.blood}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#2563EB]">
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => setSelectedPatient(p)}
                                className="text-[#2563EB] font-bold hover:underline"
                              >
                                View File
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Patient form */}
                  <div className="bg-[#F7F4EB] p-6 border border-[#ECECEC] rounded">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] mb-4">Register New Patient Card</h3>
                    <form onSubmit={handleCreatePatient} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newPatient.name}
                          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">ABHA ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 91-0000-0000"
                          value={newPatient.abha}
                          onChange={(e) => setNewPatient({ ...newPatient, abha: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Age</label>
                        <input
                          type="number"
                          required
                          value={newPatient.age}
                          onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Blood Group</label>
                        <select
                          value={newPatient.blood}
                          onChange={(e) => setNewPatient({ ...newPatient, blood: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded"
                        >
                          <option value="O-Positive">O-Positive</option>
                          <option value="O-Negative">O-Negative</option>
                          <option value="A-Positive">A-Positive</option>
                          <option value="B-Positive">B-Positive</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="col-span-2 py-2.5 bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-blue-700"
                      >
                        Register Patient
                      </button>
                    </form>
                  </div>
                </div>

                {/* Patient details panel with Decrypt simulation */}
                <div className="lg:col-span-4">
                  {selectedPatient ? (
                    <div className="bg-white border border-[#ECECEC] rounded p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-[#ECECEC] pb-3">
                        <div>
                          <h4 className="font-bold text-sm">{selectedPatient.name}</h4>
                          <p className="text-[10px] text-[#666666] font-mono">{selectedPatient.abha}</p>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="text-[#666666] hover:text-[#111111]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p><strong>Age:</strong> {selectedPatient.age}</p>
                        <p><strong>Blood Group:</strong> {selectedPatient.blood}</p>
                        <p><strong>Emergency Contact:</strong> {selectedPatient.emergencyContact}</p>
                        <p><strong>Insurer:</strong> {selectedPatient.insurer} ({selectedPatient.policy})</p>
                        <p><strong>Allergies:</strong> <span className="text-[#DC2626] font-bold">{selectedPatient.allergies}</span></p>
                      </div>

                      <div className="border-t border-[#ECECEC] pt-4">
                        <button
                          onClick={() => handleBlockchainDecrypt(selectedPatient)}
                          disabled={isDecrypting}
                          className="w-full py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2"
                        >
                          {isDecrypting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <KeyRound className="w-3.5 h-3.5" />
                          )}
                          Decrypt Wallet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F7F4EB] border border-[#ECECEC] rounded p-6 text-center text-xs text-[#666666]">
                      Select a patient card to view complete EMR history and decrypt security envelopes.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTabParam === 'appointments' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Appointments & Consultation Scheduling</h2>
                  <p className="text-xs text-[#666666] mt-1">Manage doctor availability calendar queues.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Active Appointments Schedule */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="border border-[#ECECEC] rounded overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                        <tr>
                          <th className="p-3 font-bold text-[#111111]">Time Slot</th>
                          <th className="p-3 font-bold text-[#111111]">Patient</th>
                          <th className="p-3 font-bold text-[#111111]">Doctor</th>
                          <th className="p-3 font-bold text-[#111111]">Consultation Type</th>
                          <th className="p-3 font-bold text-[#111111]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECECEC]">
                        {appointments.map((appt, idx) => (
                          <tr key={idx} className="hover:bg-[#F7F4EB]/30 transition-colors">
                            <td className="p-3 font-mono font-bold">{appt.time}</td>
                            <td className="p-3">{appt.patient}</td>
                            <td className="p-3">{appt.doctor}</td>
                            <td className="p-3 text-[#666666]">{appt.type}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                                appt.status === 'Completed' ? 'bg-emerald-50 text-[#16A34A]' :
                                appt.status === 'Active' ? 'bg-blue-50 text-[#2563EB]' : 'bg-amber-50 text-[#D97706]'
                              }`}>{appt.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Queue coordinator panel */}
                <div className="lg:col-span-4 bg-[#F7F4EB] border border-[#ECECEC] rounded p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111]">Queue Coordinator</h3>
                  <div className="p-3.5 bg-white border border-[#ECECEC] rounded text-xs space-y-2">
                    <p className="font-bold">Next Walk-In Patient Queue:</p>
                    <div className="flex justify-between border-b border-[#ECECEC] pb-1 text-[#666666]">
                      <span>Michael Chen</span>
                      <span>Estimated Wait: 12 mins</span>
                    </div>
                    <div className="flex justify-between text-[#666666]">
                      <span>Aditya Verma</span>
                      <span>Estimated Wait: 22 mins</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded">
                    Call Next Patient
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: DOCTORS */}
          {activeTabParam === 'doctors' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Doctor Registry</h2>
                  <p className="text-xs text-[#666666] mt-1">Manage clinician rotas, digital signature keys, and consultations queue.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {doctors.map((doc) => (
                  <div key={doc.id} className="bg-white border border-[#ECECEC] rounded p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-[#F3F3F3]">
                        <h3 className="font-bold text-sm text-[#111111]">{doc.name}</h3>
                        <span className={`w-2.5 h-2.5 rounded-full ${doc.status === 'On Duty' ? 'bg-[#16A34A]' : 'bg-[#D97706]'}`} />
                      </div>
                      <div className="space-y-1 mt-3 text-xs text-[#666666]">
                        <p><strong>Specialty:</strong> {doc.specialty}</p>
                        <p><strong>Queue:</strong> {doc.queue} patients waiting</p>
                        <p><strong>Email:</strong> {doc.email}</p>
                      </div>
                    </div>
                    <div className="border-t border-[#F3F3F3] pt-3 text-[10px] font-mono text-[#666666] flex justify-between">
                      <span>ECDSA Key:</span>
                      <span>{doc.sig}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DEPARTMENTS */}
          {activeTabParam === 'departments' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Clinical Specialty Departments</h2>
                  <p className="text-xs text-[#666666] mt-1">Multi-branch bed capacity reports and active staff rosters.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <h3 className="font-bold text-sm">Cardiology</h3>
                  <div className="space-y-1.5 mt-3 text-xs text-[#666666]">
                    <p>Bed Occupancy: 12 / 15</p>
                    <p>Active Clinicians: 4</p>
                    <p>Pending Procedures: 2 (OT-1)</p>
                  </div>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <h3 className="font-bold text-sm">Pediatrics</h3>
                  <div className="space-y-1.5 mt-3 text-xs text-[#666666]">
                    <p>Bed Occupancy: 4 / 20</p>
                    <p>Active Clinicians: 2</p>
                    <p>Pending Procedures: 0</p>
                  </div>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <h3 className="font-bold text-sm">Neurology</h3>
                  <div className="space-y-1.5 mt-3 text-xs text-[#666666]">
                    <p>Bed Occupancy: 8 / 10</p>
                    <p>Active Clinicians: 3</p>
                    <p>Pending Procedures: 1</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CLINICAL PORTAL */}
          {activeTabParam === 'clinical-portal' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Clinical Prescriptions & Notes Form</h2>
                  <p className="text-xs text-[#666666] mt-1">Write digital diagnostics orders, verify contraindications, sign with clinician keys.</p>
                </div>
              </div>

              <div className="bg-white border border-[#ECECEC] rounded p-6 max-w-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] mb-6">Clinician Signature Pad</h3>
                
                <form className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Select Patient</label>
                      <select className="w-full p-2.5 border border-[#ECECEC] rounded bg-[#E8F0FE]">
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.abha})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Assign Diagnosis (ICD-10)</label>
                      <input
                        type="text"
                        placeholder="e.g. J45.909 Asthma Unspecified"
                        className="w-full p-2.5 border border-[#ECECEC] rounded bg-[#E8F0FE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Medication Prescription Details</label>
                    <textarea
                      rows="3"
                      placeholder="Amoxicillin 500mg (14ct) - 1 tab oral twice daily for 7 days"
                      className="w-full p-2.5 border border-[#ECECEC] rounded bg-[#E8F0FE] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Clinical Notes & Comments</label>
                    <textarea
                      rows="3"
                      placeholder="Patient presented with mild respiratory wheezing. Pulse-ox is 98% on room air."
                      className="w-full p-2.5 border border-[#ECECEC] rounded bg-[#E8F0FE] resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#666666]">Clinician key: 0x8a92...e304 (Dr. Amanda Ross)</span>
                    <button
                      type="button"
                      onClick={() => alert('Record Hashed and Signed to Ledger successfully!')}
                      className="px-6 py-2.5 bg-[#2563EB] text-white font-bold uppercase tracking-wider rounded hover:bg-blue-700"
                    >
                      Sign & Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: EMR */}
          {activeTabParam === 'emr' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Electronic Medical Records (EMR) Ledger</h2>
                  <p className="text-xs text-[#666666] mt-1">Decrypted historical timelines showing complete cryptographic audit trail.</p>
                </div>
              </div>

              <div className="border border-[#ECECEC] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                    <tr>
                      <th className="p-3 font-bold text-[#111111]">Record Hash</th>
                      <th className="p-3 font-bold text-[#111111]">Patient Name</th>
                      <th className="p-3 font-bold text-[#111111]">Clinical Node Creator</th>
                      <th className="p-3 font-bold text-[#111111]">Log Timestamp</th>
                      <th className="p-3 font-bold text-[#111111]">Consensus Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC] font-mono">
                    <tr className="hover:bg-[#F7F4EB]/30 transition-colors">
                      <td className="p-3 font-bold text-[#2563EB]">0x4f12...e304</td>
                      <td className="p-3 font-sans">Sarah Jenkins</td>
                      <td className="p-3 font-sans">Dr. Amanda Ross</td>
                      <td className="p-3">2026-06-28 09:12 AM</td>
                      <td className="p-3 text-[#16A34A] font-bold font-sans">✓ Verified Synced</td>
                    </tr>
                    <tr className="hover:bg-[#F7F4EB]/30 transition-colors">
                      <td className="p-3 font-bold text-[#2563EB]">0x78a1...90f2</td>
                      <td className="p-3 font-sans">Michael Chen</td>
                      <td className="p-3 font-sans">Dr. Marcus Vance</td>
                      <td className="p-3">2026-06-28 10:45 AM</td>
                      <td className="p-3 text-[#16A34A] font-bold font-sans">✓ Verified Synced</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: PHARMACY */}
          {activeTabParam === 'pharmacy' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Pharmacy Inventory</h2>
                  <p className="text-xs text-[#666666] mt-1">Track medication batches, expiry warning indexes, and automatic procurement alerts.</p>
                </div>
              </div>

              <div className="border border-[#ECECEC] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                    <tr>
                      <th className="p-3 font-bold text-[#111111]">Medicine Code</th>
                      <th className="p-3 font-bold text-[#111111]">Name</th>
                      <th className="p-3 font-bold text-[#111111]">Category</th>
                      <th className="p-3 font-bold text-[#111111]">Stock Qty</th>
                      <th className="p-3 font-bold text-[#111111]">Expiry Date</th>
                      <th className="p-3 font-bold text-[#111111]">Status Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC]">
                    {pharmacyStock.map((med, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F4EB]/30 transition-colors">
                        <td className="p-3 font-mono">{med.code}</td>
                        <td className="p-3 font-bold">{med.name}</td>
                        <td className="p-3 text-[#666666]">{med.category}</td>
                        <td className="p-3 font-mono">{med.qty}</td>
                        <td className="p-3 font-mono">{med.exp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                            med.status === 'Optimal' ? 'bg-emerald-50 text-[#16A34A]' :
                            med.status === 'Low Stock' ? 'bg-amber-50 text-[#D97706]' : 'bg-red-50 text-[#DC2626]'
                          }`}>{med.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: LABORATORY */}
          {activeTabParam === 'laboratory' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Pathology Laboratory Portal</h2>
                  <p className="text-xs text-[#666666] mt-1">Receive test requests, collect biosamples, process, and sign reports.</p>
                </div>
              </div>

              <div className="border border-[#ECECEC] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                    <tr>
                      <th className="p-3 font-bold text-[#111111]">Sample Code</th>
                      <th className="p-3 font-bold text-[#111111]">Patient</th>
                      <th className="p-3 font-bold text-[#111111]">Diagnostics Test</th>
                      <th className="p-3 font-bold text-[#111111]">Status</th>
                      <th className="p-3 font-bold text-[#111111]">Results Summary</th>
                      <th className="p-3 font-bold text-[#111111]">On-chain Block</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC]">
                    {labSamples.map((sample, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F4EB]/30 transition-colors">
                        <td className="p-3 font-mono font-bold">{sample.code}</td>
                        <td className="p-3">{sample.patient}</td>
                        <td className="p-3">{sample.test}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                            sample.status === 'Completed' ? 'bg-emerald-50 text-[#16A34A]' :
                            sample.status === 'Processing' ? 'bg-blue-50 text-[#2563EB]' : 'bg-amber-50 text-[#D97706]'
                          }`}>{sample.status}</span>
                        </td>
                        <td className="p-3 text-[#666666]">{sample.result}</td>
                        <td className="p-3 font-mono">{sample.block}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: RADIOLOGY */}
          {activeTabParam === 'radiology' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Radiology Viewer Console</h2>
                  <p className="text-xs text-[#666666] mt-1">Review X-Rays, MRIs, CT Scans linked cryptographically to patient files.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {radiologyRecords.map((rad, idx) => (
                  <div key={idx} className="bg-white border border-[#ECECEC] rounded p-5 space-y-4">
                    <div className="flex justify-between items-baseline pb-2 border-b border-[#F3F3F3]">
                      <h3 className="font-bold text-sm">{rad.patient}</h3>
                      <span className="font-mono text-[10px] text-[#666666]">{rad.id} - {rad.type}</span>
                    </div>
                    <div className="bg-[#111111] h-48 rounded flex items-center justify-center text-white relative overflow-hidden">
                      {/* X-Ray Skeleton / Scan Silhouette */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:10px_10px]" />
                      <div className="w-16 h-28 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white/50 animate-pulse" />
                      </div>
                      <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/50">LINKED_TO_WALLET_0X9A</span>
                    </div>
                    <p className="text-xs text-[#666666] leading-relaxed">
                      <strong>Radiologist Notes:</strong> {rad.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: OPERATION THEATRE */}
          {activeTabParam === 'ot' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Operation Theatre Scheduling</h2>
                  <p className="text-xs text-[#666666] mt-1">Track surgical lists, surgeon rosters, and staff allocations.</p>
                </div>
              </div>

              <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded text-xs space-y-3">
                <h3 className="font-bold">Active Surgical Rotas</h3>
                <div className="flex justify-between border-b border-[#ECECEC] pb-1">
                  <span>OT Room 1: Bypass Surgery</span>
                  <span className="font-bold">Dr. Sarah Jenkins — 09:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>OT Room 2: Appendectomy</span>
                  <span className="font-bold">Dr. Amanda Ross — 01:00 PM</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: BILLING */}
          {activeTabParam === 'billing' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Invoices & GST Reports Center</h2>
                  <p className="text-xs text-[#666666] mt-1">Review revenue analytics, outpatient settlements, and outstanding claims.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Outpatient Pharmacy Sales</p>
                  <p className="text-xl font-bold mt-1">₹4,89,200</p>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Inpatient Ward Admissions</p>
                  <p className="text-xl font-bold mt-1">₹12,40,900</p>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Smart Claims Settlements</p>
                  <p className="text-xl font-bold mt-1">₹8,12,000</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: INSURANCE */}
          {activeTabParam === 'insurance' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Insurance Pre-Authorization & Claims Ledger</h2>
                  <p className="text-xs text-[#666666] mt-1">Verify policy validation status and check auto-settlement smart contracts.</p>
                </div>
              </div>

              <div className="border border-[#ECECEC] rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                    <tr>
                      <th className="p-3 font-bold text-[#111111]">Claim ID</th>
                      <th className="p-3 font-bold text-[#111111]">Patient</th>
                      <th className="p-3 font-bold text-[#111111]">Insurer</th>
                      <th className="p-3 font-bold text-[#111111]">Amount</th>
                      <th className="p-3 font-bold text-[#111111]">Audit Checks</th>
                      <th className="p-3 font-bold text-[#111111]">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC]">
                    {claims.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F4EB]/30 transition-colors">
                        <td className="p-3 font-mono font-bold">{claim.id}</td>
                        <td className="p-3">{claim.patient}</td>
                        <td className="p-3">{claim.insurer}</td>
                        <td className="p-3 font-bold">{claim.amount}</td>
                        <td className="p-3 font-mono text-[#666666]">{claim.check}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                            claim.status.includes('Approved') ? 'bg-emerald-50 text-[#16A34A]' : 'bg-amber-50 text-[#D97706]'
                          }`}>{claim.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 14: INVENTORY */}
          {activeTabParam === 'inventory' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Hospital Equipment & Supplies Inventory</h2>
                  <p className="text-xs text-[#666666] mt-1">Track oxygen cylinders, syringe counts, and clinical consumable supplies.</p>
                </div>
              </div>

              <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded text-xs space-y-2">
                <h3 className="font-bold">Consumable Supplies Status</h3>
                <div className="flex justify-between border-b border-[#ECECEC] pb-1 text-[#666666]">
                  <span>Oxygen Cylinders (47L)</span>
                  <span className="text-[#111111] font-bold">142 units</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Sterilized Syringes (2ml)</span>
                  <span className="text-[#111111] font-bold">12,000 units</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: BLOOD BANK */}
          {activeTabParam === 'bloodbank' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Blood Bank Reserve Units</h2>
                  <p className="text-xs text-[#666666] mt-1">Monitor O-Neg, O+, B-Neg and and trigger warning indices for low reserves.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-[#F7F4EB] p-5 border border-red-200 rounded">
                  <p className="text-xs font-bold text-[#DC2626]">O-Negative</p>
                  <p className="text-2xl font-bold mt-1 text-[#DC2626]">2 Units</p>
                  <span className="text-[9px] text-[#DC2626] font-bold">Critical Level</span>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-xs font-bold text-[#111111]">O-Positive</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">18 Units</p>
                  <span className="text-[9px] text-[#16A34A] font-bold">Healthy</span>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-xs font-bold text-[#111111]">AB-Negative</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">4 Units</p>
                  <span className="text-[9px] text-[#D97706] font-bold">Low warning</span>
                </div>
                <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded">
                  <p className="text-xs font-bold text-[#111111]">B-Positive</p>
                  <p className="text-2xl font-bold mt-1 text-[#111111]">12 Units</p>
                  <span className="text-[9px] text-[#16A34A] font-bold">Healthy</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 16: AMBULANCE */}
          {activeTabParam === 'ambulance' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Ambulance Dispatch Hub</h2>
                  <p className="text-xs text-[#666666] mt-1">Track dispatch vehicle coordinates and status indicators.</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] mb-4">Emergency GPS Dispatch</h3>
                <div className="bg-[#F7F4EB] h-48 rounded flex items-center justify-center border border-[#ECECEC] text-[#666666] relative overflow-hidden">
                  <Navigation className="w-6 h-6 text-[#2563EB] animate-pulse" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono">Mock GPS: 12.9716° N, 77.5946° E (Ambulance #3)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: AI ASSISTANT */}
          {activeTabParam === 'ai-assistant' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">HealthChain Clinical AI Assistant</h2>
                  <p className="text-xs text-[#666666] mt-1">Leverage natural language models to extract patient summaries and assign ICD codes.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white border border-[#ECECEC] rounded p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    Real-time AI Insights
                  </h3>
                  <div className="space-y-3">
                    {aiSuggestions.map((sug, sIdx) => (
                      <div key={sIdx} className="p-3 bg-[#F7F4EB] rounded border border-[#ECECEC] text-xs leading-relaxed text-[#111111]">
                        {sug}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F7F4EB] border border-[#ECECEC] rounded p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111]">Synthesize Patient summary</h3>
                  <div className="space-y-3">
                    <select className="w-full p-2.5 bg-white border border-[#ECECEC] rounded text-xs">
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.abha})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => alert('AI Summary compiled successfully!\n"Sarah Jenkins (34, O-Neg): History of Penicillin allergy. Diagnostic labs show normal WBC index. Active Cardiology consultation pending review."')}
                      className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
                    >
                      Generate Summary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 18: BLOCKCHAIN RECORDS */}
          {activeTabParam === 'blockchain' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Consensus Ledger Logs</h2>
                  <p className="text-xs text-[#666666] mt-1">Review block headers, mined transaction counts, and validator nodes consensus hashes.</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {blockchainBlocks.map((block) => (
                  <div key={block.height} className="bg-white border border-[#ECECEC] rounded p-5 space-y-3">
                    <div className="flex justify-between items-baseline pb-2 border-b border-[#F3F3F3]">
                      <span className="text-[10px] font-bold text-[#666666]">BLOCK NUMBER</span>
                      <span className="font-mono text-xs font-bold">#{block.height}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-[#666666]">
                      <p><strong>Block Hash:</strong> <span className="font-mono text-[10px] text-[#2563EB]">{block.hash}</span></p>
                      <p><strong>Transactions:</strong> {block.tx} transactions verified</p>
                      <p><strong>Mined:</strong> {block.timestamp}</p>
                      <p><strong>Validator Node:</strong> {block.miner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 19: SETTINGS */}
          {activeTabParam === 'settings' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">ERP System Configurations</h2>
                  <p className="text-xs text-[#666666] mt-1">Configure FHIR, HL7, ABDM API endpoints and user role privileges.</p>
                </div>
              </div>

              <div className="bg-white border border-[#ECECEC] rounded p-6 max-w-2xl space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] mb-4">Interoperability Standards</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-[#F3F3F3] pb-2">
                      <span>ABDM Gateway Address</span>
                      <span className="font-mono text-[#666666]">https://api.abdm.gov.in/v1.0</span>
                    </div>
                    <div className="flex justify-between border-b border-[#F3F3F3] pb-2">
                      <span>FHIR Server version</span>
                      <span className="font-mono text-[#666666]">v4.0.1 (R4 compliant)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HL7 Socket Node Port</span>
                      <span className="font-mono text-[#666666]">Port 9012 (Enabled)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
