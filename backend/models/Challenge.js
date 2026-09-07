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
  status: {
    type: String,
    enum: ['Identified', 'In Progress', 'Deployed'],
    default: 'Identified',
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

export default mongoose.model('Challenge', challengeSchema);
