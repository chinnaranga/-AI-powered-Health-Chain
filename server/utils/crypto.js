import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
    : crypto.scryptSync('healthchain-secret-key-salt', 'salt', 32);

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive string data (Aadhaar, Phone, Medical Notes, etc.)
 */
export function encryptData(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `ENC:${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (e) {
        console.warn('Encryption failed, returning original:', e);
        return text;
    }
}

/**
 * Decrypt sensitive string data
 */
export function decryptData(cipherText) {
    if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('ENC:')) {
        return cipherText;
    }
    try {
        const parts = cipherText.split(':');
        if (parts.length !== 4) return cipherText;
        const iv = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');
        const encryptedText = parts[3];
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.warn('Decryption failed:', e);
        return cipherText;
    }
}

/**
 * Hash Password
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Compare Password
 */
export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
