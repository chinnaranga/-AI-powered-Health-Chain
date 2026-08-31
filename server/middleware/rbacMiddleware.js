export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated user.'
            });
        }

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole) && !allowedRoles.includes('*')) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
            });
        }

        next();
    };
};

export const checkConsent = (req, res, next) => {
    // In production, checks ConsentLog collection for active doctor-patient grant
    next();
};
