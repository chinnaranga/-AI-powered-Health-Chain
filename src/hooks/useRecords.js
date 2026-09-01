import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import useAuthStore from '../store/authStore';

export function useRecords(options = {}) {
    const { fetchAll = false } = options;
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // ── Step 1: Wait for Auth & Store to resolve ────────────────────────
    useEffect(() => {
        const updateActiveUserId = () => {
            const storeUser = useAuthStore.getState().user;
            const currentToken = localStorage.getItem('hc_token');
            const targetId = auth.currentUser?.uid || storeUser?.uid || storeUser?.id || currentToken || 'patient_vault_default';
            setUserId(targetId);
        };

        updateActiveUserId();

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user?.uid) {
                setUserId(user.uid);
            } else {
                updateActiveUserId();
            }
            setIsLoading(false);
        });

        // Also subscribe to auth store updates
        const unsubStore = useAuthStore.subscribe((state) => {
            if (state.user?.uid || state.user?.id) {
                setUserId(state.user.uid || state.user.id);
            }
        });

        return () => {
            unsubAuth();
            unsubStore();
        };
    }, []);

    // ── Step 2: Real-time Firestore subscription ───────────────────────────
    useEffect(() => {
        setIsLoading(true);

        const storeUser = useAuthStore.getState().user;
        const validPatientIds = new Set([
            userId,
            storeUser?.uid,
            storeUser?.id,
            storeUser?.phoneNumber,
            'patient_vault_default'
        ].filter(Boolean));

        // Query all records collection and filter in subscription for multi-key identity matches
        const q = query(collection(db, 'records'));

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs || [];
                const formatted = docs
                    .map((doc, i) => {
                        const r = doc.data();
                        let dataObj = r.data;
                        try {
                            dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
                        } catch {}

                        // Normalize timestamps
                        const tsMs = r.createdAt?.seconds 
                            ? r.createdAt.seconds * 1000 
                            : (r.createdAt ? new Date(r.createdAt).getTime() : (Number(r.timestamp) || Date.now()));

                        return {
                            id: doc.id,
                            cid: r.cidHash || dataObj?.ipfsHash || r.hash || 'N/A',
                            timestamp: tsMs,
                            date: new Date(tsMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            name: r.fileName || dataObj?.name || dataObj?.description || `Medical Document ${i + 1}`,
                            type: r.category || dataObj?.type || 'Medical Document',
                            department: r.department || 'General Medicine',
                            status: r.verified ? 'verified' : 'pending',
                            txHash: r.blockchainHash || r.hash || '',
                            size: r.fileSize || dataObj?.size || '1.2 MB',
                            patientId: r.patientId || 'unknown',
                            doctorName: r.doctorName || 'Attending Staff',
                            fileUrl: r.fileUrl || ''
                        };
                    })
                    .filter((rec) => {
                        if (fetchAll) return true;
                        // Include if record belongs to current patient or uploaded in patient vault
                        return validPatientIds.has(rec.patientId) || rec.patientId === 'unknown';
                    });

                // Sort newest first
                formatted.sort((a, b) => b.timestamp - a.timestamp);
                setRecords(formatted);
                setIsLoading(false);
            },
            (err) => {
                console.error('[useRecords] Firestore error:', err.message);
                setIsLoading(false);
            }
        );

        return () => unsub();
    }, [userId, fetchAll]);

    return { records, isLoading };
}

export default useRecords;
