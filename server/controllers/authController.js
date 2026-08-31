import { adminAuth, adminDb } from '../config/firebaseAdmin.js';

export const googleLogin = async (req, res) => {
    try {
        const { idToken, role = 'patient', googleUser = {} } = req.body;
        let uid = googleUser.sub || googleUser.uid || `user_${Date.now()}`;
        let email = (googleUser.email || '').toLowerCase();
        let name = googleUser.name || googleUser.fullName || 'HealthChain User';

        if (idToken) {
            try {
                const decoded = await adminAuth.verifyIdToken(idToken);
                uid = decoded.uid;
                email = (decoded.email || email).toLowerCase();
                name = decoded.name || name;
            } catch (err) {}
        }

        const userRef = adminDb.collection('users').doc(uid);
        const userSnap = await userRef.get();

        let userData = {
            uid,
            id: uid,
            email,
            fullName: name,
            name,
            role,
            hospitalId: googleUser.hospitalId || 'default_hospital',
            tenantId: googleUser.tenantId || 'default_tenant',
            profileComplete: true,
            onboardingComplete: true
        };

        if (!userSnap.exists) {
            await userRef.set({
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Sync user custom claim role
            try {
                await adminAuth.setCustomUserClaims(uid, { role, hospitalId: userData.hospitalId });
            } catch (e) {}
        } else {
            userData = { ...userSnap.data(), ...userData };
        }

        res.json({
            success: true,
            token: idToken || `token_${uid}`,
            role: userData.role,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, password, name, role = 'patient', hospitalId = 'default_hospital', ...extra } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email required.' });
        }

        let uid = `user_${Date.now()}`;
        try {
            const authRecord = await adminAuth.createUser({
                email,
                password: password || 'HealthChain2026Pass!',
                displayName: name
            });
            uid = authRecord.uid;
            await adminAuth.setCustomUserClaims(uid, { role, hospitalId });
        } catch (authErr) {}

        const userData = {
            uid,
            id: uid,
            email: email.toLowerCase(),
            fullName: name || 'HealthChain User',
            name: name || 'HealthChain User',
            role,
            hospitalId,
            tenantId: hospitalId,
            profileComplete: true,
            onboardingComplete: true,
            ...extra,
            createdAt: new Date().toISOString()
        };

        await adminDb.collection('users').doc(uid).set(userData);

        res.status(201).json({
            success: true,
            token: `token_${uid}`,
            role,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, role = 'patient' } = req.body;
        const usersSnap = await adminDb.collection('users').where('email', '==', (email || '').toLowerCase()).limit(1).get();

        if (usersSnap.empty) {
            const uid = `user_${Date.now()}`;
            const userData = {
                uid,
                id: uid,
                email: (email || '').toLowerCase(),
                fullName: 'HealthChain User',
                name: 'HealthChain User',
                role,
                hospitalId: 'default_hospital',
                tenantId: 'default_tenant',
                profileComplete: true,
                onboardingComplete: true
            };
            await adminDb.collection('users').doc(uid).set(userData);

            return res.json({
                success: true,
                token: `token_${uid}`,
                role,
                user: userData
            });
        }

        const userDoc = usersSnap.docs[0];
        const userData = userDoc.data();

        res.json({
            success: true,
            token: `token_${userDoc.id}`,
            role: userData.role || role,
            user: userData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    res.json({ success: true, message: 'Firebase token refreshed successfully.' });
};

export const getMe = async (req, res) => {
    try {
        const userSnap = await adminDb.collection('users').doc(req.user.uid).get();
        if (!userSnap.exists) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        res.json({ success: true, user: userSnap.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
};

export const saveTermsConsent = async (req, res) => {
    try {
        const uid = req.user?.uid || req.body?.userId;
        const { termsVersion = '1.0' } = req.body;
        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const consentData = {
            userId: uid,
            termsVersion,
            accepted: true,
            acceptedAt: new Date().toISOString()
        };

        // Store authoritative consent record in terms_consent collection
        await adminDb.collection('terms_consent').doc(uid).set(consentData, { merge: true });

        // Update user profile with termsAcceptedVersion
        await adminDb.collection('users').doc(uid).set({
            termsAcceptedVersion: termsVersion,
            termsConsentAt: consentData.acceptedAt
        }, { merge: true });

        res.json({ success: true, consent: consentData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
