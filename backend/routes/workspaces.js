import express from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Pure In-Memory State (RAM only - resets cleanly)
export let memoryWorkspaces = [];

export function saveWorkspaceData() {
  // RAM only
}

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
  const { title, domain, location, leadInstitution, sponsor, department } = req.body;
  const newWorkspace = {
    _id: `ws_${Date.now()}`,
    title: title || 'Grassroots Innovation Project Workspace',
    domain: domain || 'Interdisciplinary Engineering',
    status: 'Stage 01: Research & Problem Study',
    currentPhase: 'Research',
    progressPercentage: 0,
    location: location || 'Jharkhand',
    team: {
      university: leadInstitution || 'University Innovation Lab (Assigned Team)',
      industry: sponsor || 'Industry CSR Partner (Grant Allocated)',
      government: department || 'Department Nodal Agency (Permit Active)',
      community: 'Local Panchayat & Citizen Reporters'
    },
    phases: [
      { name: 'Research', status: 'in-progress' },
      { name: 'Prototype', status: 'pending' },
      { name: 'Pilot', status: 'pending' },
      { name: 'Deployment', status: 'pending' }
    ],
    tasks: [
      { id: 1, title: 'Field site inspection & baseline problem study', done: false, date: 'Stage 1' },
      { id: 2, title: 'Literature review, domain research & technical feasibility', done: false, date: 'Stage 1' },
      { id: 3, title: 'CAD engineering blueprint & lab prototype development', done: false, date: 'Stage 2' },
      { id: 4, title: 'Pilot on-site field testing with local panchayat community', done: false, date: 'Stage 3' },
      { id: 5, title: 'Full government handover & district scale deployment', done: false, date: 'Stage 4' }
    ],
    hardwareBom: [
      { item: 'Diagnostic Tools & Field Testing Kit', qty: '1 Set', status: 'Planning' },
      { item: 'Prototype Fabrication Materials', qty: 'Initial Batch', status: 'In Review' }
    ],
    createdAt: new Date().toISOString()
  };

  memoryWorkspaces.unshift(newWorkspace);
  saveWorkspaceData();
  res.status(201).json({ success: true, message: 'Collaborative Workspace initialized at Stage 1 (Research)', data: newWorkspace });
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

    saveWorkspaceData();

    res.json({ success: true, message: 'Task updated in memory', data: ws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
