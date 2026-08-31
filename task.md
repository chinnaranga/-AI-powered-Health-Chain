# Task: Secure Health Network with IPFS and Blockchain

## Objective
The goal is to develop an end-to-end web application that securely stores and retrieves patient medical records. The application utilizes a combination of **React (Vite)** for the frontend, **Node.js/Express** for a hybrid backend registry, and a local **EVM-compatible Blockchain (Hardhat)** combined with **IPFS** for immutable, decentralized data storage.

## Key Requirements
1. **Frontend Development**: 
   - A React-based interface utilizing responsive design.
   - Separate, distinct portal layouts for Patients and Doctors.
   - Patients can upload records (images, PDFs) seamlessly.
   - Doctors can search for patients and cryptographically verify access limits.
   
2. **Backend Development**:
   - Node.js and Express RESTful API.
   - Database to serve as an off-chain registry (handling user profiles, role assignments like Doctor vs Patient, and authentication).
   - JWT or equivalent session management (using simple secure local auth for dev).

3. **Blockchain & smart Contracts**:
   - Solidity smart contract to handle Access Control logic.
   - Cryptographically map "Doctors" to specific "Patients" through on-chain permissioning.
   - Store IPFS Content Identifiers (CIDs) on-chain for immutability.

4. **IPFS Integration**:
   - Decentralized file storage.
   - Generate cryptographically valid Base58 identifiers.

5. **Security & Friction**:
   - The UI should mask complex Web3 setups (no MetaMask popups required) utilizing background injected provider keys for a seamless Web2-like user experience.

---

## Current Progress Checklist

### 1. UI & UX Migration (Dark Mode)
- [x] Implement premium dark-themed color palette.
- [x] Refactor Sidebar, Topbar, and Layouts for visual consistency.
- [x] Replace `date-fns` with native JS utilities for deployment stability.

### 2. Security Enhancements (CRITICAL)
- [x] Set up Firestore Security Rules.
    - [x] Create `firestore.rules`.
    - [x] Configure `firebase.json`.
    - [x] Add `teamWorkspace` key to `src/config/features.js`
- [x] Modify `src/App.jsx` to apply `FeatureGuard` for disabled doctor routes
- [x] Refactor `src/components/Sidebar.jsx` to unify patient and doctor nav items, categorizing doctor navigation links and enabling the collapsible "Future Modules" accordion for the doctor role
- [x] Optimize the layout and styling of `src/pages/DoctorDashboard.jsx` to provide a premium clinical command center appearance
- [x] Ensure npm dependencies are completely restored and verified
- [x] Configure routes in `src/App.jsx` including `<FeatureGuard>` and the new `consent` route
- [x] Update `src/components/Sidebar.jsx` with refined `clinicalNavItems` and dynamic sections (hiding gated/disabled items completely for clinical role)
- [x] Create `src/pages/clinical/ConsentSessionsPage.jsx` for managing active consent sessions, emergency overrides, and cryptographic validation
- [x] Redesign `src/pages/clinical/ClinicalDashboard.jsx` into an enterprise-grade Clinical Command Center
- [x] Run production build `npm run build` and verify that all modifications compile without issues
- [x] Implement Firebase Cloud Function Trigger
  - [x] Update `functions/index.js` to define `RESEND_API_KEY` parameter
  - [x] Add lazy-loaded Resend client initialization in `functions/index.js`
  - [x] Implement welcome email HTML template in `functions/index.js`
  - [x] Write `sendWelcomeEmail` `onDocumentWritten` trigger on `users/{userId}`
- [x] Configure Frontend Signup Data and Verification Events
  - [x] Update `registerUser` in `src/firebase/auth.js` to send email verification and setup welcome flags

### 3. Functional Verification
- [x] Verify cross-account data isolation.
- [x] Test OTP-based access flow in production.
- [x] Audit log streaming verification.

### 4. Firestore Offline Fallback Support
- [x] Wrap Firestore database reads/writes in `src/firebase/auth.js` in try-catch blocks to catch offline/unavailability errors.
- [x] Fall back gracefully to user profile attributes from Firebase Auth when Firestore is offline.
- [x] Verify build and execution of the auth changes.

### 5. Patient Creation SMS Notification
- [x] Create `sms_logs` table in `server/config/db.js`
- [x] Create `server/routes/sms.js` endpoint
- [x] Mount SMS routes in `server/server.js`
- [x] Integrate SMS trigger in `src/pages/clinical/CreatePatient.jsx`
- [x] Verify functionality and build status

### 6. Onboarding Simplification & Light Mode
- [x] Remove dark container card background mismatch in `src/index.css`
- [x] Refactor `src/pages/PatientOnboarding.jsx` to render all sections as a 1-step form
- [x] Test compile with `npm run build`


