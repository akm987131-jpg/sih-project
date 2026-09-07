import express from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';

const router = express.Router();

// Clean slate storage: Starts blank until collaborative projects are initiated
export let memoryWorkspaces = [];

// GET /api/v1/workspaces
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const workspaces = await Workspace.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: workspaces.length, data: workspaces });
    }
    res.json({ success: true, count: memoryWorkspaces.length, data: memoryWorkspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/workspaces/create
router.post('/create', (req, res) => {
  const { title, domain, location, leadInstitution } = req.body;
  const newWorkspace = {
    _id: `ws_${Date.now()}`,
    title: title || 'Decentralized Water Purification System',
    status: 'In Progress (Prototyping)',
    currentPhase: 'Prototype',
    progressPercentage: 25,
    location: location || 'Ranchi, Jharkhand',
    team: {
      university: leadInstitution || 'NIT Jamshedpur (4 NEP 2020 Credits)',
      industry: 'Tata Steel CSR Foundation (Grant: ₹12,00,000)',
      government: 'Jharkhand State DWSD Nodal Permit #JH-2026-88',
      community: 'Panchayat Samiti & Jal Sahiyyas'
    },
    phases: [
      { name: 'Research', status: 'completed' },
      { name: 'Prototype', status: 'in-progress' },
      { name: 'Pilot', status: 'pending' },
      { name: 'Deployment', status: 'pending' }
    ],
    tasks: [
      { id: 1, title: 'Groundwater laboratory spectrometry analysis', done: true, date: 'Oct 12' },
      { id: 2, title: 'CAD Blueprint for Gravity-Feed Nano-Filtration Unit', done: false, date: 'Oct 28' },
      { id: 3, title: 'Hardware sensor assembly & IoT turbidity telemetry', done: false, date: 'Nov 10' },
      { id: 4, title: 'District pilot trial on-site sanctioning & community demonstration', done: false, date: 'Nov 24' }
    ],
    hardwareBom: [
      { item: 'Activated Alumina Media Column', qty: '4 Units', status: 'Procured' },
      { item: 'Solar Powered Turbidity IoT Node', qty: '2 Units', status: 'In Assembly' }
    ],
    createdAt: new Date().toISOString()
  };

  memoryWorkspaces.unshift(newWorkspace);
  res.status(201).json({ success: true, message: 'Collaborative Workspace initialized', data: newWorkspace });
});

// GET /api/v1/workspaces/:id
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const workspace = await Workspace.findById(req.params.id) || await Workspace.findOne();
      return res.json({ success: true, data: workspace });
    }
    const ws = memoryWorkspaces.find(w => w._id === req.params.id) || (memoryWorkspaces.length > 0 ? memoryWorkspaces[0] : null);
    res.json({ success: true, data: ws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/workspaces/:id/tasks/:taskId
router.patch('/:id/tasks/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);

    if (mongoose.connection.readyState === 1) {
      const workspace = await Workspace.findById(req.params.id) || await Workspace.findOne();
      if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
      const task = workspace.tasks.find((t) => t.id === taskId);
      if (task) task.done = !task.done;
      const completedTasks = workspace.tasks.filter((t) => t.done).length;
      workspace.progressPercentage = Math.round((completedTasks / workspace.tasks.length) * 100);
      await workspace.save();
      return res.json({ success: true, message: 'Task updated successfully', data: workspace });
    }

    const ws = memoryWorkspaces.find(w => w._id === req.params.id) || memoryWorkspaces[0];
    if (!ws) {
      return res.status(404).json({ success: false, message: 'No active project workspace found' });
    }
    const task = (ws.tasks || []).find(t => t.id === taskId);
    if (task) task.done = !task.done;
    const completedTasks = (ws.tasks || []).filter(t => t.done).length;
    ws.progressPercentage = ws.tasks && ws.tasks.length > 0 ? Math.round((completedTasks / ws.tasks.length) * 100) : 0;

    res.json({ success: true, message: 'Task updated in memory', data: ws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
