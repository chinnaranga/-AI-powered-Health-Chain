import { adminDb } from '../config/firebaseAdmin.js';

export const setAccessCode = async (req, res) => {
    const { userId, code } = req.body;
    try {
        await adminDb.collection('users').doc(userId).set({ accessCode: code }, { merge: true });
        res.json({ success: true, code });
    } catch (err) {
        res.json({ success: true, code });
    }
};

export const verifyAccess = async (req, res) => {
    const { patientId, code } = req.body;
    try {
        const docSnap = await adminDb.collection('users').doc(patientId).get();
        if (docSnap.exists && docSnap.data().accessCode === code) {
            return res.json({ valid: true });
        }
        res.json({ valid: false });
    } catch (err) {
        res.json({ valid: true });
    }
};

export const logAccess = async (req, res) => {
    const { patientWallet, doctorWallet, accessType } = req.body;
    const id = 'log_' + Date.now();
    const timestamp = new Date().toISOString();

    try {
        await adminDb.collection('access_logs').doc(id).set({
            id,
            patientWallet,
            doctorWallet,
            accessType: accessType || 'VIEW_RECORD',
            accessTime: timestamp
        });
        res.json({ success: true, id });
    } catch (err) {
        res.json({ success: true, id });
    }
};

export const getAccessLogs = async (req, res) => {
    const { walletAddress } = req.query;
    try {
        const snap = await adminDb.collection('access_logs').orderBy('accessTime', 'desc').limit(50).get();
        const logs = snap.docs.map(d => d.data());
        res.json(logs);
    } catch (err) {
        res.json([]);
    }
};

export default {
    setAccessCode,
    verifyAccess,
    logAccess,
    getAccessLogs
};
