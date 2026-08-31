# Scalability Note: Taking Blockchain Healthcare to Production

## Current Architecture
The application currently functions as a **Hybrid Web2/Web3 Application** utilizing:
- **SQLite** for rapid development of user session profiles, passwords, and clinical mapping (e.g. Roles, UI settings).
- **React (Vite/Node/Express)** handling routing and frontend presentation.
- **Local Hardhat Network** handling EVM (Ethereum Virtual Machine) emulation and Smart Contract state execution.
- **InterPlanetary File System (IPFS)** utilized functionally via Mock Data/Simulations mapping cryptographically valid CIDs (Content Identifiers).

## Limitations of Current Design
1. **Database Bottlenecking**: SQLite is meant for single-threaded file-based local access. It cannot sustain large concurrent user pools.
2. **Hardhat Blockchain Simulation**: Emulated chains do not propagate consensus mechanisms. They reset entirely upon service restart, losing transaction histories. 
3. **Public Gateway Dependency**: Resolving IPFS links uses arbitrary public gateways (like `ipfs.io`), exposing the app to variable latency, timeout unreliability, and potential censorship. 
4. **Key Management Insecurity**: Implicitly injecting private keys in the background limits friction but essentially eliminates Web3’s defining cryptographic trait: the patient holding explicit sole-custody of their own cryptographic signature keys. 
5. **Direct Contract Connectivity Limits**: Relying purely on singular RPC endpoints mapping to a monolith Express Node limits the TPS (Transactions Per Second) drastically.

## Recommended Scaling Path

### Phase 1: Storage and Central Servers 
- **Migrate Database**: Convert SQLite to **MongoDB** (NoSQL) or **PostgreSQL** (Relational). These architectures handle millions of concurrent queries perfectly.
- **Global CDNs**: Distribute the React Vite bundle via edge networks (Cloudflare, AWS CloudFront, Vercel) instead of local hosting.

### Phase 2: Decentralized Architecture (Web3)
- **Production Chain Deployment**: Deploy the access-control Smart Contract to a Layer 2 scaling solution utilizing Optimistic Rollups like **Arbitrum**, **Optimism**, or **Polygon**. Layer 2 networks drastically decrease Ethereum gas fees from tens of dollars down to mere fractions of a cent while supporting thousands of TPS.
- **Wallet Abstraction Hooks**: Replace injected literal Strings with **Account Abstraction Standard (ERC-4337)** using infrastructure like *Biconomy* or *Particle Network*. The user logs in via Socials (Google/Apple), the backend registers a Smart Contract Wallet for them implicitly, and the protocol pays their gas fees (Paymasters) achieving frictionless Web3 usage at a massive distributed scale.

### Phase 3: File Distribution 
- **Dedicated IPFS Pins**: Migrate from public gateway CIDs toward managed pinned services like **Pinata** or **Infura IPFS** maintaining guaranteed uptime, and encrypt files on the client-side *before* IPFS transit using AES-256 for HIPAA compliance.

### Conclusion 
The current build successfully proves out a "Concept" mapping user roles seamlessly across a highly-aesthetic frontend while distributing file hashes across a decentralized ledger avoiding metadata bloat. By implementing MongoDB and Layer 2 Rollups, the network will seamlessly adapt from supporting 10 simulated users to millions of verifiable distinct cryptographic patient identities relying on trustless architecture.
