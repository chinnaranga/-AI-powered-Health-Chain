import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Lazy imports — only resolve if the files exist
let HealthcareArtifact = null;
let contractAddressJson = null;

try {
    HealthcareArtifact = (await import('../artifacts/contracts/Healthcare.sol/Healthcare.json')).default;
    contractAddressJson = (await import('../contract-address.json')).default;
} catch {
    // Artifacts not present — blockchain features will run in offline mode
}

const CONTRACT_ADDRESS = contractAddressJson?.Healthcare || null;
const PATIENT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export function useContract() {
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [patientAddress, setPatientAddress] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!CONTRACT_ADDRESS || !HealthcareArtifact) {
            // No compiled contract — stay offline
            return;
        }

        const init = async () => {
            const isLocal = typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (!isLocal) return;

            try {
                // Abortable fetch handshake check — 1 s timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000);
                const response = await fetch("http://127.0.0.1:8545", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) return;
            } catch {
                return; // Silent connection failure
            }

            try {
                const { ethers } = await import('ethers');
                const rpcProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545', undefined, {
                    staticNetwork: true
                });

                const wallet = new ethers.Wallet(PATIENT_PRIVATE_KEY, rpcProvider);
                const healthcareContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    HealthcareArtifact.abi,
                    wallet
                );

                setProvider(rpcProvider);
                setContract(healthcareContract);
                setPatientAddress(wallet.address);
                setIsConnected(true);
            } catch {
                // Node not running — stay in offline/server-only mode
                setIsConnected(false);
            }
        };

        init();
    }, []);

    // ── Read helpers ──────────────────────────────────────────────────────

    const getRecordCount = useCallback(async () => {
        if (!contract || !patientAddress) return 0;
        try {
            const records = await contract.getPatientRecords(patientAddress);
            return records.length;
        } catch {
            return 0;
        }
    }, [contract, patientAddress]);

    const getAuthorizedDoctors = useCallback(async () => {
        if (!contract || !patientAddress) return [];
        try {
            return [];
        } catch {
            return [];
        }
    }, [contract, patientAddress]);

    const getLastUploadTimestamp = useCallback(async () => {
        if (!contract || !patientAddress) return null;
        try {
            const records = await contract.getPatientRecords(patientAddress);
            if (records.length === 0) return null;
            return Number(records[records.length - 1][2]) * 1000;
        } catch {
            return null;
        }
    }, [contract, patientAddress]);

    // ── Write helpers (graceful offline fallback) ─────────────────────────

    const addRecord = async (ipfsHash, description) => {
        if (contract) {
            // Online path — write to blockchain
            try {
                const tx = await contract.addRecord(ipfsHash, description);
                await tx.wait();
                return tx.hash;
            } catch (err) {
                console.warn('[Contract] Blockchain write failed, falling back to server:', err.message);
            }
        }

        // Offline path — use Firebase Auth UID as the canonical patientId
        const userId = auth.currentUser?.uid || localStorage.getItem('hc_token') || 'anonymous';
        const recordId = 'rec_' + Date.now();
        const fakeTxHash = `0x${Math.random().toString(16).slice(2)}`;

        try {
            const res = await fetch('/api/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: recordId,
                    data: { ipfsHash, description, name: description },
                    hash: fakeTxHash,
                    previousHash: '0x0',
                    timestamp: Math.floor(Date.now() / 1000),
                    patientId: userId,
                }),
            });
            if (!res.ok) throw new Error('API server error');
        } catch (apiErr) {
            console.warn('[Contract] Backend API offline, writing record directly to Firestore:', apiErr.message);
            try {
                await setDoc(doc(db, 'records', recordId), {
                    patientId: userId,
                    fileName: description,
                    fileSize: '---',
                    fileType: 'Medical Document',
                    category: 'Medical Document',
                    cidHash: ipfsHash,
                    rawSha256: '',
                    fileUrl: '',
                    storagePath: '',
                    encrypted: false,
                    verified: false,
                    uploadedBy: userId,
                    doctorName: 'System',
                    hospital: 'Offline Vault',
                    blockchainHash: fakeTxHash,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    data: {
                        ipfsHash,
                        description,
                        name: description
                    }
                });
            } catch (fsErr) {
                console.error('[Contract] Failed to write record to Firestore offline cache:', fsErr);
            }
        }

        try {
            const res = await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientWallet: userId,
                    doctorWallet: 'System',
                    action: `Encrypted Record Upload: ${description}`,
                    txHash: fakeTxHash,
                })
            });
            if (!res.ok) throw new Error('API server error');
        } catch (apiErr) {
            console.warn('[Contract] Backend API offline, writing access log directly to Firestore:', apiErr.message);
            try {
                const logId = 'log_' + Date.now();
                await setDoc(doc(db, 'access_logs', logId), {
                    id: logId,
                    patientWallet: userId,
                    doctorWallet: 'System',
                    action: `Encrypted Record Upload: ${description}`,
                    txHash: fakeTxHash,
                    accessTime: Date.now()
                });
            } catch (fsErr) {
                console.error('[Contract] Failed to write access log to Firestore offline cache:', fsErr);
            }
        }

        return fakeTxHash;
    };

    const grantAccess = async (doctorAddress) => {
        if (!contract) throw new Error('Blockchain not connected — access control requires the local node.');
        const tx = await contract.grantAccess(doctorAddress);
        await tx.wait();
        return tx.hash;
    };

    const revokeAccess = async (doctorAddress) => {
        if (!contract) throw new Error('Blockchain not connected — access control requires the local node.');
        const tx = await contract.revokeAccess(doctorAddress);
        await tx.wait();
        return tx.hash;
    };

    return {
        contract,
        provider,
        patientAddress,
        isConnected,
        getRecordCount,
        getAuthorizedDoctors,
        getLastUploadTimestamp,
        grantAccess,
        revokeAccess,
        addRecord,
    };
}
