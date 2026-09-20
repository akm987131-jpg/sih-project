/**
 * AuditLog Route for SamadhanSetu
 * Responsibility: Expose audit log entries so the government dashboard can display them.
 */
import express from 'express';
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { memoryAuditLogs } from './challenges.js';

const router = express.Router();

/**
 * GET /api/v1/audit-logs
 * Returns all government action audit log entries, newest first.
 */
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const logs = await AuditLog.find().sort({ timestamp: -1 });
      return res.json({ success: true, count: logs.length, data: logs });
    }
    // In-memory fallback
    res.json({ success: true, count: memoryAuditLogs.length, data: memoryAuditLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
