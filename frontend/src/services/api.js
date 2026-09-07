// SamadhanSetu Frontend API Service
// Connects to Node.js / Express Backend (http://127.0.0.1:5000) with fallback to mock data

import { platformStats, sampleChallenges, currentWorkspace, governmentStats } from '../data/mockData';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

// 1. Fetch Platform Impact Summary Counters
export async function getPlatformStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/summary`);
    const json = await res.json();
    return json.data || platformStats;
  } catch (err) {
    console.warn('Backend offline, using local data for stats');
    return platformStats;
  }
}

// 2. Fetch Challenges with Filters
export async function getChallenges(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/challenges?${query}`);
    const json = await res.json();
    return json.data || sampleChallenges;
  } catch (err) {
    console.warn('Backend offline, using local challenges');
    return sampleChallenges;
  }
}

// 3. Submit Citizen Problem Report & Trigger AI Triage
export async function submitReport(reportData) {
  try {
    const res = await fetch(`${API_BASE}/challenges/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Backend offline, generating mock AI clustering result');
    return {
      success: true,
      aiAnalysisResult: {
        identifiedProblem: 'Unsafe Drinking Water',
        domain: reportData.category || 'Water & Sanitation',
        location: reportData.locationName || 'Ranchi, Jharkhand',
        priority: reportData.severity || 'High',
        similarReportsFound: 7,
        isGroupedWithCluster: true,
      },
    };
  }
}

// 4. Fetch Project Workspace
export async function getWorkspace(id = '66d84f1a2b91c7a100000050') {
  try {
    const res = await fetch(`${API_BASE}/workspaces/${id}`);
    const json = await res.json();
    return json.data || currentWorkspace;
  } catch (err) {
    console.warn('Backend offline, using local workspace data');
    return currentWorkspace;
  }
}

// 5. Toggle Workspace Task
export async function updateWorkspaceTask(workspaceId, taskId) {
  try {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: 'PATCH',
    });
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend offline, task updated locally');
    return null;
  }
}

// 6. User Login
export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (err) {
    return {
      success: true,
      user: {
        fullName: credentials.identifier || 'Demo User',
        role: credentials.role || 'Citizen',
      },
    };
  }
}

// 7. Instant Mobile-Only Authentication
export async function authenticateWithMobile(mobileNumber, fullName = '', role = 'Citizen') {
  try {
    const res = await fetch(`${API_BASE}/auth/mobile-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, fullName, role }),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    const digits = String(mobileNumber).replace(/\D/g, '').slice(-10);
    return {
      success: true,
      user: {
        id: `offline_${Date.now()}`,
        fullName: fullName || `Citizen (${digits.slice(-4)})`,
        mobileNumber: digits,
        role: role || 'Citizen',
        state: 'Jharkhand',
      },
    };
  }
}

// 8. Send OTP to Mobile Number
export async function sendOtp(mobileNumber) {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
    return await res.json();
  } catch (err) {
    return {
      success: true,
      demoOtp: '2604',
      message: `Demo OTP sent to +91 ${mobileNumber}`,
    };
  }
}

// 9. Verify OTP & Authenticate
export async function verifyOtp(mobileNumber, otp, fullName = '', role = 'Citizen') {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp, fullName, role }),
    });
    return await res.json();
  } catch (err) {
    const digits = String(mobileNumber).replace(/\D/g, '').slice(-10);
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        fullName: fullName || `Citizen (${digits.slice(-4)})`,
        mobileNumber: digits,
        role: role || 'Citizen',
        state: 'Jharkhand',
      },
    };
  }
}

// 10. Seed Demo Challenges for Interactive Testing
export async function seedChallenges() {
  try {
    const res = await fetch(`${API_BASE}/challenges/seed`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Backend unreachable' };
  }
}

// 11. Reset All Datasets to Blank Slate
export async function resetAllData() {
  try {
    const res = await fetch(`${API_BASE}/challenges/reset`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Backend unreachable' };
  }
}

// 12. Create Project Workspace from Accepted Challenge
export async function createWorkspace(data) {
  try {
    const res = await fetch(`${API_BASE}/workspaces/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Backend unreachable' };
  }
}
