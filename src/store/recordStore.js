import { create } from 'zustand';
import { blockchainService } from '../services/blockchain';

const KNOWN_DOCTORS_KEY = 'knownDoctorWallets';
const FALLBACK_REASON = {
    not_attempted: 'Not connected yet',
    connected: 'Connected',
    timeout: 'Connection timed out',
    unreachable: 'Local blockchain node is unreachable',
};

function getKnownDoctorWallets() {
    try {
        const raw = localStorage.getItem(KNOWN_DOCTORS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveKnownDoctorWallets(wallets) {
    const unique = [...new Set(wallets.filter(Boolean))];
    localStorage.setItem(KNOWN_DOCTORS_KEY, JSON.stringify(unique));
}

const useRecordStore = create((set, get) => ({
    records: [],
    uploadProgress: 0,
    isUploading: false,
    accessGrants: [],
    isLoading: false,
    blockchainConnected: false,
    fallbackReason: FALLBACK_REASON.not_attempted,
    selectedPatient: null,

    loadRecords: async ({
        role = 'patient',
        patientAddress = null,
        doctorAddress = null,
    } = {}) => {
        const fallbackRecords = [];
        const fallbackAccess = [];

        set({ isLoading: true });
        try {
            const connected = await blockchainService.connect(true);
            const currentAddress = await blockchainService.getCurrentAddress() || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            const targetPatient = patientAddress || currentAddress;
            const viewerDoctor = doctorAddress || currentAddress;
            const chainRecords = await blockchainService.getRecords(role, targetPatient, viewerDoctor);
            const connectionState = blockchainService.getConnectionStatus();

            const knownDoctors = getKnownDoctorWallets();
            let accessGrants = fallbackAccess;
            if (connected && knownDoctors.length > 0) {
                const checks = await Promise.all(
                    knownDoctors.map(async (wallet, index) => {
                        const hasAccess = await blockchainService.checkAccess(targetPatient, wallet);
                        return {
                            id: index + 1,
                            doctor: `Doctor ${index + 1}`,
                            wallet,
                            records: chainRecords.length,
                            granted: new Date().toISOString().split('T')[0],
                            status: hasAccess ? 'active' : 'revoked',
                        };
                    })
                );
                accessGrants = checks;
            }

            if (!chainRecords?.length) {
                set({
                    records: fallbackRecords,
                    accessGrants,
                    isLoading: false,
                    blockchainConnected: connected,
                    fallbackReason: FALLBACK_REASON[connectionState.reason] || FALLBACK_REASON.unreachable,
                    selectedPatient: targetPatient,
                });
                return;
            }
            const normalized = chainRecords.map((r, idx) => ({
                id: Number(r.id) || idx + 1,
                name: r.description || `Record ${idx + 1}`,
                cid: r.ipfsHash,
                date: new Date(r.timestamp).toISOString().split('T')[0],
                status: 'verified',
                type: 'Blockchain Record',
                size: 'N/A',
                txHash: r.hash || '',
            }));
            set({
                records: normalized,
                accessGrants,
                isLoading: false,
                blockchainConnected: true,
                fallbackReason: FALLBACK_REASON.connected,
                selectedPatient: targetPatient,
            });
        } catch {
            set({
                records: fallbackRecords,
                accessGrants: fallbackAccess,
                isLoading: false,
                blockchainConnected: false,
                fallbackReason: FALLBACK_REASON.unreachable,
            });
        }
    },

    uploadRecord: async (file) => {
        set({ isUploading: true, uploadProgress: 0 });

        // Simulated IPFS upload with progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 200));
            set({ uploadProgress: i });
        }
        try {
            const tx = await blockchainService.addRecord(file, file.name);
            const newRecord = {
                id: get().records.length + 1,
                name: file.name,
                cid: tx.ipfsHash,
                date: new Date().toISOString().split('T')[0],
                status: 'verified',
                type: 'Upload',
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                txHash: tx.hash,
            };

            set(state => ({
                records: [newRecord, ...state.records],
                isUploading: false,
                uploadProgress: 0,
                blockchainConnected: true,
                fallbackReason: FALLBACK_REASON.connected,
            }));
            return newRecord;
        } catch (error) {
            set({ isUploading: false, uploadProgress: 0, blockchainConnected: false });
            throw error;
        }
    },

    grantAccess: async (doctorAddress) => {
        const txHash = await blockchainService.grantAccess(doctorAddress);
        saveKnownDoctorWallets([...getKnownDoctorWallets(), doctorAddress]);
        const newGrant = {
            id: get().accessGrants.length + 1,
            doctor: 'Dr. Unknown',
            wallet: doctorAddress,
            records: 0,
            granted: new Date().toISOString().split('T')[0],
            status: 'active',
            txHash,
        };
        set(state => ({
            accessGrants: [...state.accessGrants, newGrant],
            blockchainConnected: true,
            fallbackReason: FALLBACK_REASON.connected,
        }));
        return txHash;
    },

    revokeAccess: async (grantIdOrWallet) => {
        const grant = get().accessGrants.find(g => g.id === grantIdOrWallet || g.wallet === grantIdOrWallet);
        let txHash = '';
        if (grant?.wallet) txHash = await blockchainService.revokeAccess(grant.wallet);
        set(state => ({
            accessGrants: state.accessGrants.map(g =>
                (g.id === grantIdOrWallet || g.wallet === grantIdOrWallet) ? { ...g, status: 'revoked', txHash } : g
            ),
            blockchainConnected: true,
            fallbackReason: FALLBACK_REASON.connected,
        }));
        return txHash;
    },

    setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}));

export default useRecordStore;
