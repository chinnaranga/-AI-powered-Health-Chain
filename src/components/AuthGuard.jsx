import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingOverlay from './LoadingOverlay';
import { FEATURES } from '../config/features';
import { toast } from './Toast';

/**
 * AuthGuard - Protected Route Wrapper.
 * Prevents rendering layouts early, managing the authentication hydration flow cleanly.
 */
export default function AuthGuard({ children, basePath }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const { isAuthenticated, isLoading, role, user } = useAuthStore();

    useEffect(() => {
        if (isLoading) return;

        // If the store has finished loading/hydrating and user is not authenticated, redirect
        if (!isAuthenticated) {
            console.info('[AuthGuard] Not authenticated, redirecting to login.');
            navigate('/login', { replace: true });
            return;
        }

        // If user is authenticated but has no role, redirect to select-role
        if (role === null || role === undefined) {
            console.info('[AuthGuard] No role assigned, redirecting to select-role.');
            navigate('/select-role', { replace: true });
            return;
        }

        // When onboarding feature flag is false or user has completed profile, consider profile complete
        const isProfileComplete = FEATURES.onboarding === false ? true : (user?.profileComplete === true || user?.onboardingComplete === true);

        // 1. Handle onboarding route specific rules first
        if (role === 'patient') {
            if (!isProfileComplete) {
                if (currentPath !== '/onboarding' && currentPath !== '/dashboard/patient/onboarding') {
                    console.info('[AuthGuard] Patient profile incomplete, redirecting to onboarding.');
                    navigate('/onboarding', { replace: true });
                    return;
                }
                // Allow user to stay on /onboarding page while completing profile
                if (currentPath === '/onboarding' || currentPath === '/dashboard/patient/onboarding') {
                    return;
                }
            } else {
                if (currentPath === '/onboarding') {
                    console.info('[AuthGuard] Patient profile complete. Proceeding to verification check or dashboard.');
                }
            }
        } else if (role === 'doctor') {
            if (!isProfileComplete) {
                if (currentPath !== '/dashboard/doctor/onboarding') {
                    console.info('[AuthGuard] Doctor profile incomplete, redirecting to onboarding.');
                    navigate('/dashboard/doctor/onboarding', { replace: true });
                    return;
                }
                if (currentPath === '/dashboard/doctor/onboarding') {
                    return;
                }
            }
        } else if (role === 'clinical') {
            if (currentPath === '/onboarding' || currentPath === '/dashboard/patient/onboarding' || currentPath === '/dashboard/doctor/onboarding') {
                console.warn('[AuthGuard] Clinical user attempted to access onboarding, redirecting.');
                navigate('/dashboard/clinical', { replace: true });
                return;
            }
        }

        // 2. Handle email verification check after onboarding is completed
        const isEmailVerified = user?.emailVerified !== false;
        if (!isEmailVerified) {
            console.warn('[AuthGuard] Email not verified, blocking access and redirecting to verify page.');
            if (currentPath !== '/verify-email') {
                toast.info('Please verify your email address to continue.');
                navigate('/verify-email', { replace: true });
            }
            return;
        }

        // Determine expected role from the basePath (e.g. "/dashboard/patient" or "/patient" -> "patient")
        let expectedRole = null;
        if (basePath?.startsWith('/dashboard/')) {
            expectedRole = basePath.split('/')[2];
        } else if (basePath?.startsWith('/patient')) {
            expectedRole = 'patient';
        }

        if (expectedRole && role !== expectedRole) {
            console.warn(`[AuthGuard] Role mismatch! User has role: ${role}, attempted to access: ${expectedRole}. Redirecting to correct dashboard.`);
            const targetRedirect = role === 'patient' ? '/patient/dashboard' : `/dashboard/${role}`;
            navigate(targetRedirect, { replace: true });
            return;
        }
    }, [isLoading, isAuthenticated, role, basePath, navigate, user, currentPath]);

    // Show loading overlay during authentication state hydration
    if (isLoading) {
        return <LoadingOverlay message="Securing your medical identity..." />;
    }

    // Determine expected role for rendering permission
    let expectedRole = null;
    if (basePath?.startsWith('/dashboard/')) {
        expectedRole = basePath.split('/')[2];
    } else if (basePath?.startsWith('/patient')) {
        expectedRole = 'patient';
    }
    const isProfileComplete = FEATURES.onboarding === false ? true : (user?.profileComplete === true || user?.onboardingComplete === true);

    // Authorization check
    let isAuthorized = false;
    if (isAuthenticated && role) {
        const isVerified = user?.emailVerified !== false;

        if (!isVerified) {
            isAuthorized = false;
        } else {
            if (role === 'patient') {
                if (currentPath === '/onboarding' || currentPath === '/dashboard/patient/onboarding') {
                    isAuthorized = !isProfileComplete || currentPath === '/dashboard/patient/onboarding';
                } else {
                    isAuthorized = isProfileComplete && (!expectedRole || role === expectedRole);
                }
            } else if (role === 'doctor') {
                if (currentPath === '/dashboard/doctor/onboarding') {
                    isAuthorized = true;
                } else {
                    isAuthorized = isProfileComplete && (!expectedRole || role === expectedRole);
                }
            } else if (role === 'clinical') {
                if (currentPath !== '/onboarding' && currentPath !== '/dashboard/patient/onboarding' && currentPath !== '/dashboard/doctor/onboarding') {
                    isAuthorized = (!expectedRole || role === expectedRole);
                }
            } else {
                isAuthorized = (!expectedRole || role === expectedRole);
            }
        }
    }

    return isAuthorized ? children : null;
}
