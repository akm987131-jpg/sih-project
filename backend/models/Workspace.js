import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  id: Number,
  title: String,
  date: String,
  done: {
    type: Boolean,
    default: false,
  },
});

const workspaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
  },
  status: {
    type: String,
    default: 'In Progress',
  },
  currentPhase: {
    type: String,
    enum: ['Research', 'Prototype', 'Pilot', 'Deployment'],
    default: 'Prototype',
  },
  progressPercentage: {
    type: Number,
    default: 60,
  },
  location: {
    type: String,
    default: 'Jharkhand (Kanke Block)',
  },
  team: {
    university: { type: String, default: 'NIT Jamshedpur' },
    industry: { type: String, default: 'Tata Projects' },
    government: { type: String, default: 'Jharkhand Govt (DWSD)' },
    community: { type: String, default: 'Community Village X' },
  },
  tasks: [taskSchema],
  hardwareBom: [
    {
      item: String,
      quantity: Number,
      cost: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Workspace', workspaceSchema);
