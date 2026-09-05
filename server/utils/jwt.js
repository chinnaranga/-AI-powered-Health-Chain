import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required.');
}


export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id || user.id,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId || null,
            organizationId: user.organizationId || null,
            tenantId: user.tenantId || user.hospitalId || 'default'
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id || user.id,
            email: user.email
        },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (e) {
        return null;
    }
};
