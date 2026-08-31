// Web Cryptography service for Zero-Knowledge patient record encryption (AES-GCM)
export const cryptoService = {
    /**
     * Derive a cryptographic key from a seed string (e.g., patient ID) using SHA-256
     */
    async deriveKey(seed) {
        const encoder = new TextEncoder();
        const rawData = encoder.encode(seed);
        const digest = await window.crypto.subtle.digest('SHA-256', rawData);
        return window.crypto.subtle.importKey(
            'raw',
            digest,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encrypt an ArrayBuffer or String with AES-GCM
     * @returns {Promise<Uint8Array>} Combined IV + Ciphertext
     */
    async encrypt(data, seed) {
        const key = await this.deriveKey(seed);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        let rawBytes;
        if (typeof data === 'string') {
            rawBytes = new TextEncoder().encode(data);
        } else if (data instanceof ArrayBuffer) {
            rawBytes = new Uint8Array(data);
        } else {
            rawBytes = data; // Assumes Uint8Array or similar
        }

        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            rawBytes
        );

        // Prep combined array: [IV (12 bytes)] + [Ciphertext]
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        return combined;
    },

    /**
     * Decrypt a combined IV + Ciphertext Uint8Array
     * @returns {Promise<ArrayBuffer>} Decrypted ArrayBuffer
     */
    async decrypt(combinedBytes, seed) {
        const key = await this.deriveKey(seed);
        const iv = combinedBytes.slice(0, 12);
        const ciphertext = combinedBytes.slice(12);

        return window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );
    }
};
