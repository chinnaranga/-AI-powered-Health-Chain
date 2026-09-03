import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingOverlay from './LoadingOverlay';
import { FEATURES } from '../config/features';
import { toast } from './Toast';
import { hasUserAcceptedCurrentTerms } from '../services/termsConsentService';

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

        // Enforce Terms & Conditions acceptance check before accessing protected application areas
        const isTermsAccepted = hasUserAcceptedCurrentTerms(user);
        if (!isTermsAccepted) {
            if (currentPath !== '/terms/accept') {
                console.info('[AuthGuard] Current Terms & Conditions not accepted, redirecting to /terms/accept.');
                navigate('/terms/accept', { replace: true, state: { from: location.pathname } });
                return;
            }
            return;
        }

        // Check if user is a brand new registrant requiring initial onboarding
        const isNewUser = user?.isNewUser === true || sessionStorage.getItem('hc_is_new_user') === 'true';
        const isProfileComplete = FEATURES.onboarding === false ? true : (user?.profileComplete === true || user?.onboardingComplete === true);

        // 1. Handle onboarding route rules
        if (role === 'patient') {
            // ONLY redirect to onboarding if this is a newly registered user who has never set up their profile
            if (isNewUser && !isProfileComplete) {
                if (currentPath !== '/onboarding' && currentPath !== '/dashboard/patient/onboarding' && currentPath !== '/patient/onboarding') {
                    console.info('[AuthGuard] New patient registration, navigating to initial onboarding.');
                    navigate('/patient/onboarding', { replace: true });
                    return;
                }
                if (currentPath === '/onboarding' || currentPath === '/dashboard/patient/onboarding' || currentPath === '/patient/onboarding') {
                    return;
                }
            } else {
                // Existing user: Do NOT force redirect to onboarding.
                // If profile is missing details, notify the user once per session.
                if (!isProfileComplete && !sessionStorage.getItem('hc_profile_notice_sent')) {
                    sessionStorage.setItem('hc_profile_notice_sent', 'true');
                    toast.info('Profile Notice: Some health profile details are pending. You can update them anytime in Profile Settings.');
                }
            }
        } else if (role === 'doctor') {
            const docStatus = user?.status || 'active';
            if (docStatus === 'pending') {
                if (currentPath !== '/doctor/pending-approval') {
                    console.info('[AuthGuard] Doctor account pending approval, redirecting to status screen.');
                    navigate('/doctor/pending-approval', { replace: true });
                    return;
                }
                return;
            } else if (docStatus === 'rejected') {
                if (currentPath !== '/doctor/rejected') {
                    console.info('[AuthGuard] Doctor account rejected, redirecting.');
                    navigate('/doctor/rejected', { replace: true });
                    return;
                }
                return;
            } else {
                // Doctor is active
                if (currentPath === '/doctor/pending-approval' || currentPath === '/doctor/rejected') {
                    navigate('/doctor/dashboard', { replace: true });
                    return;
                }
                if (!isProfileComplete && !sessionStorage.getItem('hc_doc_profile_notice_sent')) {
                    sessionStorage.setItem('hc_doc_profile_notice_sent', 'true');
                    toast.info('Profile Notice: You can complete missing clinical details in Doctor Settings.');
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
        } else if (basePath?.startsWith('/doctor')) {
            expectedRole = 'doctor';
        }

        if (expectedRole && role !== expectedRole) {
            console.warn(`[AuthGuard] Role mismatch! User has role: ${role}, attempted to access: ${expectedRole}. Redirecting to correct dashboard.`);
            const targetRedirect = role === 'patient' ? '/patient/dashboard' : (role === 'doctor' ? '/doctor/dashboard' : `/dashboard/${role}`);
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
    } else if (basePath?.startsWith('/doctor')) {
        expectedRole = 'doctor';
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
                if (currentPath === '/onboarding' || currentPath === '/dashboard/patient/onboarding' || currentPath === '/patient/onboarding') {
                    isAuthorized = true;
                } else {
                    isAuthorized = (!expectedRole || role === expectedRole);
                }
            } else if (role === 'doctor') {
                const docStatus = user?.status || 'active';
                if (docStatus === 'pending') {
                    isAuthorized = currentPath === '/doctor/pending-approval';
                } else if (docStatus === 'rejected') {
                    isAuthorized = currentPath === '/doctor/rejected';
                } else {
                    isAuthorized = (!expectedRole || role === expectedRole);
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
