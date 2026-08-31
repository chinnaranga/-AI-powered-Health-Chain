import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getSessionUser } from '../services/auth/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { setCurrentUser } = useAuthStore();

    useEffect(() => {
        getSessionUser()
            .then(async (sessionUser) => {
                if (sessionUser) {
                    const savedRole = localStorage.getItem('hc_role') || sessionUser.role || 'patient';
                    await setCurrentUser(sessionUser, savedRole);
                } else {
                    const localToken = localStorage.getItem('hc_token');
                    const savedUserStr = localStorage.getItem('hc_user');
                    if (localToken) {
                        let cachedUser = { uid: localToken, id: localToken };
                        if (savedUserStr) {
                            try { cachedUser = JSON.parse(savedUserStr); } catch (e) {}
                        }
                        const savedRole = localStorage.getItem('hc_role') || cachedUser.role || 'patient';
                        await setCurrentUser(cachedUser, savedRole);
                        return;
                    }

                    useAuthStore.setState({
                        user: null,
                        token: null,
                        role: null,
                        walletAddress: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            })
            .catch((err) => {
                console.warn('[AuthProvider Session Notice]', err);
            });
    }, [setCurrentUser]);

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthProvider;
