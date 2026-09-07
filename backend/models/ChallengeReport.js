import mongoose from 'mongoose';

const challengeReportSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
  },
  citizenName: {
    type: String,
    default: 'Anonymous Citizen',
  },
  citizenPhone: {
    type: String,
    default: '',
  },
  problemText: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  locationName: {
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
      default: [85.3240, 23.3441],
    },
  },
  perceivedSeverity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'High',
  },
  clipAuthenticityScore: {
    type: Number,
    default: 0.88,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

challengeReportSchema.index({ location: '2dsphere' });

export default mongoose.model('ChallengeReport', challengeReportSchema);
