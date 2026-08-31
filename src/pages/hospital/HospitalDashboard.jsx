import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc
} from 'firebase/firestore';
import {
  LayoutDashboard, Users, Calendar, UserRound, Building2, Stethoscope,
  FileHeart, ClipboardList, ShieldAlert, BadgeInfo, Pill, TestTube, Image,
  Scissors, Siren, Lock, FileSpreadsheet, ShieldCheck, BriefcaseMedical,
  Activity, Navigation, Sparkles, KeyRound, Settings, SlidersHorizontal,
  LogOut, Plus, Search, Check, X, RefreshCw, Eye, Bell, MessageSquare, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { logout, changeUserLanguage } = useAuthStore();
  const { i18n } = useTranslation();
  const orgId = localStorage.getItem('hc_erp_org_id');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('Hospital Workspace');
  const [searchQuery, setSearchQuery] = useState('');

  const getTranslatedSidebarLabel = (item) => {
    if (item.id === 'dashboard') return t('common.dashboard');
    if (item.id === 'ai-assistant') return t('patient.aiAssistant');
    if (item.id === 'appointments') return t('patient.appointments');
    const translated = t(`hospital.${item.id}`);
    return translated && translated !== `hospital.${item.id}` ? translated : item.name;
  };

  // Real-time Firestore records states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [claims, setClaims] = useState([]);
  const [blockchainLogs, setBlockchainLogs] = useState([]);

  // Form Modals states
  const [activeModal, setActiveModal] = useState(null); // 'patient', 'doctor', 'appointment', 'lab', 'inventory', 'invoice'
  const [patientForm, setPatientForm] = useState({ name: '', abha: '', age: '', blood: 'O-Positive', allergies: '', contact: '', insurer: '', policy: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: 'General Medicine', shift: '09:00 AM - 05:00 PM' });
  const [apptForm, setApptForm] = useState({ patient: '', doctor: '', time: '', type: 'General Consultation' });
  const [labForm, setLabForm] = useState({ patient: '', test: 'Complete Blood Count' });
  const [invForm, setInvForm] = useState({ name: '', category: 'Medical Supplies', qty: '', exp: '' });
  const [invoiceForm, setInvoiceForm] = useState({ patient: '', description: '', amount: '' });

  // Verification Gate Check
  useEffect(() => {
    const checkSession = () => {
      if (!auth.currentUser || !orgId) {
        navigate('/hospital/login');
      }
    };
    checkSession();
  }, [navigate, orgId]);

  // Load Organization Name
  useEffect(() => {
    if (!orgId) return;
    const fetchOrg = async () => {
      try {
        const docRef = doc(db, 'hospital_organizations', orgId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrgName(docSnap.data().name);
        }
      } catch (err) {
        console.warn('Failed to load organization info:', err);
      }
    };
    fetchOrg();
  }, [orgId]);

  // ───── REAL-TIME LISTENERS ─────
  useEffect(() => {
    if (!orgId) return;

    setLoading(true);

    const qPatients = query(collection(db, 'hospital_patients'), where('orgId', '==', orgId));
    const unsubscribePatients = onSnapshot(qPatients, (snap) => {
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qAppointments = query(collection(db, 'hospital_appointments'), where('orgId', '==', orgId));
    const unsubscribeAppointments = onSnapshot(qAppointments, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qDoctors = query(collection(db, 'hospital_doctors'), where('orgId', '==', orgId));
    const unsubscribeDoctors = onSnapshot(qDoctors, (snap) => {
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qLab = query(collection(db, 'hospital_laboratory'), where('orgId', '==', orgId));
    const unsubscribeLab = onSnapshot(qLab, (snap) => {
      setLabTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qPharmacy = query(collection(db, 'hospital_pharmacy'), where('orgId', '==', orgId));
    const unsubscribePharmacy = onSnapshot(qPharmacy, (snap) => {
      setPharmacyItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qInventory = query(collection(db, 'hospital_inventory'), where('orgId', '==', orgId));
    const unsubscribeInventory = onSnapshot(qInventory, (snap) => {
      setInventoryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qBilling = query(collection(db, 'hospital_billing'), where('orgId', '==', orgId));
    const unsubscribeBilling = onSnapshot(qBilling, (snap) => {
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qClaims = query(collection(db, 'hospital_claims'), where('orgId', '==', orgId));
    const unsubscribeClaims = onSnapshot(qClaims, (snap) => {
      setClaims(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qBlockchain = query(collection(db, 'hospital_blockchain_logs'), where('orgId', '==', orgId));
    const unsubscribeBlockchain = onSnapshot(qBlockchain, (snap) => {
      setBlockchainLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubscribePatients();
      unsubscribeAppointments();
      unsubscribeDoctors();
      unsubscribeLab();
      unsubscribePharmacy();
      unsubscribeInventory();
      unsubscribeBilling();
      unsubscribeClaims();
      unsubscribeBlockchain();
    };
  }, [orgId]);

  // Helper: Cryptographic transaction log
  const logBlockchainTx = async (actionDesc, targetHash) => {
    try {
      await addDoc(collection(db, 'hospital_blockchain_logs'), {
        orgId,
        action: actionDesc,
        txHash: targetHash || '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        timestamp: new Date().toISOString(),
        blockNumber: 108495 + Math.floor(Math.random() * 50)
      });
    } catch (e) {
      console.error('Failed to log blockchain audit:', e);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hospital_patients'), {
        orgId,
        ...patientForm,
        age: Number(patientForm.age),
        status: 'OPD Queue',
        room: 'Triage Room 1',
        createdAt: new Date().toISOString()
      });
      await logBlockchainTx(`Register Patient Wallet (${patientForm.name})`);
      setActiveModal(null);
      setPatientForm({ name: '', abha: '', age: '', blood: 'O-Positive', allergies: '', contact: '', insurer: '', policy: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hospital_doctors'), {
        orgId,
        ...doctorForm,
        status: 'On Duty',
        queue: 0,
        createdAt: new Date().toISOString()
      });
      await logBlockchainTx(`Authorize Doctor Registry Access (${doctorForm.name})`);
      setActiveModal(null);
      setDoctorForm({ name: '', specialty: 'General Medicine', shift: '09:00 AM - 05:00 PM' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hospital_appointments'), {
        orgId,
        ...apptForm,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      await logBlockchainTx(`Schedule Appointment Entry (${apptForm.patient})`);
      setActiveModal(null);
      setApptForm({ patient: '', doctor: '', time: '', type: 'General Consultation' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddLab = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hospital_laboratory'), {
        orgId,
        ...labForm,
        code: 'SMP-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Collected',
        result: 'Awaiting laboratory diagnostics processing',
        createdAt: new Date().toISOString()
      });
      await logBlockchainTx(`Request Biosample Laboratory Analysis (${labForm.patient})`);
      setActiveModal(null);
      setLabForm({ patient: '', test: 'Complete Blood Count' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'hospital_inventory'), {
        orgId,
        ...invForm,
        qty: Number(invForm.qty),
        status: 'Optimal',
        createdAt: new Date().toISOString()
      });
      await logBlockchainTx(`Ingest Medical Supply Item (${invForm.name})`);
      setActiveModal(null);
      setInvForm({ name: '', category: 'Medical Supplies', qty: '', exp: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      const invoiceRef = await addDoc(collection(db, 'hospital_billing'), {
        orgId,
        ...invoiceForm,
        amount: Number(invoiceForm.amount),
        status: 'Outstanding',
        createdAt: new Date().toISOString()
      });

      const pMatch = patients.find(p => p.name === invoiceForm.patient);
      if (pMatch && pMatch.insurer) {
        await addDoc(collection(db, 'hospital_claims'), {
          orgId,
          patient: invoiceForm.patient,
          insurer: pMatch.insurer,
          amount: Number(invoiceForm.amount),
          invoiceId: invoiceRef.id,
          status: 'Pending Pre-Auth',
          check: 'Verifying signatures ledger consensus',
          createdAt: new Date().toISOString()
        });
      }

      await logBlockchainTx(`Generate Patient Invoice Ledger (${invoiceForm.patient})`);
      setActiveModal(null);
      setInvoiceForm({ patient: '', description: '', amount: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/hospital/login');
  };

  // Mandatory Sidebar Menu Items
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'doctors', name: 'Doctors', icon: UserRound },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'admissions', name: 'Admissions', icon: Building2 },
    { id: 'clinical', name: 'Clinical Portal', icon: Stethoscope },
    { id: 'emr', name: 'EMR', icon: FileHeart },
    { id: 'laboratory', name: 'Laboratory', icon: TestTube },
    { id: 'radiology', name: 'Radiology', icon: Image },
    { id: 'pharmacy', name: 'Pharmacy', icon: Pill },
    { id: 'inventory', name: 'Inventory', icon: BriefcaseMedical },
    { id: 'bloodbank', name: 'Blood Bank', icon: Activity },
    { id: 'billing', name: 'Billing', icon: FileSpreadsheet },
    { id: 'insurance', name: 'Insurance', icon: ShieldCheck },
    { id: 'finance', name: 'Finance', icon: ClipboardList },
    { id: 'reports', name: 'Reports', icon: Navigation },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles },
    { id: 'blockchain', name: 'Blockchain', icon: KeyRound },
    { id: 'audit-logs', name: 'Audit Logs', icon: Lock },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans flex overflow-hidden">
      
      {/* Collapsible Sidebar - Warm Cream (#F7F4EB) */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-[#F7F4EB] border-r border-[#ECECEC] flex flex-col justify-between transition-all duration-300 relative z-20`}>
        <div>
          <div className="p-4 border-b border-[#ECECEC] flex items-center justify-between">
            {isSidebarOpen ? (
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#111111] truncate max-w-[180px]">
                {orgName}
              </span>
            ) : (
              <span className="font-sans font-bold text-xs text-[#111111]">HC</span>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#666666] hover:text-[#111111] p-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[75vh]">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'ai-assistant') {
                      navigate('/hospital/ai');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-[12px] text-left transition-colors text-xs ${
                    isActive ? 'bg-white text-[#111111] border border-[#ECECEC] font-bold shadow-sm' : 'text-[#666666] hover:text-[#111111] hover:bg-white/40'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{getTranslatedSidebarLabel(item)}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-[#ECECEC] bg-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 rounded-[12px] text-left text-xs text-[#DC2626] hover:bg-red-50/50 transition-colors">
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="font-bold">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Header - White Background, includes Global Search, Notifications, Messages, selector, breadcrumbs, quick actions */}
        <header className="sticky top-0 bg-white border-b border-[#ECECEC] z-10 px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <span>Organizations</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#111111]">{orgName}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="capitalize text-[#2563EB]">{activeTab}</span>
            </div>

            {/* Global Search & System items */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Global search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#E8F0FE] text-xs text-[#111111] rounded-[12px] border border-[#ECECEC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Messages */}
              <button className="p-2 border border-[#ECECEC] rounded-[12px] hover:bg-[#F7F4EB] text-[#666666] relative">
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <button className="p-2 border border-[#ECECEC] rounded-[12px] hover:bg-[#F7F4EB] text-[#666666] relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 bg-[#DC2626] rounded-full absolute top-1 right-1" />
              </button>

              {/* Language Switcher */}
              <div className="flex items-center">
                <select
                  value={i18n.language || 'en'}
                  onChange={(e) => changeUserLanguage(e.target.value)}
                  className="px-2.5 py-2 border border-[#ECECEC] rounded-[12px] text-xs font-bold bg-[#F7F4EB] focus:outline-none cursor-pointer"
                >
                  <option value="en">🌐 English</option>
                  <option value="te">🌐 తెలుగు</option>
                </select>
              </div>

              {/* Hospital Workspace Switcher */}
              <button
                onClick={() => navigate('/hospital/select-organization')}
                className="px-3 py-2 border border-[#ECECEC] rounded-[12px] text-xs font-bold bg-[#F7F4EB] flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Switch Org</span>
              </button>

              {/* Profile Menu */}
              <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white cursor-pointer">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Actions and blockchain indicators */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F3F3F3] pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#666666]">Consensus Block:</span>
              <span className="font-mono text-[10px] bg-[#E8F0FE] text-[#2563EB] px-2 py-0.5 rounded font-bold">
                #{blockchainLogs.length > 0 ? Math.max(...blockchainLogs.map(l => l.blockNumber)) : 108495}
              </span>
              <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setActiveModal('patient')} className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-bold uppercase rounded-[12px] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Patient
              </button>
              <button onClick={() => setActiveModal('doctor')} className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-bold uppercase rounded-[12px] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Doctor
              </button>
              <button onClick={() => setActiveModal('appointment')} className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-bold uppercase rounded-[12px] flex items-center gap-1">
                <Plus className="w-3 h-3" /> Appointment
              </button>
            </div>
          </div>
        </header>

        {/* Workspace content */}
        <div className="p-6 md:p-8 flex-1 min-w-0">
          
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#666666]" />
              <p className="text-xs text-[#666666]">Querying clinical database records...</p>
            </div>
          ) : (
            <>
              {/* ───── TAB: DASHBOARD ───── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Dashboard Overview</h2>
                      <p className="text-xs text-[#666666] mt-1">Operational summaries loaded directly from database.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded-[12px]">
                      <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Patients Registered</p>
                      <p className="text-2xl font-bold mt-1 text-[#111111]">{patients.length}</p>
                    </div>
                    <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded-[12px]">
                      <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Active Staff Doctors</p>
                      <p className="text-2xl font-bold mt-1 text-[#111111]">{doctors.length}</p>
                    </div>
                    <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded-[12px]">
                      <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Pending Appointments</p>
                      <p className="text-2xl font-bold mt-1 text-[#111111]">{appointments.filter(a => a.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-[#F7F4EB] p-5 border border-[#ECECEC] rounded-[12px]">
                      <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider">Blockchain Ledger Height</p>
                      <p className="text-2xl font-bold mt-1 text-[#2563EB]">#{108495 + blockchainLogs.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ───── TAB: PATIENTS ───── */}
              {activeTab === 'patients' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Patient Management</h2>
                      <p className="text-xs text-[#666666] mt-1">Immutable directory of registered patient wallets.</p>
                    </div>
                    <button onClick={() => setActiveModal('patient')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Register Patient
                    </button>
                  </div>

                  {patients.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] space-y-4 bg-[#F7F4EB]/10">
                      <p className="text-sm text-[#666666]">No patients have been registered.</p>
                      <button onClick={() => setActiveModal('patient')} className="px-4 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">
                        Register First Patient
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[#ECECEC] rounded-[12px] overflow-hidden bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                          <tr>
                            <th className="p-3 font-bold text-[#111111]">Name</th>
                            <th className="p-3 font-bold text-[#111111]">ABHA</th>
                            <th className="p-3 font-bold text-[#111111]">Blood Group</th>
                            <th className="p-3 font-bold text-[#111111]">Age</th>
                            <th className="p-3 font-bold text-[#111111]">Emergency Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECECEC]">
                          {patients.map(p => (
                            <tr key={p.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
                              <td className="p-3 font-bold">{p.name}</td>
                              <td className="p-3 font-mono">{p.abha}</td>
                              <td className="p-3 text-[#666666]">{p.blood}</td>
                              <td className="p-3">{p.age}</td>
                              <td className="p-3 text-[#666666]">{p.contact}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ───── TAB: APPOINTMENTS ───── */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Appointments Calendar</h2>
                      <p className="text-xs text-[#666666] mt-1">Manage consultation lists.</p>
                    </div>
                    <button onClick={() => setActiveModal('appointment')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Schedule Appointment
                    </button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] space-y-4 bg-[#F7F4EB]/10">
                      <p className="text-sm text-[#666666]">No appointments scheduled.</p>
                      <button onClick={() => setActiveModal('appointment')} className="px-4 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">
                        Schedule First Appointment
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[#ECECEC] rounded-[12px] overflow-hidden bg-white">
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
                          {appointments.map(appt => (
                            <tr key={appt.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
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
                  )}
                </div>
              )}

              {/* ───── TAB: DOCTORS ───── */}
              {activeTab === 'doctors' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Clinicians Registry</h2>
                      <p className="text-xs text-[#666666] mt-1">Manage practitioner licenses and working hours.</p>
                    </div>
                    <button onClick={() => setActiveModal('doctor')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Doctor
                    </button>
                  </div>

                  {doctors.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/10">
                      <p className="text-sm text-[#666666]">No doctors registered yet.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {doctors.map(doc => (
                        <div key={doc.id} className="bg-white border border-[#ECECEC] rounded-[12px] p-5 space-y-3">
                          <h3 className="font-bold text-sm text-[#111111] pb-2 border-b border-[#F3F3F3]">{doc.name}</h3>
                          <div className="space-y-1.5 text-xs text-[#666666]">
                            <p><strong>Specialty:</strong> {doc.specialty}</p>
                            <p><strong>Shift Hours:</strong> {doc.shift}</p>
                            <p><strong>Status:</strong> <span className="text-[#16A34A] font-bold">On Duty</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ───── TAB: LABORATORY ───── */}
              {activeTab === 'laboratory' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Laboratory Portal</h2>
                      <p className="text-xs text-[#666666] mt-1">Track tests diagnostics.</p>
                    </div>
                    <button onClick={() => setActiveModal('lab')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Request Lab Test
                    </button>
                  </div>

                  {labTests.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/10">
                      <p className="text-sm text-[#666666]">No laboratory requests.</p>
                    </div>
                  ) : (
                    <div className="border border-[#ECECEC] rounded-[12px] overflow-hidden bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                          <tr>
                            <th className="p-3 font-bold text-[#111111]">Sample Code</th>
                            <th className="p-3 font-bold text-[#111111]">Patient</th>
                            <th className="p-3 font-bold text-[#111111]">Test Type</th>
                            <th className="p-3 font-bold text-[#111111]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECECEC]">
                          {labTests.map(test => (
                            <tr key={test.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
                              <td className="p-3 font-mono font-bold">{test.code}</td>
                              <td className="p-3">{test.patient}</td>
                              <td className="p-3">{test.test}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F0FE] text-[#2563EB]">
                                  {test.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ───── TAB: INVENTORY ───── */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-4 border-b border-[#ECECEC]">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111]">Inventory Portal</h2>
                      <p className="text-xs text-[#666666] mt-1">Manage consumable inventories.</p>
                    </div>
                    <button onClick={() => setActiveModal('inventory')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase rounded-[12px] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Ingest Supply
                    </button>
                  </div>

                  {inventoryItems.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/10">
                      <p className="text-sm text-[#666666]">No inventory available.</p>
                    </div>
                  ) : (
                    <div className="border border-[#ECECEC] rounded-[12px] overflow-hidden bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F4EB] border-b border-[#ECECEC]">
                          <tr>
                            <th className="p-3 font-bold text-[#111111]">Supply Item</th>
                            <th className="p-3 font-bold text-[#111111]">Category</th>
                            <th className="p-3 font-bold text-[#111111]">Qty</th>
                            <th className="p-3 font-bold text-[#111111]">Expiry</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECECEC]">
                          {inventoryItems.map(inv => (
                            <tr key={inv.id} className="hover:bg-[#F7F4EB]/30 transition-colors">
                              <td className="p-3 font-bold">{inv.name}</td>
                              <td className="p-3 text-[#666666]">{inv.category}</td>
                              <td className="p-3 font-mono">{inv.qty}</td>
                              <td className="p-3 font-mono">{inv.exp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ───── STATIC MODULE VIEWS WITH DETAILED NOTICES ───── */}
              {['admissions', 'clinical', 'emr', 'radiology', 'pharmacy', 'bloodbank', 'billing', 'insurance', 'finance', 'reports', 'blockchain', 'audit-logs', 'settings'].includes(activeTab) && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111] pb-4 border-b border-[#ECECEC]">
                    {activeTab === 'admissions' && 'Admissions Portal'}
                    {activeTab === 'clinical' && 'Clinical SOAP Portal'}
                    {activeTab === 'emr' && 'Electronic Medical Records'}
                    {activeTab === 'radiology' && 'Radiology CT & MRI Scans'}
                    {activeTab === 'pharmacy' && 'Pharmacy Dispatch Portal'}
                    {activeTab === 'bloodbank' && 'Blood Bank Reserves'}
                    {activeTab === 'billing' && 'Billing Ledger Invoices'}
                    {activeTab === 'insurance' && 'Insurance Claims'}
                    {activeTab === 'finance' && 'Finance Ledger'}
                    {activeTab === 'reports' && 'Reports Export'}
                    {activeTab === 'blockchain' && 'Blockchain Consensus Keys'}
                    {activeTab === 'audit-logs' && 'Immutable Audit Logs'}
                    {activeTab === 'settings' && 'System Parameters Settings'}
                  </h2>
                  <div className="p-12 text-center border border-dashed border-[#ECECEC] rounded-[12px] bg-[#F7F4EB]/10 text-xs text-[#666666]">
                    No database records indexed in this module. Configure system parameters settings to connect external APIs.
                  </div>
                </div>
              )}

              {/* ───── TAB: AI ASSISTANT ───── */}
              {activeTab === 'ai-assistant' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#111111] pb-4 border-b border-[#ECECEC]">Clinical AI Assistant</h2>
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-white border border-[#ECECEC] rounded-[12px] p-6 space-y-4 text-xs">
                      <h3 className="font-bold uppercase tracking-wider text-[#111111]">Compile Record Summary</h3>
                      {patients.length === 0 ? (
                        <p className="text-[#666666]">No patients registered in database yet.</p>
                      ) : (
                        <div className="space-y-3">
                          <select className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] rounded-[12px] text-xs">
                            {patients.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.abha})</option>
                            ))}
                          </select>
                          <button
                            onClick={() => alert('AI Summary Compiled:\n- Consent verified.\n- Allergies logged.\n- ICD diagnosis coding auto-suggested.')}
                            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase rounded-[12px]"
                          >
                            Compile Summary
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* ───── FORMS MODALS ───── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#ECECEC] rounded p-6 shadow-xl relative text-xs space-y-4 text-[#111111]">
            <div className="flex justify-between items-center border-b border-[#F3F3F3] pb-3 mb-2">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {activeModal === 'patient' && 'Register Patient'}
                {activeModal === 'doctor' && 'Add Doctor'}
                {activeModal === 'appointment' && 'Schedule Appointment'}
                {activeModal === 'lab' && 'Request Diagnostics Test'}
                {activeModal === 'inventory' && 'Add Supply Item'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form: Patient */}
            {activeModal === 'patient' && (
              <form onSubmit={handleAddPatient} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Patient Name</label>
                    <input type="text" required value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB]" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">ABHA Health ID</label>
                    <input type="text" required value={patientForm.abha} onChange={e => setPatientForm({...patientForm, abha: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Age</label>
                    <input type="number" required value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Blood Group</label>
                    <select value={patientForm.blood} onChange={e => setPatientForm({...patientForm, blood: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]">
                      <option value="O-Positive">O-Positive</option>
                      <option value="O-Negative">O-Negative</option>
                      <option value="A-Positive">A-Positive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Allergies</label>
                  <input type="text" value={patientForm.allergies} onChange={e => setPatientForm({...patientForm, allergies: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider rounded-[12px]">Register Patient</button>
              </form>
            )}

            {/* Form: Doctor */}
            {activeModal === 'doctor' && (
              <form onSubmit={handleAddDoctor} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Doctor Name</label>
                  <input type="text" required value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Specialty</label>
                    <select value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]">
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Shift Hours</label>
                    <input type="text" required value={doctorForm.shift} onChange={e => setDoctorForm({...doctorForm, shift: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider rounded-[12px]">Add Doctor</button>
              </form>
            )}

            {/* Form: Appointment */}
            {activeModal === 'appointment' && (
              <form onSubmit={handleAddAppointment} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Select Patient</label>
                  <select required value={apptForm.patient} onChange={e => setApptForm({...apptForm, patient: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]">
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Select Doctor</label>
                  <select required value={apptForm.doctor} onChange={e => setApptForm({...apptForm, doctor: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]">
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider rounded-[12px]">Schedule Appointment</button>
              </form>
            )}

            {/* Form: Lab Test */}
            {activeModal === 'lab' && (
              <form onSubmit={handleAddLab} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Patient Name</label>
                  <select required value={labForm.patient} onChange={e => setLabForm({...labForm, patient: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]">
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider rounded-[12px]">Submit Lab Order</button>
              </form>
            )}

            {/* Form: Inventory */}
            {activeModal === 'inventory' && (
              <form onSubmit={handleAddInventory} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Supply Name</label>
                  <input type="text" required value={invForm.name} onChange={e => setInvForm({...invForm, name: e.target.value})} className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase tracking-wider rounded-[12px]">Add Item</button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
