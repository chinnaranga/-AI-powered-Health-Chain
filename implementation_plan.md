# Project Implementation Plan

## Phase 1: Environment and Repository Initialization
- Initialize a Monorepo containing `/src`, `/server`, and `/blockchain`.
- Configure Vite natively with React and ensure `package.json` contains combined scripts `npm run dev` running `concurrently` for the React Application, Node Server, and Hardhat node.

## Phase 2: Core Platform Infrastructure
- Set up SQLite Database. Include an authentication module simulating typical JWT features with password and role properties (Patient/Doctor).
- Create `AuthContext.js` for persistent frontend sessions bridging React State to the Database.
- Establish an Express server (`/server/server.js`) listening on port 3001 serving standard Web2 credentials.

## Phase 3: Smart Contract Deployment
- Structure `Healthcare.sol`. Use mappings `mapping(address => Record[]) public patientRecords;` and role-based access controllers mapping Doctors to verified Patients.
- Setup a script `/blockchain/scripts/deploy_manual.js` mapped locally to Hardhat running on `http://127.0.0.1:8545`. 

## Phase 4: IPFS Integration 
- Expose an `uploadToIPFS(file)` API route utilizing `ipfs-http-client`.
- Generate mathematical CID mappings ensuring cryptographical soundness (Base58, 46 characters) when a real active HTTP IPFS node is inactive to prevent front-end errors (`422 Unprocessable Content`).

## Phase 5: Modern UI/UX Development
- Build highly responsive, deeply nested React components (`DoctorDashboard`, `PatientDashboard`).
- Configure purely CSS-driven animations avoiding bloated dependencies. 
- Implement **Glassmorphism**, gradients, staggered entry animations (`Framer Motion`), and modern typography.
- Provide highly distinct user experiences differentiating "Administrators/Doctors" matching a clinical theme, against "Patients" looking more like personal dashboards. 

## Phase 6: Web3 Abstraction
- Connect the frontend securely into the blockchain abstraction layer without demanding MetaMask plugins. Hook straight to the default underlying Dev Wallet `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` for frictionless user onboarding.
- Abstract the Gas Fees by estimating transactions implicitly underneath the interface layer when uploading to IPFS.

## Phase 7: Delivery and Project Documentation
- Compile `task.md`, `README.md`, and `scalability_note.md` finalizing project deployment.

## Local Runbook
1. Start blockchain node:
   - `npm run chain`
2. Compile contract artifacts:
   - `npm run compile:contract`
3. Deploy contract to localhost and write address:
   - `npm run deploy:contract`
4. Start backend + frontend:
   - `npm run dev`
   - or `npm run dev:full` if you want chain + server + UI together

## Troubleshooting
- **Blockchain fallback mode shown in dashboard**
  - Ensure hardhat node is running on `127.0.0.1:8545`
  - Re-run `npm run deploy:contract` after restarting the node
- **Artifact/ABI import mismatch**
  - Re-run `npm run compile:contract`
  - Confirm frontend ABI path exists under `src/artifacts/contracts/Healthcare.sol/Healthcare.json`
- **Contract address mismatch**
  - Re-run `npm run deploy:contract` and verify `src/contract-address.json` was updated
- **Nodemon EMFILE / watcher limits on macOS**
  - Use legacy watch mode in script (`nodemon --legacy-watch`)
