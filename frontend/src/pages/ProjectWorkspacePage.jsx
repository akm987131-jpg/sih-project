import React, { useState, useEffect } from 'react';
import { currentWorkspace } from '../data/mockData';
import { updateWorkspaceTask, createWorkspace } from '../services/api';
import { CheckCircle2, Circle, Clock, Building, GraduationCap, Landmark, Users, ArrowRight, Upload, Plus, Sparkles } from 'lucide-react';

export default function ProjectWorkspacePage({ setActiveScreen }) {
  const [workspace, setWorkspace] = useState(currentWorkspace);
  const [tasks, setTasks] = useState(currentWorkspace.tasks || []);
  const [progressNotice, setProgressNotice] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadWorkspace = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/workspaces');
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        setWorkspace(json.data[0]);
        setTasks(json.data[0].tasks || []);
      }
    } catch (err) {
      console.warn('Using local workspace');
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const handleSeedWorkspace = async () => {
    const res = await createWorkspace({
      title: 'Decentralized Arsenic Water Nano-Filtration Unit',
      domain: 'Water & Sanitation',
      location: 'Ranchi, Jharkhand',
      leadInstitution: 'NIT Jamshedpur (4 NEP 2020 Credits)'
    });
    if (res.success && res.data) {
      setWorkspace(res.data);
      setTasks(res.data.tasks || []);
      setProgressNotice('⚡ Collaborative Quad-Helix workspace successfully initialized!');
    }
  };

  const toggleTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    const completedCount = updated.filter(t => t.done).length;
    const pct = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
    setProgressNotice(`Task status updated! Project milestone progress is now ${pct}%.`);

    try {
      await updateWorkspaceTask(workspace._id, id);
    } catch (err) {
      console.warn('Task updated locally in offline mode');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      done: false,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    setNewTaskTitle('');
    setShowAddModal(false);
    setProgressNotice(`New milestone deliverable "${newTask.title}" added to sprint board!`);
  };

  const completedCount = (tasks || []).filter(t => t.done).length;
  const progressPercent = tasks && tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{ padding: '40px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-low" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
                {workspace.status || 'Active Collaborative Sprint'}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                📍 {workspace.location}
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2C59' }}>
              {workspace.title}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
              Project Milestone: {progressPercent}%
            </div>
            <div style={{ width: '180px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#16A34A', borderRadius: '9999px', transition: 'width 0.3s ease' }} />
            </div>

            {(!tasks || tasks.length === 0) && (
              <button
                onClick={handleSeedWorkspace}
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px', marginTop: '10px', backgroundColor: '#16A34A' }}
              >
                <Sparkles size={14} />
                ⚡ Demo: Start Sample Workspace
              </button>
            )}
          </div>
        </div>

        {progressNotice && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            {progressNotice}
          </div>
        )}

        {/* Lifecycle Stepper */}
        <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
            Solution Lifecycle Stages
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {(workspace.phases || [
              { name: 'Research', status: 'completed' },
              { name: 'Prototype', status: 'in-progress' },
              { name: 'Pilot', status: 'pending' },
              { name: 'Deployment', status: 'pending' }
            ]).map((p, idx) => (
              <div 
                key={p.name}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: p.status === 'completed' ? '#F0FDF4' : p.status === 'in-progress' ? '#EFF6FF' : '#F8FAFC',
                  border: p.status === 'in-progress' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>STAGE 0{idx + 1}</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F2C59' }}>{p.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: p.status === 'completed' ? '#16A34A' : p.status === 'in-progress' ? '#2563EB' : '#94A3B8', marginTop: '4px' }}>
                  {p.status === 'completed' ? '✓ Completed' : p.status === 'in-progress' ? '● In Progress' : 'Pending'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quad-Helix Stakeholder Collaboration Matrix */}
        <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '16px' }}>
            Quad-Helix Collaborative Partners
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #2563EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <GraduationCap size={16} color="#2563EB" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>UNIVERSITY</span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                {workspace.team?.university || 'NIT Jamshedpur (4 NEP Credits)'}
              </div>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Building size={16} color="#7C3AED" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>INDUSTRY (CSR)</span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                {workspace.team?.industry || 'Tata Projects (Grant: ₹12 Lakh)'}
              </div>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0F2C59' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Landmark size={16} color="#0F2C59" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>GOVERNMENT</span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                {workspace.team?.government || 'Jharkhand DWSD Permit Active'}
              </div>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Users size={16} color="#16A34A" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>COMMUNITY</span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                {workspace.team?.community || 'Gram Panchayat & Jal Sahiyyas'}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Checklist */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F2C59' }}>
                Milestone Deliverables & Engineering Sprint
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                Click any task to toggle status • Progress bar recalculates in real-time
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              Add Task
            </button>
          </div>

          {/* Add Task Input Modal */}
          {showAddModal && (
            <form onSubmit={handleAddTask} style={{ marginBottom: '18px', padding: '14px', backgroundColor: '#EFF6FF', borderRadius: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter new milestone deliverable (e.g. Field water sampling & lab assay)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13.5px' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Save Task
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px' }}>
                Cancel
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!tasks || tasks.length === 0) ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                color: '#64748B'
              }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F2C59', marginBottom: '6px' }}>
                  No Tasks Currently Scheduled
                </div>
                <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto 14px auto' }}>
                  Click below to populate sample deliverables or add your first research task.
                </p>
                <button
                  onClick={handleSeedWorkspace}
                  className="btn btn-primary"
                  style={{ fontSize: '12.5px', padding: '8px 16px' }}
                >
                  ⚡ Start Sample Sprint
                </button>
              </div>
            ) : (
              tasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: t.done ? '#F0FDF4' : '#FFFFFF',
                    border: t.done ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {t.done ? (
                      <CheckCircle2 size={20} color="#16A34A" />
                    ) : (
                      <Circle size={20} color="#94A3B8" />
                    )}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: t.done ? '#166534' : '#334155',
                      textDecoration: t.done ? 'line-through' : 'none'
                    }}>
                      {t.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                    {t.date}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button 
              onClick={() => setActiveScreen('impact')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              Update Progress & Push Field Telemetry
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => alert('CAD & Sensor Blueprint uploaded to MinIO/S3 storage.')}
              className="btn btn-outline"
              style={{ padding: '12px 20px' }}
            >
              <Upload size={16} />
              Upload CAD / Test Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
