import express from 'express';
import db, { queryDb, getDb, runDb } from '../config/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { enforceTenantIsolation } from '../middleware/tenantIsolation.js';
import { writeAuditEvent } from '../services/auditLogger.js';
import { realtimeService } from '../services/realtimeService.js';
import { addRecord, getRecords, deleteRecord } from '../controllers/recordController.js';

const router = express.Router();

// GET /api/records - Fetch all clinical records filtered by tenant & permissions
router.get('/records', authMiddleware, enforceTenantIsolation, getRecords);

// POST /api/records - Create new multi-tenant clinical record in PostgreSQL
router.post('/records', authMiddleware, enforceTenantIsolation, addRecord);

// DELETE /api/records/:id - Delete a clinical record
router.delete('/records/:id', authMiddleware, enforceTenantIsolation, deleteRecord);

export default router;
