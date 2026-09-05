import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

function getEncryptionKey() {
    const secret = process.env.RECORD_ENCRYPTION_KEY;

    if (!secret) {
        throw new Error('RECORD_ENCRYPTION_KEY environment variable is required.');
    }

    const key = Buffer.from(secret, 'base64');

    if (key.length !== 32) {
        throw new Error('RECORD_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
    }

    return key;
}

export function encrypt(text) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(String(text), 'utf8'),
        cipher.final()
    ]);

    return {
        algorithm,
        iv: iv.toString('base64'),
        content: encrypted.toString('base64')
    };
}

export function decrypt(hash) {
    if (!hash?.iv || !hash?.content) {
        throw new Error('Invalid encrypted payload.');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(hash.iv, 'base64');

    if (iv.length !== 16) {
        throw new Error('Invalid encryption IV.');
    }

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, 'base64')),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}

export default { encrypt, decrypt };
