import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, addDoc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { Shield, KeyRound, Building2, User, FileText, CheckCircle2, ArrowRight, ShieldAlert, BadgeInfo } from 'lucide-react';
import { auth, db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

export default function HospitalAuth({ mode = 'login' }) {
  const navigate = useNavigate();
  const { setFirebaseUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Registration wizard step-states
  const [registerStep, setRegisterStep] = useState(1);
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '', regNum: '', licenseNum: '', type: 'Multi-Specialty', ownership: 'Private', beds: '', estYear: ''
  });
  const [orgDetails, setOrgDetails] = useState({
    address: '', city: '', state: '', country: 'India', postalCode: ''
  });
  const [adminDetails, setAdminDetails] = useState({
    name: '', email: '', phone: '', designation: 'Chief Medical Officer', password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'hospital_admin' || userData.role === 'hospital_staff') {
          await setFirebaseUser(user, userData.role);
          
          if (!user.emailVerified) {
            navigate('/hospital/email-verification');
            return;
          }
          
          if (!userData.onboardingCompleted) {
            navigate('/hospital/onboarding');
          } else {
            navigate('/hospital/select-organization');
          }
        } else {
          setError('Unauthorized: Patient accounts cannot sign in to the hospital console.');
          await auth.signOut();
        }
      } else {
        setError('Clinician record not found. Make sure registration has been completed.');
        await auth.signOut();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminDetails.email, adminDetails.password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const orgRef = await addDoc(collection(db, 'hospital_organizations'), {
        name: hospitalInfo.name,
        regNum: hospitalInfo.regNum,
        licenseNum: hospitalInfo.licenseNum,
        type: hospitalInfo.type,
        ownership: hospitalInfo.ownership,
        beds: Number(hospitalInfo.beds),
        estYear: Number(hospitalInfo.estYear),
        address: orgDetails.address,
        city: orgDetails.city,
        state: orgDetails.state,
        country: orgDetails.country,
        postalCode: orgDetails.postalCode,
        adminId: user.uid,
        status: 'pending_verification',
        establishedDate: new Date().toISOString(),
        verified: false,
        onboardingCompleted: false
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: adminDetails.email,
        displayName: adminDetails.name,
        phone: adminDetails.phone,
        designation: adminDetails.designation,
        role: 'hospital_admin',
        orgId: orgRef.id,
        associatedOrgs: [orgRef.id],
        onboardingCompleted: false,
        emailVerified: false,
        createdAt: new Date().toISOString()
      });

      await setFirebaseUser(user, 'hospital_admin');
      setRegisterStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Reset link dispatched. Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setSuccess(null);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSuccess('Verification email resent.');
      } else {
        setError('No authenticated user session found.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-white text-[#111111] font-sans flex overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#FFFFFF] border-r border-[#ECECEC] p-16 flex-col justify-between items-start relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-white">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">HealthChain</span>
          </div>

          <div className="max-w-md space-y-6 relative z-10">
            <h1 className="text-4xl font-normal tracking-tight leading-[1.12]">
              Enterprise Healthcare<br />
              <span className="font-bold">Infrastructure.</span>
            </h1>
            <p className="text-sm text-[#666666] leading-relaxed">
              Consolidate clinical database networks under patient-sovereign cryptographic controls. Direct ABDM registrations, HL7/FHIR mappings, and smart claims clearing.
            </p>
            <div className="pt-6 border-t border-[#ECECEC]">
              <svg viewBox="0 0 200 40" className="w-full h-8 text-[#666666]">
                <line x1="0" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="60" cy="20" r="4" fill="#14B8A6" />
                <line x1="60" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="140" cy="20" r="4" fill="#2563EB" />
                <line x1="140" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              </svg>
            </div>
          </div>

          <div className="flex gap-4 text-[10px] font-mono text-[#666666] uppercase tracking-wider relative z-10">
            <span className="px-2.5 py-1 bg-[#F7F4EB] rounded border border-[#ECECEC]">HIPAA Safe</span>
            <span className="px-2.5 py-1 bg-[#F7F4EB] rounded border border-[#ECECEC]">GDPR Audited</span>
            <span className="px-2.5 py-1 bg-[#F7F4EB] rounded border border-[#ECECEC]">ABDM Ready</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-[#F7F4EB] p-8 md:p-16 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-sm bg-white border border-[#ECECEC] rounded p-8 shadow-sm space-y-6">
            <div className="text-center flex flex-col items-center">
              <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-[#111111]">
                Hospital Console Sign In
              </h2>
              <p className="text-xs text-[#666666] mt-1">Authenticate to access database nodes.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-[#DC2626] border border-red-200/50 rounded-[12px] text-xs flex gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs text-[#111111] rounded-[12px] focus:outline-none focus:border-[#2563EB] transition-all"
                  placeholder="admin@stjude.org"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/hospital/forgot-password')}
                    className="text-[10px] text-[#2563EB] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs text-[#111111] rounded-[12px] focus:outline-none focus:border-[#2563EB] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#ECECEC] text-[#2563EB] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-[#666666] select-none cursor-pointer">
                  Remember this terminal session
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2563EB] text-white font-bold uppercase tracking-wider text-xs rounded-[12px] hover:bg-[#1D4ED8] transition-colors flex justify-center items-center gap-2 mb-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>

              

              <div className="border-t border-[#ECECEC] pt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => navigate('/hospital/register')}
                  className="py-2.5 border border-[#ECECEC] rounded-[12px] hover:bg-[#F7F4EB]"
                >
                  Register Hospital
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/book-demo')}
                  className="py-2.5 border border-[#ECECEC] rounded-[12px] hover:bg-[#F7F4EB]"
                >
                  Book Demo
                </button>
              </div>

              <div className="border-t border-[#ECECEC] pt-4 space-y-2 text-center text-[10px] uppercase font-bold text-[#666666]">
                <span>Enterprise single sign-on</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button type="button" onClick={() => alert('Azure Active Directory Connect')} className="py-2 border border-[#ECECEC] rounded-[12px] bg-white font-semibold">Microsoft</button>
                  <button type="button" onClick={() => alert('Google Workspace SAML Connect')} className="py-2 border border-[#ECECEC] rounded-[12px] bg-white font-semibold">Workspace</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ───── RENDER OTHER AUTH MODES (CENTRALIZED CARD) ─────
  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#111111] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-lg border border-[#ECECEC] rounded p-8 bg-white shadow-sm space-y-6">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded bg-[#111111] flex items-center justify-center text-white mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-sans text-xl font-bold uppercase tracking-wider text-[#111111]">
            {mode === 'register' && `Hospital Registration (Step ${registerStep} of 5)`}
            {mode === 'forgot-password' && 'Password Reset Portal'}
            {mode === 'email-verification' && 'Awaiting Verification Link'}
          </h2>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-[#DC2626] border border-red-200/50 rounded-[12px] text-xs flex gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 text-[#16A34A] border border-emerald-200/50 rounded-[12px] text-xs flex gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* REGISTER HOSPITAL WIZARD */}
        {mode === 'register' && (
          <div className="space-y-6">
            {registerStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Hospital Name</label>
                  <input
                    type="text"
                    value={hospitalInfo.name}
                    onChange={(e) => setHospitalInfo({ ...hospitalInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px] focus:outline-none focus:border-[#2563EB]"
                    placeholder="St. Jude Specialty Hospital"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Reg Number</label>
                    <input
                      type="text"
                      value={hospitalInfo.regNum}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, regNum: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">License Number</label>
                    <input
                      type="text"
                      value={hospitalInfo.licenseNum}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, licenseNum: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Hospital Type</label>
                    <select
                      value={hospitalInfo.type}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, type: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    >
                      <option value="Multi-Specialty">Multi-Specialty</option>
                      <option value="General Clinic">General Clinic</option>
                      <option value="Pathology Lab">Pathology Lab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Ownership</label>
                    <select
                      value={hospitalInfo.ownership}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, ownership: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    >
                      <option value="Private">Private</option>
                      <option value="Government Owned">Government Owned</option>
                      <option value="Charitable">Charitable</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Number of Beds</label>
                    <input
                      type="number"
                      value={hospitalInfo.beds}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, beds: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Established Year</label>
                    <input
                      type="number"
                      value={hospitalInfo.estYear}
                      onChange={(e) => setHospitalInfo({ ...hospitalInfo, estYear: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setRegisterStep(2)}
                  className="w-full py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded-[12px]"
                >
                  Continue to Address
                </button>
              </div>
            )}

            {registerStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Street Address</label>
                  <input
                    type="text"
                    value={orgDetails.address}
                    onChange={(e) => setOrgDetails({ ...orgDetails, address: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">City</label>
                    <input
                      type="text"
                      value={orgDetails.city}
                      onChange={(e) => setOrgDetails({ ...orgDetails, city: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">State</label>
                    <input
                      type="text"
                      value={orgDetails.state}
                      onChange={(e) => setOrgDetails({ ...orgDetails, state: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={orgDetails.postalCode}
                      onChange={(e) => setOrgDetails({ ...orgDetails, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Country</label>
                    <input
                      type="text"
                      readOnly
                      value={orgDetails.country}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#F7F4EB] text-xs rounded-[12px]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRegisterStep(1)} className="flex-1 py-3 border border-[#111111] text-xs font-bold uppercase rounded-[12px]">Back</button>
                  <button onClick={() => setRegisterStep(3)} className="flex-1 py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">Continue</button>
                </div>
              </div>
            )}

            {registerStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Administrator Full Name</label>
                  <input
                    type="text"
                    value={adminDetails.name}
                    onChange={(e) => setAdminDetails({ ...adminDetails, name: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={adminDetails.email}
                    onChange={(e) => setAdminDetails({ ...adminDetails, email: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={adminDetails.phone}
                      onChange={(e) => setAdminDetails({ ...adminDetails, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Designation</label>
                    <input
                      type="text"
                      value={adminDetails.designation}
                      onChange={(e) => setAdminDetails({ ...adminDetails, designation: e.target.value })}
                      className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Password</label>
                  <input
                    type="password"
                    value={adminDetails.password}
                    onChange={(e) => setAdminDetails({ ...adminDetails, password: e.target.value })}
                    className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRegisterStep(2)} className="flex-1 py-3 border border-[#111111] text-xs font-bold uppercase rounded-[12px]">Back</button>
                  <button onClick={() => setRegisterStep(4)} className="flex-1 py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">Continue</button>
                </div>
              </div>
            )}

            {registerStep === 4 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#F7F4EB] rounded border border-[#ECECEC] text-[11px] leading-relaxed text-[#666666]">
                  Upload credential documents for NABH, license verification checks.
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Hospital License</label>
                  <input type="file" className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded-[12px] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">NABH Certificate</label>
                  <input type="file" className="w-full p-2 border border-[#ECECEC] bg-white text-xs rounded-[12px] cursor-pointer" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRegisterStep(3)} className="flex-1 py-3 border border-[#111111] text-xs font-bold uppercase rounded-[12px]">Back</button>
                  <button onClick={handleRegister} disabled={loading} className="flex-1 py-3 bg-[#2563EB] text-white text-xs font-bold uppercase rounded-[12px]">
                    {loading ? 'Registering...' : 'Register Hospital'}
                  </button>
                </div>
              </div>
            )}

            {registerStep === 5 && (
              <div className="text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-[#16A34A]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm">Registration submitted successfully.</h4>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Your organization is currently under verification. Confirm email verification and sign in.
                </p>
                <button onClick={() => navigate('/hospital/login')} className="w-full py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#666666] mb-1">Corporate Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#ECECEC] bg-[#E8F0FE] text-xs rounded-[12px]"
                placeholder="admin@stjude.org"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#111111] text-white text-xs font-bold uppercase rounded-[12px]">
              {loading ? 'Dispatched request...' : 'Send Reset Link'}
            </button>
            <div className="text-center pt-2">
              <button type="button" onClick={() => navigate('/hospital/login')} className="text-xs text-[#666666] hover:underline">Return to Login</button>
            </div>
          </form>
        )}

        {/* EMAIL VERIFICATION */}
        {mode === 'email-verification' && (
          <div className="space-y-6 text-center text-xs">
            <div className="p-4 bg-[#F7F4EB] rounded border border-[#ECECEC] text-[#666666] leading-relaxed">
              Verify your email address using the link dispatched to unlock your console session.
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleResendVerification} className="w-full py-3 bg-[#111111] text-white font-bold uppercase tracking-wider rounded-[12px]">
                Resend Verification Link
              </button>
              <button
                onClick={() => {
                  if (auth.currentUser) {
                    auth.currentUser.reload().then(() => {
                      if (auth.currentUser.emailVerified) {
                        navigate('/hospital/select-organization');
                      } else {
                        setError('Email verification pending.');
                      }
                    });
                  }
                }}
                className="w-full py-3 border border-[#ECECEC] font-bold uppercase tracking-wider rounded-[12px] hover:bg-[#F7F4EB]/35"
              >
                Verified check
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
