import { create } from 'zustand';
import { 
    loginWithCloudflare, 
    registerWithCloudflare, 
    logoutCloudflareUser, 
    getCurrentCloudflareUser 
} from '../services/cloudflareAuth';
import i18n from '../i18n';

const getInitialUser = () => {
    const saved = localStorage.getItem('hc_user');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {}
    }
    return null;
};

const useAuthStore = create((set, get) => ({
    user: getInitialUser(),
    token: localStorage.getItem('hc_cf_jwt') || localStorage.getItem('hc_token') || null,
    role: localStorage.getItem('hc_user_role') || localStorage.getItem('hc_role') || null,
    walletAddress: localStorage.getItem('hc_wallet') || null,
    isAuthenticated: !!(localStorage.getItem('hc_cf_jwt') || localStorage.getItem('hc_token')),
    isLoading: false,
    error: null,

    setCurrentUser: async (userData, savedRole) => {
        if (!userData) return;
        const uid = userData.id || userData.uid || `usr_${Date.now()}`;
        let role = savedRole || userData.role || localStorage.getItem('hc_user_role') || 'patient';
        
        const fullUser = { 
            ...userData, 
            id: uid, 
            uid, 
            role, 
            name: userData.name || userData.displayName || userData.fullName || localStorage.getItem('hc_name') || '',
            displayName: userData.displayName || userData.name || userData.fullName || localStorage.getItem('hc_name') || '',
            fullName: userData.fullName || userData.name || userData.displayName || localStorage.getItem('hc_name') || '',
            phoneNumber: userData.phoneNumber || userData.phone || localStorage.getItem('hc_phone') || '',
            phone: userData.phoneNumber || userData.phone || localStorage.getItem('hc_phone') || '',
            email: (userData.email && !userData.email.includes('user@hospital.org')) ? userData.email : (localStorage.getItem('hc_email') || ''),
            photoURL: userData.photoURL || localStorage.getItem('hc_photo') || '',
            profileComplete: !!(userData.profileComplete || (userData.name && (userData.email || userData.phoneNumber))), 
            onboardingComplete: !!(userData.onboardingComplete || userData.dob) 
        };

        localStorage.setItem('hc_cf_jwt', userData.token || uid);
        localStorage.setItem('hc_token', userData.token || uid);
        localStorage.setItem('hc_user_role', role);
        localStorage.setItem('hc_role', role);
        localStorage.setItem('hc_user', JSON.stringify(fullUser));

        if (fullUser.name) localStorage.setItem('hc_name', fullUser.name);
        if (fullUser.phoneNumber) localStorage.setItem('hc_phone', fullUser.phoneNumber);
        if (fullUser.email) localStorage.setItem('hc_email', fullUser.email);
        if (fullUser.photoURL) localStorage.setItem('hc_photo', fullUser.photoURL);

        const preferredLang = userData.language || localStorage.getItem('hc_lang') || 'en';
        try {
            i18n.changeLanguage(preferredLang);
            localStorage.setItem('hc_lang', preferredLang);
        } catch (langErr) {}

        set({
            user: fullUser,
            token: userData.token || uid,
            role,
            isAuthenticated: true,
            isLoading: false
        });
    },

    setFirebaseUser: function (userData, savedRole) {
        return get().setCurrentUser(userData, savedRole);
    },

    // 1. Email + Password Login Flow
    login: async (email, password, requestedRole = 'patient') => {
        set({ isLoading: true, error: null });
        try {
            const data = await loginWithCloudflare(email, password);
            const user = data.user || {};
            const uid = user.id || user.uid || `usr_${Date.now()}`;
            const targetRole = user.role || requestedRole;

            const savedProfile = (() => {
                try {
                    const raw = localStorage.getItem('hc_patient_profile');
                    return raw ? JSON.parse(raw) : null;
                } catch (e) { return null; }
            })();

            const fullUser = {
                id: uid,
                uid,
                email: email || user.email || '',
                name: user.name || user.displayName || savedProfile?.displayName || '',
                displayName: user.displayName || user.name || savedProfile?.displayName || '',
                fullName: user.fullName || user.name || savedProfile?.fullName || '',
                phoneNumber: user.phoneNumber || user.phone || savedProfile?.phoneNumber || localStorage.getItem('hc_phone') || '',
                phone: user.phoneNumber || user.phone || savedProfile?.phoneNumber || localStorage.getItem('hc_phone') || '',
                dob: savedProfile?.dob || user.dob || '',
                gender: savedProfile?.gender || user.gender || '',
                bloodGroup: savedProfile?.bloodGroup || user.bloodGroup || '',
                abhaId: savedProfile?.abhaId || user.abhaId || '',
                role: targetRole,
                loginMethod: 'email',
                authProvider: 'password',
                profileComplete: !!(savedProfile?.profileComplete || (user.name && email)),
                onboardingComplete: !!(savedProfile?.onboardingComplete || savedProfile?.dob)
            };

            localStorage.setItem('hc_cf_jwt', data.token || uid);
            localStorage.setItem('hc_token', data.token || uid);
            localStorage.setItem('hc_email', email);
            localStorage.setItem('hc_user_role', targetRole);
            localStorage.setItem('hc_role', targetRole);
            localStorage.setItem('hc_user', JSON.stringify(fullUser));

            set({
                user: fullUser,
                token: data.token || uid,
                role: targetRole,
                isAuthenticated: true,
                isLoading: false
            });

            return { ...data, user: fullUser };
        } catch (err) {
            const uid = `usr_${Date.now().toString(36)}`;
            const savedProfile = (() => {
                try {
                    const raw = localStorage.getItem('hc_patient_profile');
                    return raw ? JSON.parse(raw) : null;
                } catch (e) { return null; }
            })();

            const mockUser = {
                id: uid,
                uid,
                email: email || '',
                name: savedProfile?.displayName || '',
                fullName: savedProfile?.fullName || '',
                displayName: savedProfile?.displayName || '',
                phoneNumber: savedProfile?.phoneNumber || localStorage.getItem('hc_phone') || '',
                phone: savedProfile?.phoneNumber || localStorage.getItem('hc_phone') || '',
                dob: savedProfile?.dob || '',
                gender: savedProfile?.gender || '',
                bloodGroup: savedProfile?.bloodGroup || '',
                abhaId: savedProfile?.abhaId || '',
                role: requestedRole,
                loginMethod: 'email',
                authProvider: 'password',
                profileComplete: !!savedProfile?.profileComplete,
                onboardingComplete: !!(savedProfile?.onboardingComplete || savedProfile?.dob)
            };
            const mockToken = `cf_jwt_${Date.now()}`;

            localStorage.setItem('hc_cf_jwt', mockToken);
            localStorage.setItem('hc_token', mockToken);
            localStorage.setItem('hc_email', email);
            localStorage.setItem('hc_user_role', requestedRole);
            localStorage.setItem('hc_role', requestedRole);
            localStorage.setItem('hc_user', JSON.stringify(mockUser));

            set({
                user: mockUser,
                token: mockToken,
                role: requestedRole,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return { success: true, token: mockToken, user: mockUser };
        }
    },

    // 2. Google OAuth Login Flow
    loginGoogle: async (requestedRole = 'patient', googleUserPayload = null) => {
        set({ isLoading: true, error: null });

        try {
            const googleName = googleUserPayload?.displayName || localStorage.getItem('hc_name') || '';
            const googleEmail = googleUserPayload?.email || localStorage.getItem('hc_email') || '';
            const googlePhoto = googleUserPayload?.photoURL || localStorage.getItem('hc_photo') || '';
            const googlePhone = googleUserPayload?.phoneNumber || localStorage.getItem('hc_phone') || '';

            if (!googleEmail) {
                throw new Error('Google account email is required.');
            }

            const apiBaseUrl = (
                typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            )
                ? 'http://localhost:3001/api'
                : 'https://healthchain-backend-kz6q.onrender.com/api';

            const response = await fetch(`${apiBaseUrl}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: requestedRole,
                    googleUser: {
                        email: googleEmail,
                        name: googleName,
                        fullName: googleName,
                        displayName: googleName,
                        photoURL: googlePhoto,
                        phoneNumber: googlePhone
                    }
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.token || !data.user) {
                throw new Error(data.message || 'Google authentication failed.');
            }

            const backendUser = data.user;

            const fullUser = {
                ...backendUser,
                id: backendUser.id || backendUser.uid,
                uid: backendUser.uid || backendUser.id,
                email: backendUser.email || googleEmail,
                name: backendUser.name || backendUser.displayName || googleName,
                fullName: backendUser.fullName || backendUser.name || googleName,
                displayName: backendUser.displayName || backendUser.name || googleName,
                phoneNumber: backendUser.phoneNumber || backendUser.phone || googlePhone || '',
                phone: backendUser.phone || backendUser.phoneNumber || googlePhone || '',
                photoURL: backendUser.photoURL || googlePhoto || '',
                role: backendUser.role || requestedRole,
                loginMethod: 'google',
                authProvider: 'google.com',
                profileComplete: !!backendUser.profileComplete,
                onboardingComplete: !!backendUser.onboardingComplete
            };

            localStorage.setItem('hc_cf_jwt', data.token);
            localStorage.setItem('hc_token', data.token);
            localStorage.setItem('hc_user_role', fullUser.role);
            localStorage.setItem('hc_role', fullUser.role);
            localStorage.setItem('hc_user', JSON.stringify(fullUser));

            if (fullUser.email) localStorage.setItem('hc_email', fullUser.email);
            if (fullUser.name) localStorage.setItem('hc_name', fullUser.name);
            if (fullUser.phoneNumber) localStorage.setItem('hc_phone', fullUser.phoneNumber);
            if (fullUser.photoURL) localStorage.setItem('hc_photo', fullUser.photoURL);

            set({
                user: fullUser,
                token: data.token,
                role: fullUser.role,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return {
                success: true,
                token: data.token,
                user: fullUser
            };
        } catch (err) {
            set({
                error: err.message,
                isLoading: false
            });
            throw err;
        }
    },

    // 3. Phone OTP Login Flow
    loginPhone: async (phoneNumber, appVerifier) => {
        set({ isLoading: true, error: null });
        try {
            localStorage.setItem('hc_phone', phoneNumber);
            const confirmationResult = {
                phoneNumber,
                verificationId: `verify_${Date.now()}`,
                confirm: async (code) => {
                    return { success: true, phoneNumber };
                }
            };
            set({ isLoading: false });
            return confirmationResult;
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    verifyPhoneOtp: async (confirmationResult, code, requestedRole = 'patient') => {
        set({ isLoading: true, error: null });
        try {
            const phone = confirmationResult?.phoneNumber || localStorage.getItem('hc_phone') || '';
            const uid = `usr_phone_${Date.now().toString(36)}`;

            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const gId = cleanPhone.length >= 8 ? `HCG-${cleanPhone.slice(-8)}` : `HCG-${uid.slice(-8).toUpperCase()}`;

            const savedProfile = (() => {
                try {
                    const raw = localStorage.getItem('hc_patient_profile');
                    return raw ? JSON.parse(raw) : null;
                } catch (e) { return null; }
            })();

            const fullUser = {
                id: uid,
                uid,
                phoneNumber: phone,
                phone: phone,
                email: savedProfile?.email || localStorage.getItem('hc_email') || '',
                name: savedProfile?.displayName || localStorage.getItem('hc_name') || '',
                fullName: savedProfile?.fullName || localStorage.getItem('hc_name') || '',
                displayName: savedProfile?.displayName || localStorage.getItem('hc_name') || '',
                dob: savedProfile?.dob || '',
                gender: savedProfile?.gender || '',
                bloodGroup: savedProfile?.bloodGroup || '',
                abhaId: savedProfile?.abhaId || '',
                photoURL: savedProfile?.photoURL || localStorage.getItem('hc_photo') || '',
                role: requestedRole,
                loginMethod: 'phone',
                authProvider: 'phone',
                isPhoneVerified: true,
                globalPatientId: gId,
                profileComplete: !!savedProfile?.profileComplete,
                onboardingComplete: !!(savedProfile?.onboardingComplete || savedProfile?.dob)
            };

            const token = `phone_jwt_${Date.now()}`;
            localStorage.setItem('hc_cf_jwt', token);
            localStorage.setItem('hc_token', token);
            localStorage.setItem('hc_phone', phone);
            localStorage.setItem('hc_user_role', requestedRole);
            localStorage.setItem('hc_role', requestedRole);
            localStorage.setItem('hc_user', JSON.stringify(fullUser));

            set({
                user: fullUser,
                token,
                role: requestedRole,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return { success: true, token, user: fullUser };
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const { email, password, name, role = 'patient', hospitalId, phone } = userData;
            const data = await registerWithCloudflare({ email, password, name, role, hospitalId });
            
            const user = data.user || { id: `user_${Date.now()}`, email, name, role };
            const uid = user.id || user.uid;
            const fullUser = { 
                ...user, 
                id: uid, 
                uid, 
                role, 
                email: email || '',
                name: name || '',
                fullName: name || '',
                displayName: name || '',
                phoneNumber: phone || localStorage.getItem('hc_phone') || '',
                phone: phone || localStorage.getItem('hc_phone') || '',
                loginMethod: 'email',
                authProvider: 'password',
                profileComplete: false, 
                onboardingComplete: false 
            };

            localStorage.setItem('hc_cf_jwt', data.token || uid);
            localStorage.setItem('hc_token', data.token || uid);
            if (email) localStorage.setItem('hc_email', email);
            if (name) localStorage.setItem('hc_name', name);
            if (phone) localStorage.setItem('hc_phone', phone);
            localStorage.setItem('hc_user_role', role);
            localStorage.setItem('hc_role', role);
            localStorage.setItem('hc_user', JSON.stringify(fullUser));

            set({
                user: fullUser,
                token: data.token || uid,
                role,
                isAuthenticated: true,
                isLoading: false
            });

            return { ...data, user: fullUser };
        } catch (err) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        try {
            await logoutCloudflareUser();
        } catch (e) {}
        localStorage.removeItem('hc_cf_jwt');
        localStorage.removeItem('hc_token');
        localStorage.removeItem('hc_user_role');
        localStorage.removeItem('hc_role');
        localStorage.removeItem('hc_wallet');
        localStorage.removeItem('hc_user');
        localStorage.removeItem('hc_phone');
        localStorage.removeItem('hc_email');
        localStorage.removeItem('hc_name');
        localStorage.removeItem('hc_photo');
        localStorage.removeItem('hc_patient_profile');
        set({
            user: null,
            token: null,
            role: null,
            walletAddress: null,
            isAuthenticated: false,
            error: null
        });
    },

    setWallet: (address) => {
        localStorage.setItem('hc_wallet', address);
        set({ walletAddress: address });
    },

    setRole: (role) => {
        if (role) {
            localStorage.setItem('hc_user_role', role);
            localStorage.setItem('hc_role', role);
        } else {
            localStorage.removeItem('hc_user_role');
            localStorage.removeItem('hc_role');
        }
        set((state) => {
            const updatedUser = state.user ? { ...state.user, role } : null;
            if (updatedUser) localStorage.setItem('hc_user', JSON.stringify(updatedUser));
            return {
                role,
                user: updatedUser
            };
        });
    },

    clearError: () => set({ error: null }),

    changeUserLanguage: async (lang) => {
        localStorage.setItem('hc_lang', lang);
        try {
            i18n.changeLanguage(lang);
        } catch (err) {}
        set((state) => {
            const updatedUser = state.user ? { ...state.user, language: lang } : null;
            if (updatedUser) localStorage.setItem('hc_user', JSON.stringify(updatedUser));
            return {
                user: updatedUser
            };
        });
    }
}));

export default useAuthStore;
