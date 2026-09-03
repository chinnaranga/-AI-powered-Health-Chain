import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import React, { Suspense } from 'react';
import ToastContainer from './components/Toast';
import ConnectionStatus from './components/ConnectionStatus';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './providers/AuthProvider';
import { FEATURES } from './config/features';
import Maintenance from './pages/Maintenance';
import CookieConsent from './components/common/CookieConsent';
import DeploymentUpdatePopup from './components/DeploymentUpdatePopup';
import AppRoutes from './routes';

/**
 * HealthChain Enterprise Application Root
 * Clean, high-performance root container delegating routing to modular route controllers.
 */

function App() {
    if (FEATURES.maintenanceMode) {
        return (
            <AuthProvider>
                <ErrorBoundary>
                    <Maintenance />
                </ErrorBoundary>
            </AuthProvider>
        );
    }

    return (
        <AuthProvider>
            <ErrorBoundary>
                <BrowserRouter>
                    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
                        <ConnectionStatus />
                        <ToastContainer />
                        <CookieConsent />
                        <DeploymentUpdatePopup />
                        <AnimatePresence mode="wait">
                            <Suspense
                                fallback={
                                    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                                            <p className="text-slate-400 font-medium text-sm animate-pulse">
                                                Loading HealthChain Infrastructure...
                                            </p>
                                        </div>
                                    </div>
                                }
                            >
                                <AppRoutes />
                            </Suspense>
                        </AnimatePresence>
                    </div>
                </BrowserRouter>
            </ErrorBoundary>
        </AuthProvider>
    );
}

export default App;
