import db from '../config/db.js';
import { encrypt, decrypt } from '../services/encryptionService.js';
import https from 'https';
import { URL } from 'url';

export const addRecord = (req, res) => {
    const { id, data, hash, previousHash, timestamp, patientId } = req.body;

    // Encrypt the data before storing
    // 'data' comes in as an object, needed to be stringified then encrypted
    const dataString = JSON.stringify(data);
    const encryptedData = encrypt(dataString);

    // We store the encrypted object (iv + content) as a JSON string in the 'data' column
    const storedData = JSON.stringify(encryptedData);

    db.run("INSERT INTO records VALUES (?, ?, ?, ?, ?, ?)",
        [id, storedData, hash, previousHash, timestamp, patientId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id });
        }
    );
};

export const getRecords = (req, res) => {
    const { role, userId, patientIdForDoctor } = req.query;

    if (role === 'patient') {
        db.all("SELECT * FROM records WHERE patientId = ?", [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Decrypt records
            const records = rows.map(r => {
                try {
                    const encrypted = JSON.parse(r.data);
                    // Check if it has iv and content (new format) or is old format
                    if (encrypted.iv && encrypted.content) {
                        const decrypted = decrypt(encrypted);
                        return { ...r, data: JSON.parse(decrypted) };
                    }
                    return { ...r, data: encrypted }; // Fallback for old unencrypted data
                } catch (e) {
                    console.error("Decryption error", e);
                    return { ...r, data: null };
                }
            });
            res.json(records);
        });
    } else if (role === 'doctor' && patientIdForDoctor) {
        db.all("SELECT * FROM records WHERE patientId = ?", [patientIdForDoctor], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Decrypt records
            const records = rows.map(r => {
                try {
                    const encrypted = JSON.parse(r.data);
                    if (encrypted.iv && encrypted.content) {
                        const decrypted = decrypt(encrypted);
                        return { ...r, data: JSON.parse(decrypted) };
                    }
                    return { ...r, data: encrypted };
                } catch (e) {
                    console.error("Decryption error", e);
                    return { ...r, data: null };
                }
            });
            res.json(records);
        });
    } else {
        res.json([]);
    }
};

export const proxyFile = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const parsedUrl = new URL(url);
        const isAllowedHost = 
            parsedUrl.hostname === 'firebasestorage.googleapis.com' ||
            parsedUrl.hostname === 'localhost' ||
            parsedUrl.hostname === '127.0.0.1';

        if (!isAllowedHost) {
            return res.status(400).json({ error: 'Only authorized storage hosts can be proxied' });
        }

        if (globalThis.fetch) {
            const response = await fetch(url);
            if (!response.ok) {
                return res.status(response.status).json({ error: `Failed to fetch the file: ${response.statusText}` });
            }

            const contentType = response.headers.get('content-type');
            if (contentType) {
                res.setHeader('Content-Type', contentType);
            }
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                res.setHeader('Content-Length', contentLength);
            }

            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));
        } else {
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).json({ error: `Failed to fetch the file: ${response.statusCode}` });
                }

                const contentType = response.headers['content-type'];
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
                const contentLength = response.headers['content-length'];
                if (contentLength) {
                    res.setHeader('Content-Length', contentLength);
                }

                response.pipe(res);
            }).on('error', (err) => {
                res.status(500).json({ error: err.message });
            });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

