/**
 * AuditLog Model for SamadhanSetu
 * Responsibility: Record every government officer action on a challenge.
 * This creates an immutable trail: who did what, on which challenge, at what time.
 */
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // The government officer who performed the action
  officerName: {
    type: String,
    required: true,
    default: 'Government Officer',
  },

  // The action taken: Approve, Dismiss, Sanction, or RequestInfo
  action: {
    type: String,
    required: true,
    enum: ['Approve', 'Dismiss', 'Sanction', 'RequestInfo'],
  },

  // Which challenge was affected
  challengeId: {
    type: String,
    required: true,
  },
  challengeTitle: {
    type: String,
    required: true,
  },

  // Optional note the officer left explaining the decision
  note: {
    type: String,
    default: '',
  },

  // Auto-set timestamp
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AuditLog', auditLogSchema);
