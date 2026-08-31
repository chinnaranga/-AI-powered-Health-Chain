import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Shield, Sparkles, Building2, Check, ArrowRight, Loader } from 'lucide-react';
import { auth, db } from '../../firebase/config';

export default function HospitalOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [orgId, setOrgId] = useState(null);

  // Setup form states
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState(null);
  const [departments, setDepartments] = useState({
    Cardiology: true, Neurology: true, Pediatrics: true, Orthopedics: true, GeneralMedicine: true, Radiology: true, Laboratory: true, Pharmacy: true, Emergency: true
  });
  
  const [initialDoctors, setInitialDoctors] = useState([
    { name: 'Dr. Amanda Ross', specialty: 'General Medicine', shift: '09:00 AM - 05:00 PM' },
    { name: 'Dr. Marcus Vance', specialty: 'Pediatrics', shift: '10:00 AM - 06:00 PM' }
  ]);

  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: 'General Medicine', shift: '09:00 AM - 05:00 PM' });

  const [insurancePartners, setInsurancePartners] = useState({
    StarHealth: true, MaxBupa: true, HDFCErgo: true, ICICILombard: true
  });

  useEffect(() => {
    const checkOnboardingState = async () => {
      if (!auth.currentUser) {
        navigate('/hospital/login');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOrgId(userData.orgId);
          if (userData.onboardingCompleted) {
            navigate('/hospital/dashboard');
          }
        } else {
          setError('User profile details not found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingState();
  }, [navigate]);

  const handleAddDoctor = () => {
    if (newDoctor.name) {
      setInitialDoctors([...initialDoctors, newDoctor]);
      setNewDoctor({ name: '', specialty: 'General Medicine', shift: '09:00 AM - 05:00 PM' });
    }
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    setError(null);
    try {
      const orgDocRef = doc(db, 'hospital_organizations', orgId);
      await updateDoc(orgDocRef, {
        onboardingCompleted: true,
        departments: Object.keys(departments).filter(k => departments[k]),
        insurancePartners: Object.keys(insurancePartners).filter(k => insurancePartners[k]),
        setupCompletedAt: new Date().toISOString()
      });

      const doctorsCol = collection(db, 'hospital_doctors');
      const docPromises = initialDoctors.map(docData => {
        return addDoc(doctorsCol, {
          name: docData.name,
          specialty: docData.specialty,
          shift: docData.shift,
          orgId: orgId,
          status: 'On Duty',
          queue: 0,
          createdAt: new Date().toISOString()
        });
      });
      await Promise.all(docPromises);

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        onboardingCompleted: true
      });

      localStorage.setItem('hc_erp_org_id', orgId);
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#111111] flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-[#666666]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#111111] font-sans flex items-center justify-center p-6">
      
      <div className="w-full max-w-lg border border-[#ECECEC] rounded p-8 bg-white shadow-sm space-y-6">
        
        {/* Onboarding Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded bg-[#111111] flex items-center justify-center text-white mb-4">
            <Sparkles className="w-5 h-5 text-[#14B8A6]" />
          </div>
          <h2 className="font-sans text-xl font-bold uppercase tracking-wider text-[#111111]">
            Hospital Onboarding Setup
          </h2>
          <p className="text-xs text-[#666666] mt-1">
            Step {step} of 4: Setup initial clinical parameters.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-[#DC2626] border border-red-200/50 rounded-[12px] text-xs text-center font-bold">
            {error}
          </div>
        )}

        {/* ───── STEP 1: DEPARTMENTS ───── */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Activate Clinical Departments</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(departments).map((dept) => (
                <label key={dept} className="flex items-center gap-3 p-3 border border-[#ECECEC] rounded-[12px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={departments[dept]}
                    onChange={(e) => setDepartments({ ...departments, [dept]: e.target.checked })}
                    className="rounded border-[#ECECEC] text-[#2563EB] focus:ring-0"
                  />
                  <span className="font-bold text-[#111111]">{dept}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold uppercase tracking-wider rounded-[12px] flex justify-center items-center gap-2"
            >
              Continue to Doctors Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ───── STEP 2: DOCTORS REGISTRY ───── */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Add Initial Doctor List</h3>
            
            {/* Added doctors list */}
            <div className="space-y-2 max-h-40 overflow-y-auto border border-[#ECECEC] p-3 rounded-[12px] bg-[#F7F4EB]/30">
              {initialDoctors.map((doc, idx) => (
                <div key={idx} className="flex justify-between border-b border-[#ECECEC] pb-1.5 last:border-0 last:pb-0">
                  <span className="font-bold">{doc.name}</span>
                  <span className="text-[#666666]">{doc.specialty} ({doc.shift})</span>
                </div>
              ))}
            </div>

            {/* Input doctor fields */}
            <div className="p-3 border border-[#ECECEC] rounded-[12px] bg-white space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="Dr. Amanda Ross"
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Specialty</label>
                  <select
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#666666] mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={newDoctor.shift}
                    onChange={(e) => setNewDoctor({ ...newDoctor, shift: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddDoctor}
                className="w-full py-2.5 border border-[#111111] font-bold uppercase tracking-wider rounded-[12px]"
              >
                Add Doctor to Onboarding List
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-[#111111] font-bold uppercase rounded-[12px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase rounded-[12px]"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ───── STEP 3: INSURANCE PARTNERS ───── */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">Select Active Insurance Partners</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(insurancePartners).map((partner) => (
                <label key={partner} className="flex items-center gap-3 p-3 border border-[#ECECEC] rounded-[12px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={insurancePartners[partner]}
                    onChange={(e) => setInsurancePartners({ ...insurancePartners, [partner]: e.target.checked })}
                    className="rounded border-[#ECECEC] text-[#2563EB] focus:ring-0"
                  />
                  <span className="font-bold text-[#111111]">{partner}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-[#111111] font-bold uppercase rounded-[12px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase rounded-[12px]"
              >
                Review & Setup
              </button>
            </div>
          </div>
        )}

        {/* ───── STEP 4: REVIEW & COMPLETE ───── */}
        {step === 4 && (
          <div className="space-y-6 text-xs text-[#666666] leading-relaxed">
            <div className="p-4 bg-[#F7F4EB] rounded border border-[#ECECEC] space-y-2 text-[#111111]">
              <p><strong>Activated Departments:</strong> {Object.keys(departments).filter(k => departments[k]).join(', ')}</p>
              <p><strong>Configured Doctors count:</strong> {initialDoctors.length} doctors</p>
              <p><strong>Connected Insurers:</strong> {Object.keys(insurancePartners).filter(k => insurancePartners[k]).join(', ')}</p>
            </div>

            <p>
              By completing setup, you initialize the clinic ledger databases and configure role permissions scopes for practitioner credentials online syncing.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border border-[#111111] font-bold uppercase rounded-[12px]"
              >
                Back
              </button>
              <button
                onClick={handleCompleteSetup}
                disabled={saving}
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase rounded-[12px]"
              >
                {saving ? 'Saving config...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
