import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Lazy loaded public pages
const HealthChainLanding = lazy(() => import('../pages/HealthChainLanding'));
const PatientLogin = lazy(() => import('../pages/PatientLogin'));
const DoctorLogin = lazy(() => import('../pages/DoctorLogin'));
const ClinicalLogin = lazy(() => import('../pages/ClinicalLogin'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const PatientRegister = lazy(() => import('../pages/PatientRegister'));
const DoctorRegister = lazy(() => import('../pages/DoctorRegister'));
const ClinicalRegister = lazy(() => import('../pages/ClinicalRegister'));
const PatientForgotPassword = lazy(() => import('../pages/PatientForgotPassword'));
const DoctorForgotPassword = lazy(() => import('../pages/DoctorForgotPassword'));
const PatientVerifyOTP = lazy(() => import('../pages/PatientVerifyOTP'));
const DoctorVerifyOTP = lazy(() => import('../pages/DoctorVerifyOTP'));
const PatientOnboarding = lazy(() => import('../pages/PatientOnboarding'));
const DoctorOnboarding = lazy(() => import('../pages/DoctorOnboarding'));
const SelectRole = lazy(() => import('../pages/SelectRole'));
const RoleMismatch = lazy(() => import('../pages/RoleMismatch'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const BookDemo = lazy(() => import('../pages/BookDemo'));
const About = lazy(() => import('../pages/About'));
const PatientApp = lazy(() => import('../pages/PatientApp'));
const DoctorPortal = lazy(() => import('../pages/DoctorPortal'));
const LabGateway = lazy(() => import('../pages/LabGateway'));
const HospitalsSolution = lazy(() => import('../pages/HospitalsSolution'));
const ClinicsSolution = lazy(() => import('../pages/ClinicsSolution'));
const LaboratoriesSolution = lazy(() => import('../pages/LaboratoriesSolution'));
const InsurersSolution = lazy(() => import('../pages/InsurersSolution'));
const ApiReference = lazy(() => import('../pages/ApiReference'));
const Careers = lazy(() => import('../pages/Careers'));
const CareersAdmin = lazy(() => import('../pages/admin/CareersAdmin'));
const HealthChainR2Storage = lazy(() => import('../components/HealthChainR2Storage'));

export const publicRoutes = [
    <Route key="home" path="/" element={<><Navbar /><HealthChainLanding /></>} />,
    <Route key="patient-app" path="/patient-app" element={<PatientApp />} />,
    <Route key="doctor-portal" path="/doctor-portal" element={<DoctorPortal />} />,
    <Route key="lab-gateway" path="/lab-gateway" element={<LabGateway />} />,
    <Route key="solutions-hospitals" path="/solutions/hospitals" element={<HospitalsSolution />} />,
    <Route key="solutions-clinics" path="/solutions/clinics" element={<ClinicsSolution />} />,
    <Route key="solutions-laboratories" path="/solutions/laboratories" element={<LaboratoriesSolution />} />,
    <Route key="solutions-insurers" path="/solutions/insurers" element={<InsurersSolution />} />,
    <Route key="developers-api" path="/developers/api" element={<ApiReference />} />,
    <Route key="r2-storage" path="/r2-storage" element={<><Navbar /><HealthChainR2Storage /></>} />,
    <Route key="book-demo" path="/book-demo" element={<><Navbar /><BookDemo /></>} />,
    <Route key="about" path="/about" element={<><Navbar /><About /></>} />,
    <Route key="careers" path="/careers" element={<><Navbar /><Careers /></>} />,
    <Route key="careers-admin" path="/careers-admin" element={<><Navbar /><CareersAdmin /></>} />,
    <Route key="login" path="/login" element={<PatientLogin />} />,
    <Route key="login-patient" path="/login/patient" element={<PatientLogin />} />,
    <Route key="login-doctor" path="/login/doctor" element={<DoctorLogin />} />,
    <Route key="login-clinical" path="/login/clinical" element={<ClinicalLogin />} />,
    <Route key="login-admin" path="/login/admin" element={<AdminLogin />} />,
    <Route key="patient-login" path="/patient/login" element={<PatientLogin />} />,
    <Route key="doctor-login" path="/doctor/login" element={<DoctorLogin />} />,
    <Route key="patient-forgot" path="/patient/forgot-password" element={<PatientForgotPassword />} />,
    <Route key="doctor-forgot" path="/doctor/forgot-password" element={<DoctorForgotPassword />} />,
    <Route key="patient-otp" path="/patient/verify-otp" element={<PatientVerifyOTP />} />,
    <Route key="doctor-otp" path="/doctor/verify-otp" element={<DoctorVerifyOTP />} />,
    <Route key="onboarding" path="/onboarding" element={<PatientOnboarding />} />,
    <Route key="patient-onboarding" path="/patient/onboarding" element={<PatientOnboarding />} />,
    <Route key="doctor-onboarding-public" path="/doctor/onboarding" element={<DoctorOnboarding />} />,
    <Route key="register" path="/register" element={<><Navbar /><PatientRegister /></>} />,
    <Route key="register-patient" path="/register/patient" element={<><Navbar /><PatientRegister /></>} />,
    <Route key="patient-register" path="/patient/register" element={<><Navbar /><PatientRegister /></>} />,
    <Route key="register-doctor" path="/register/doctor" element={<><Navbar /><DoctorRegister /></>} />,
    <Route key="doctor-register" path="/doctor/register" element={<><Navbar /><DoctorRegister /></>} />,
    <Route key="register-clinical" path="/register/clinical" element={<><Navbar /><ClinicalRegister /></>} />,
    <Route key="select-role" path="/select-role" element={<SelectRole />} />,
    <Route key="role-mismatch" path="/role-mismatch" element={<RoleMismatch />} />,
    <Route key="verify-email" path="/verify-email" element={<VerifyEmail />} />
];

export default publicRoutes;
