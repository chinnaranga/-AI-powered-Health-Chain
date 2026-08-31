import { createContext, useContext } from 'react';
import useAuthStore from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { 
        user, 
        isLoading, 
        error, 
        login, 
        logout, 
        register, 
        loginGoogle, 
        clearError 
    } = useAuthStore();

    const value = {
        user,
        loading: isLoading,
        error,
        login,
        logout,
        register,
        loginGoogle,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};
