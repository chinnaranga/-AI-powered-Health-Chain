/**
 * HealthChain Enterprise Tenant Isolation Middleware
 * Guarantees every request is strictly scoped to the authenticated user's
 * current hospital tenant as recorded in Neon.
 * Blocks cross-tenant queries with HTTP 403.
 */

import { getDb } from '../config/db.js';

export async function enforceTenantIsolation(req, res, next) {
    try {
        const userId = req.user?.uid || req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                code: 'AUTH_REQUIRED',
                message: 'Authentication is required.'
            });
        }

        const dbUser = await getDb(
            `SELECT id, role, status, hospital_id
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [userId]
        );

        if (!dbUser) {
            return res.status(403).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Authenticated user was not found.'
            });
        }

        if (dbUser.status !== 'active') {
            return res.status(403).json({
                success: false,
                code: 'USER_NOT_ACTIVE',
                message: 'User account is not active.'
            });
        }

        const jwtRole = req.user?.role;
        if (jwtRole && jwtRole !== dbUser.role) {
            return res.status(403).json({
                success: false,
                code: 'ROLE_MISMATCH',
                message: 'Authenticated role does not match the current account.'
            });
        }

        const role = dbUser.role;

        // Administrators are the only users allowed to operate
        // without a single-hospital tenant context.
        if (role === 'admin') {
            const bodyHospital = req.body?.hospitalId;
            const queryHospital = req.query?.hospitalId;

            if (bodyHospital && queryHospital && bodyHospital !== queryHospital) {
                return res.status(400).json({
                    success: false,
                    code: 'TENANT_CONTEXT_CONFLICT',
                    message: 'Conflicting hospital tenant identifiers were supplied.'
                });
            }

            const targetHospital = bodyHospital || queryHospital;

            if (targetHospital === 'all' || !targetHospital) {
                req.hospitalId = null;
                req.tenantId = null;
                return next();
            }

            req.hospitalId = targetHospital;
            req.tenantId = targetHospital;
            return next();
        }

        const userTenant = dbUser.hospital_id;

        if (
            !userTenant ||
            userTenant === 'default_hospital' ||
            userTenant === 'default_tenant'
        ) {
            return res.status(403).json({
                success: false,
                code: 'TENANT_CONTEXT_REQUIRED',
                message: 'A valid hospital tenant is required for this operation.'
            });
        }

        // Attach the DB-authoritative tenant, never the JWT tenant.
        req.hospitalId = userTenant;
        req.tenantId = userTenant;

        // Request-supplied tenant IDs must never override the
        // authenticated user's current DB tenant.
        const bodyHospital = req.body?.hospitalId;
        const queryHospital = req.query?.hospitalId;

        if (bodyHospital && queryHospital && bodyHospital !== queryHospital) {
            return res.status(400).json({
                success: false,
                code: 'TENANT_CONTEXT_CONFLICT',
                message: 'Conflicting hospital tenant identifiers were supplied.'
            });
        }

        const targetHospital = bodyHospital || queryHospital;

        if (targetHospital === 'all') {
            console.warn(
                `[Tenant Isolation Violation] User ${userId} attempted multi-tenant access.`
            );

            return res.status(403).json({
                success: false,
                code: 'CROSS_TENANT_ACCESS_DENIED',
                message: 'Multi-hospital access is restricted to administrators.'
            });
        }

        if (targetHospital && String(targetHospital) !== String(userTenant)) {
            console.warn(
                `[Tenant Isolation Violation] User ${userId} (tenant: ${userTenant}) attempted access to target tenant: ${targetHospital}`
            );

            return res.status(403).json({
                success: false,
                code: 'CROSS_TENANT_ACCESS_DENIED',
                message: 'Access Denied: Cross-hospital tenant access is strictly prohibited.'
            });
        }

        return next();
    } catch (error) {
        console.error('[Tenant Isolation] Database authorization check failed:', error);

        return res.status(503).json({
            success: false,
            code: 'TENANT_AUTHORIZATION_UNAVAILABLE',
            message: 'Tenant authorization could not be verified.'
        });
    }
}

export default enforceTenantIsolation;
