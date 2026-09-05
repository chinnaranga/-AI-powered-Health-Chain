/**
 * HealthChain Enterprise Tenant Isolation Middleware
 * Guarantees every request is strictly scoped to the authenticated user's hospital tenant.
 * Blocks cross-tenant queries with HTTP 403.
 */

export function enforceTenantIsolation(req, res, next) {
    const userTenant = req.user?.hospitalId || req.user?.tenantId || req.hospitalId;

    if (!userTenant || userTenant === 'default_hospital' || userTenant === 'default_tenant') {
        if (req.user?.role === 'super_admin') {
            req.hospitalId = null;
            req.tenantId = null;
            return next();
        }

        return res.status(403).json({
            success: false,
            code: 'TENANT_CONTEXT_REQUIRED',
            message: 'A valid hospital tenant is required for this operation.'
        });
    }
    
    // Attach validated hospitalId to request context
    req.hospitalId = userTenant;
    req.tenantId = userTenant;

    // Request-supplied tenant IDs must never override the authenticated tenant.
    // Only super_admin may explicitly request multi-hospital scope.
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
        if (req.user?.role === 'super_admin') {
            return next();
        }

        console.warn(`[Tenant Isolation Violation] User ${req.user?.uid || 'unknown'} attempted multi-tenant access.`);
        return res.status(403).json({
            success: false,
            code: 'CROSS_TENANT_ACCESS_DENIED',
            message: 'Multi-hospital access is restricted to super administrators.'
        });
    }

    if (targetHospital && targetHospital !== userTenant) {
        console.warn(`[Tenant Isolation Violation] User ${req.user?.uid || 'unknown'} (tenant: ${userTenant}) attempted access to target tenant: ${targetHospital}`);
        return res.status(403).json({
            success: false,
            code: 'CROSS_TENANT_ACCESS_DENIED',
            message: 'Access Denied: Cross-hospital tenant access is strictly prohibited.'
        });
    }

    next();
}

export default enforceTenantIsolation;
