import express from 'express';
import { adminDb } from '../config/firebaseAdmin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a Hospital Organization
router.post('/hospitals/register', async (req, res) => {
    try {
        const { name, regNum, licenseNum, address, city, state, country, verificationDocuments } = req.body;
        if (!name || !regNum || !licenseNum) {
            return res.status(400).json({ success: false, message: 'Name, registration, and license numbers are required.' });
        }

        const docRef = adminDb.collection('hospitals').doc();
        const hospitalData = {
            id: docRef.id,
            hospitalId: docRef.id,
            tenantId: docRef.id,
            name,
            regNum,
            licenseNum,
            address: address || '',
            city: city || 'Hyderabad',
            state: state || 'Telangana',
            country: country || 'India',
            status: 'approved',
            verificationDocuments: verificationDocuments || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await docRef.set(hospitalData);

        res.status(201).json({
            success: true,
            message: 'Hospital registered successfully',
            hospital: hospitalData
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET Hospital List
router.get('/hospitals', async (req, res) => {
    try {
        const snapshot = await adminDb.collection('hospitals').get();
        const hospitals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, hospitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message, hospitals: [] });
    }
});

// GET Single Hospital
router.get('/hospitals/:id', authMiddleware, async (req, res) => {
    try {
        const docSnap = await adminDb.collection('hospitals').doc(req.params.id).get();
        if (!docSnap.exists) {
            return res.status(404).json({ success: false, message: 'Hospital not found.' });
        }
        res.json({ success: true, hospital: { id: docSnap.id, ...docSnap.data() } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
