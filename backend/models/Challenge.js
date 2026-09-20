import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
    enum: ['Water & Sanitation', 'Healthcare', 'Agriculture', 'Infrastructure', 'Renewable Energy'],
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  priorityScore: {
    type: Number,
    default: 5.0,
  },

  // --- FULL LIFECYCLE STATUS ---
  // Replaces old 3-value enum with the complete 11-stage pipeline
  status: {
    type: String,
    enum: [
      'Submitted',              // Citizen just submitted the report
      'AI Analysis',            // AI is processing (classifying + deduplication)
      'Duplicate Check',        // AI found similar reports and grouped them
      'Government Verification',// Waiting for a government officer to review
      'Approved',               // Government officer approved it
      'Dismissed',              // Government officer dismissed it
      'Sanctioned',             // Government officially sanctioned for solution development
      'University Matched',     // A university/team has taken it up
      'In Development',         // Active prototype/development phase
      'Pilot',                  // Field pilot running
      'Deployed',               // Solution fully deployed
      // Legacy statuses kept so old seeded data still renders without errors
      'Identified',
      'In Progress',
    ],
    default: 'Submitted',
  },

  // --- AI ANALYSIS FIELDS ---
  // Populated by the AI service after a citizen submits a report
  aiSummary: {
    type: String,
    default: '',
  },
  keywords: {
    type: [String],
    default: [],
  },

  // --- GOVERNMENT DECISION FIELDS ---
  // Filled in when a government officer takes action
  governmentAction: {
    type: String,
    enum: ['Approve', 'Dismiss', 'Sanction', 'RequestInfo', ''],
    default: '',
  },
  governmentNote: {
    type: String,
    default: '',
  },
  governmentOfficer: {
    type: String,
    default: '',
  },
  governmentActionAt: {
    type: Date,
    default: null,
  },
  sanctionedAt: {
    type: Date,
    default: null,
  },

  // --- UNIVERSITY ASSIGNMENT ---
  universityName: {
    type: String,
    default: '',
  },
  universityAppliedAt: {
    type: Date,
    default: null,
  },

  // --- FUNDING / PARTNERS ---
  // Array of funding sources that have been attached to this challenge
  fundingSources: {
    type: [String],
    default: [],
  },
  isIndustryFunded: {
    type: Boolean,
    default: false,
  },
  industrySponsor: {
    type: String,
    default: '',
  },
  industryFundingAmount: {
    type: String,
    default: '',
  },
  industryFundedAt: {
    type: Date,
    default: null,
  },

  district: {
    type: String,
    required: true,
    default: 'Ranchi',
  },
  block: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: 'Jharkhand',
  },
  locationName: {
    type: String,
    default: '',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  citizenName: {
    type: String,
    default: 'Anonymous Citizen',
  },
  citizenPhone: {
    type: String,
    default: '',
  },
  location: {

    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [85.3240, 23.3441], // Ranchi default
    },
  },
  reportCount: {
    type: Number,
    default: 1,
  },
  suggestedExpertise: {
    type: String,
    default: '',
  },
  assignedDepartment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial proximity search
challengeSchema.index({ location: '2dsphere' });
challengeSchema.index({ domain: 1, district: 1, priority: 1 });
challengeSchema.index({ status: 1 });

export default mongoose.model('Challenge', challengeSchema);

