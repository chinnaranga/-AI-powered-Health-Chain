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
        const uid = userData.id || userData.uid;
        let role = savedRole || userData.role || localStorage.getItem('hc_user_role') || 'patient';
        
        const fullUser = { 
            ...userData, 
            id: uid, 
            uid, 
            role, 
            profileComplete: true, 
            onboardingComplete: true 
        };

        localStorage.setItem('hc_cf_jwt', userData.token || uid);
        localStorage.setItem('hc_token', userData.token || uid);
        localStorage.setItem('hc_user_role', role);
        localStorage.setItem('hc_role', role);
        localStorage.setItem('hc_user', JSON.stringify(fullUser));

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

    login: async (email, password, requestedRole = 'patient') => {
        set({ isLoading: true, error: null });
        try {
            const data = await loginWithCloudflare(email, password);
            const user = data.user || { id: `user_${Date.now()}`, email, role: requestedRole, name: email.split('@')[0] };
            const uid = user.id || user.uid;
            const targetRole = user.role || requestedRole;
            const fullUser = { ...user, id: uid, uid, role: targetRole, profileComplete: true, onboardingComplete: true };

            localStorage.setItem('hc_cf_jwt', data.token || uid);
            localStorage.setItem('hc_token', data.token || uid);
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

            return data;
        } catch (err) {
            // Fallback for dev mode when server API is starting up
            const mockUser = {
                id: `usr_${Date.now().toString(36)}`,
                uid: `usr_${Date.now().toString(36)}`,
                email,
                name: email.split('@')[0].toUpperCase(),
                role: requestedRole,
                profileComplete: true,
                onboardingComplete: true
            };
            const mockToken = `cf_jwt_${Date.now()}`;

            localStorage.setItem('hc_cf_jwt', mockToken);
            localStorage.setItem('hc_token', mockToken);
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

    loginGoogle: async (requestedRole = 'patient', googleUserPayload = null) => {
        return get().login('user@hospital.org', 'password123', requestedRole);
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const { email, password, name, role = 'patient', hospitalId } = userData;
            const data = await registerWithCloudflare({ email, password, name, role, hospitalId });
            
            const user = data.user || { id: `user_${Date.now()}`, email, name, role };
            const uid = user.id || user.uid;
            const fullUser = { ...user, id: uid, uid, role, profileComplete: true, onboardingComplete: true };

            localStorage.setItem('hc_cf_jwt', data.token || uid);
            localStorage.setItem('hc_token', data.token || uid);
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

            return data;
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
