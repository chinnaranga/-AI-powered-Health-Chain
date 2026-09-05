export const tenantMiddleware = (req, res, next) => {
    if (req.user && req.user.role !== 'admin') {
        req.tenantFilter = {
            $or: [
                { hospitalId: req.user.hospitalId },
                { tenantId: req.user.tenantId },
                { createdBy: req.user.id }
            ]
        };
    } else {
        req.tenantFilter = {};
    }
    next();
};

export default tenantMiddleware;
