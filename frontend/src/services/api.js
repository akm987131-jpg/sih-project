// SamadhanSetu Frontend API Service
// Connects to Node.js / Express Backend with automatic localStorage sync and fallback

import { platformStats, currentWorkspace } from '../data/mockData';

// Relative path uses Vite proxy; absolute fallback works if served separately
const API_BASE = '/api/v1';
const DIRECT_BACKEND = 'http://127.0.0.1:5000/api/v1';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (res.ok) return await res.json();
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    // Fallback directly to backend port 5000 if proxy isn't active
    const directRes = await fetch(`${DIRECT_BACKEND}${endpoint}`, options);
    return await directRes.json();
  }
}

// Session In-Memory State (disappears completely on browser refresh when MongoDB is not connected)
let sessionChallenges = [];
let sessionReports = [];
let sessionWorkspaces = [];

// Clear any old persisted localStorage items so stale demo data does not linger
try {
  localStorage.removeItem('samadhansetu_challenges');
  localStorage.removeItem('samadhansetu_reports');
  localStorage.removeItem('samadhansetu_workspaces');
} catch {}

function getLocalChallenges() {
  return sessionChallenges;
}

function saveLocalChallenges(list) {
  sessionChallenges = Array.isArray(list) ? [...list] : [];
}

// 1. Fetch Platform Impact Summary Counters (resets to 0 on refresh)
export async function getPlatformStats() {
  const totalReports = sessionChallenges.reduce((acc, c) => acc + (c.reportCount || 1), 0);
  const totalChallenges = sessionChallenges.length;
  const totalWorkspaces = sessionWorkspaces.length;
  const totalDeployed = sessionWorkspaces.filter(w => 
    w.progressPercentage === 100 || 
    w.currentPhase === 'Deployment' || 
    w.status?.toLowerCase().includes('deploy') ||
    sessionChallenges.some(c => c.status === 'Deployed' && (c.title === w.title || c._id === w.challengeId))
  ).length;

  const estimatedBeneficiaries = (totalDeployed > 0)
    ? (totalDeployed * 4800 + totalReports * 750)
    : (totalReports > 0 ? totalReports * 1850 : (totalWorkspaces > 0 ? 1200 : 0));

  const uniqueDistricts = [...new Set([
    ...sessionChallenges.map(c => c.district).filter(Boolean),
    ...sessionWorkspaces.map(w => w.location).filter(Boolean)
  ])];

  return {
    reportsReceived: String(totalReports),
    challengesIdentified: String(totalChallenges),
    projectsInProgress: String(totalWorkspaces),
    solutionsDeployed: String(totalDeployed),
    peopleBenefited: estimatedBeneficiaries > 0 ? estimatedBeneficiaries.toLocaleString('en-IN') : "0",
    statesCovered: uniqueDistricts.length > 0 ? `${uniqueDistricts.length} District${uniqueDistricts.length > 1 ? 's' : ''}` : (totalChallenges > 0 ? "1 District" : "0"),
  };
}

// 1.1 Dynamic District Hotspots
export async function getDistrictMap() {
  const districtMap = {};
  sessionChallenges.forEach(c => {
    const dist = c.district || 'Ranchi';
    if (!districtMap[dist]) {
      districtMap[dist] = {
        district: dist,
        count: 0,
        priority: c.priority || 'Medium',
        issue: c.title,
      };
    }
    districtMap[dist].count += (c.reportCount || 1);
  });
  return Object.values(districtMap);
}

// 2. Fetch Challenges with Filters (resets to [] on refresh)
export async function getChallenges(filters = {}) {
  let list = [...sessionChallenges];
  const { domain, priority, district, status, search, forIndustry } = filters;
  const approvedForIndustry = ['Approved', 'Sanctioned', 'University Matched', 'In Development', 'Pilot', 'Deployed'];

  if (domain && domain !== 'All') list = list.filter(c => c.domain === domain);
  if (priority && priority !== 'All') list = list.filter(c => c.priority === priority);
  if (district && district !== 'All') list = list.filter(c => c.district === district);
  if (status && status !== 'All') {
    list = list.filter(c => c.status === status);
  } else if (forIndustry === 'true') {
    list = list.filter(c => approvedForIndustry.includes(c.status));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c =>
      (c.title && c.title.toLowerCase().includes(s)) ||
      (c.description && c.description.toLowerCase().includes(s)) ||
      (c.district && c.district.toLowerCase().includes(s))
    );
  }
  return list;
}

/**
 * Smart AI Duplicate / Similarity Detection
 * Compares incoming citizen report with existing challenges in domain, title, and keywords.
 */
function findDuplicateChallenge(category, title = '', problemText = '', existingChallenges = []) {
  if (!existingChallenges || existingChallenges.length === 0) return null;

  const normalize = (str = '') =>
    str.toLowerCase()
       .replace(/[^a-z0-9\s]/g, ' ')
       .split(/\s+/)
       .filter(w => w.length > 2 && !['issue', 'problem', 'the', 'and', 'for', 'with', 'from', 'this', 'that', 'our', 'very', 'badly', 'near', 'village'].includes(w));

  const currentTitleWords = normalize(title);
  const currentTextWords = normalize(problemText);
  const currentWords = new Set([...currentTitleWords, ...currentTextWords]);
  const cleanCurrentTitle = title.trim().toLowerCase();

  for (const existing of existingChallenges) {
    // Check if domain matches
    const sameDomain = !category || !existing.domain || existing.domain === category;
    if (!sameDomain) continue;

    const existingTitle = (existing.title || '').trim().toLowerCase();
    const existingTitleWords = normalize(existing.title || '');
    const existingTextWords = normalize(existing.description || '');
    const existingWords = new Set([...existingTitleWords, ...existingTextWords]);

    // Condition 1: Direct or Substring Title Match (e.g., "pipeline" vs "pipeline is massivly damaged")
    if (cleanCurrentTitle && existingTitle) {
      if (
        cleanCurrentTitle === existingTitle ||
        cleanCurrentTitle.includes(existingTitle) ||
        existingTitle.includes(cleanCurrentTitle)
      ) {
        return existing;
      }
    }

    // Condition 2: Core Subject Word Overlap (e.g. both contain "pipeline", "crop", "water", "canal", "road", "arsenic")
    let matchingWordCount = 0;
    for (const word of currentWords) {
      if (existingWords.has(word)) {
        matchingWordCount++;
      }
    }

    if (matchingWordCount >= 1) {
      return existing;
    }
  }

  return null;
}

// 3. Submit Citizen Problem Report & Trigger AI Triage + Duplicate Clustering
export async function submitReport(reportData) {
  const ts = Date.now();
  const category = reportData.category || 'Water & Sanitation';
  const rawTitle = reportData.title || reportData.problemText || 'Citizen Issue';
  const problemText = reportData.problemText || reportData.title || '';
  const severity = reportData.severity || 'Medium';

  // AI Step: Check for duplicate / similar challenges
  const duplicate = findDuplicateChallenge(category, rawTitle, problemText, sessionChallenges);

  if (duplicate) {
    // Duplicate found! Merge into existing master challenge cluster
    duplicate.reportCount = (duplicate.reportCount || 1) + 1;
    
    // Recalculate priority score based on increased report volume
    const bonus = Math.min(2.0, (duplicate.reportCount - 1) * 0.5);
    const baseScore = severity === 'High' ? 8.0 : (severity === 'Critical' ? 9.0 : 6.0);
    duplicate.priorityScore = Number(Math.min(10.0, baseScore + bonus).toFixed(1));
    if (duplicate.priorityScore >= 7.5) {
      duplicate.priority = 'High';
    }

    // Append additional report metadata
    if (!duplicate.additionalReports) duplicate.additionalReports = [];
    duplicate.additionalReports.push({
      reportId: `rep_local_${ts}`,
      citizenName: reportData.citizenName || 'Verified Citizen',
      citizenPhone: reportData.citizenPhone || '',
      reportedAt: new Date().toISOString(),
      problemText: problemText
    });

    return {
      success: true,
      message: `AI identified duplicate issue. Consolidated into Master Challenge: "${duplicate.title}" (${duplicate.reportCount} reports).`,
      aiAnalysisResult: {
        reportId: `rep_local_${ts}`,
        challengeId: duplicate._id,
        identifiedProblem: duplicate.title,
        domain: duplicate.domain,
        location: duplicate.locationName || reportData.locationName,
        priority: duplicate.priority,
        priorityScore: duplicate.priorityScore,
        similarReportsFound: duplicate.reportCount,
        isGroupedWithCluster: true,
        suggestedExpertise: duplicate.suggestedExpertise,
        assignedDepartment: duplicate.assignedDepartment,
        keywords: duplicate.keywords || ['citizen report', duplicate.domain.toLowerCase()],
        aiSummary: `AI successfully grouped this report with existing cluster. Total ${duplicate.reportCount} citizens reported this issue in ${duplicate.district || 'Jharkhand'}.`,
        currentStatus: duplicate.status,
      },
    };
  }

  // If no duplicate found, initialize a new Master Challenge
  const newChallenge = {
    _id: `chal_local_${ts}`,
    title: rawTitle,
    description: problemText,
    domain: category,
    priority: severity,
    priorityScore: severity === 'High' ? 8.0 : (severity === 'Critical' ? 9.5 : 6.0),
    district: (reportData.locationName || 'Ranchi').split(',')[0].trim(),
    state: 'Jharkhand',
    locationName: reportData.locationName || 'Ranchi, Jharkhand',
    photoUrl: reportData.photoUrl || '',
    citizenName: reportData.citizenName || 'Verified Citizen',
    citizenPhone: reportData.citizenPhone || '',
    reportCount: 1,
    suggestedExpertise: `${category} Engineering & Field Prototyping`,
    assignedDepartment: 'Department of Rural Development',
    aiSummary: `Citizen reported problem in ${category}. AI priority classified as ${severity}.`,
    keywords: ['citizen report', category.toLowerCase()],
    status: 'Government Verification',
    createdAt: new Date().toISOString(),
  };

  sessionChallenges.unshift(newChallenge);

  return {
    success: true,
    message: 'New master challenge created and recorded in session',
    aiAnalysisResult: {
      reportId: `rep_local_${ts}`,
      challengeId: newChallenge._id,
      identifiedProblem: newChallenge.title,
      domain: newChallenge.domain,
      location: newChallenge.locationName,
      priority: newChallenge.priority,
      priorityScore: newChallenge.priorityScore,
      similarReportsFound: 1,
      isGroupedWithCluster: false,
      suggestedExpertise: newChallenge.suggestedExpertise,
      assignedDepartment: newChallenge.assignedDepartment,
      keywords: newChallenge.keywords,
      aiSummary: newChallenge.aiSummary,
      currentStatus: newChallenge.status,
    },
  };
}

// 4. Fetch Project Workspaces
export async function getWorkspaces() {
  return sessionWorkspaces.length > 0 ? sessionWorkspaces : [];
}

// 5. Fetch Single Project Workspace
export async function getWorkspace(id = '') {
  const ws = sessionWorkspaces.find(w => w._id === id || w.id === id);
  return ws || sessionWorkspaces[0] || null;
}

// 6. Toggle Workspace Task & Advance Milestone / Deployment State
export async function updateWorkspaceTask(workspaceId, taskId) {
  const ws = sessionWorkspaces.find(w => w._id === workspaceId || w.id === workspaceId) || sessionWorkspaces[0];
  if (!ws) return null;

  if (Array.isArray(ws.tasks)) {
    const task = ws.tasks.find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
    }
    const completedCount = ws.tasks.filter(t => t.done).length;
    const pct = ws.tasks.length > 0 ? Math.round((completedCount / ws.tasks.length) * 100) : 0;
    ws.progressPercentage = pct;

    if (pct === 100) {
      ws.currentPhase = 'Deployment';
      ws.status = 'Deployed';
      // Sync challenge status to Deployed
      const matchingChal = sessionChallenges.find(c => c.title === ws.title || c._id === ws.challengeId);
      if (matchingChal) {
        matchingChal.status = 'Deployed';
      }
    } else if (pct >= 75) {
      ws.currentPhase = 'Pilot';
      ws.status = 'Pilot';
    } else if (pct >= 40) {
      ws.currentPhase = 'Prototype';
      ws.status = 'In Development';
    } else {
      ws.currentPhase = 'Research';
      ws.status = 'In Development';
    }
  }

  return ws;
}

// 7. User Login
export async function loginUser(credentials) {
  try {
    return await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
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

// 8. Instant Mobile-Only Authentication
export async function authenticateWithMobile(mobileNumber, fullName = '', role = 'Citizen') {
  try {
    return await apiFetch('/auth/mobile-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, fullName, role }),
    });
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

// 9. Send OTP to Mobile Number
export async function sendOtp(mobileNumber) {
  try {
    return await apiFetch('/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });
  } catch (err) {
    return {
      success: true,
      demoOtp: '2604',
      message: `Demo OTP sent to +91 ${mobileNumber}`,
    };
  }
}

// 10. Verify OTP & Authenticate
export async function verifyOtp(mobileNumber, otp, fullName = '', role = 'Citizen') {
  try {
    return await apiFetch('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, otp, fullName, role }),
    });
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

// 11. Seed Demo Challenges for Interactive Testing
export async function seedChallenges() {
  try {
    const json = await apiFetch('/challenges/seed', { method: 'POST' });
    if (json.success && Array.isArray(json.data)) {
      saveLocalChallenges(json.data);
    }
    return json;
  } catch (err) {
    return { success: false, message: 'Backend unreachable' };
  }
}

// 12. Reset All Datasets to Blank Slate
export async function resetAllData() {
  try {
    const json = await apiFetch('/challenges/reset', { method: 'POST' });
    saveLocalChallenges([]);
    return json;
  } catch (err) {
    saveLocalChallenges([]);
    return { success: true, message: 'Local data reset' };
  }
}

// 13. Create Project Workspace from Accepted Challenge
export async function createWorkspace(data) {
  const existingIndex = sessionWorkspaces.findIndex(w => w.title === data.title);
  
  const defaultTasks = [
    { id: 1, title: 'Ground site survey & citizen problem validation', done: false, stage: 1, date: 'Stage 1: Research' },
    { id: 2, title: 'Engineering CAD blueprint & sensor simulation', done: false, stage: 2, date: 'Stage 2: Prototype' },
    { id: 3, title: 'Lab hardware prototyping & component integration', done: false, stage: 2, date: 'Stage 2: Prototype' },
    { id: 4, title: 'District pilot trial & nodal officer field testing', done: false, stage: 3, date: 'Stage 3: Pilot' },
    { id: 5, title: 'Final field deployment, IoT telemetry & citizen notification', done: false, stage: 4, date: 'Stage 4: Deployment' }
  ];

  const newWorkspace = {
    _id: `ws_${Date.now()}`,
    title: data.title || 'Community Innovation Sprint',
    domain: data.domain || 'Rural Innovation',
    location: data.location || 'Jharkhand',
    status: 'In Development',
    currentPhase: 'Research',
    progressPercentage: 0,
    team: {
      university: data.leadInstitution || 'NIT Jamshedpur (4 NEP 2020 Credits Assigned)',
      industry: 'CSR Partner (Grant Allocated)',
      government: 'District Administration',
      community: 'Citizen Nodal Group'
    },
    tasks: defaultTasks,
    hardwareBom: []
  };

  if (existingIndex >= 0) {
    sessionWorkspaces[existingIndex] = { ...sessionWorkspaces[existingIndex], ...newWorkspace };
  } else {
    sessionWorkspaces.unshift(newWorkspace);
  }

  // Update challenge status
  const chal = sessionChallenges.find(c => c.title === data.title);
  if (chal) {
    chal.status = 'In Development';
  }

  return { success: true, data: newWorkspace };
}

// 14. Get Challenges Pending Government Verification
export async function getPendingChallenges() {
  return sessionChallenges.filter(c => c.status === 'Government Verification');
}

// 15. Government Officer Takes Action on a Challenge
export async function performGovernmentAction(challengeId, action, officerName, note = '') {
  const ch = sessionChallenges.find(c => c._id === challengeId || c.id === challengeId);
  if (ch) {
    const actionToStatus = {
      Approve: 'Approved',
      Dismiss: 'Dismissed',
      Sanction: 'Sanctioned',
      RequestInfo: 'Government Verification',
    };
    ch.status = actionToStatus[action] || 'Approved';
    ch.governmentAction = action;
    ch.governmentOfficer = officerName;
    ch.governmentNote = note;
  }
  return { success: true, message: `Challenge ${action}d successfully` };
}

// 16. University Applies to Take Up a Sanctioned Challenge
export async function universityApplyToChallenge(challengeId, universityName) {
  const ch = sessionChallenges.find(c => c._id === challengeId || c.id === challengeId);
  if (ch) {
    ch.universityName = universityName;
    ch.status = 'University Matched';
  }
  return { success: true, message: `${universityName} applied successfully` };
}

// 17. Fetch Audit Log Entries
export async function getAuditLogs() {
  return [];
}

// 18. Industry Funds a Government-Approved Challenge
export async function industryFundChallenge(challengeId, sponsorName, fundingAmount) {
  const ch = sessionChallenges.find(c => c._id === challengeId || c.id === challengeId);
  if (ch) {
    ch.isIndustryFunded = true;
    ch.industrySponsor = sponsorName;
    ch.industryFundingAmount = fundingAmount;
    if (!ch.fundingSources) ch.fundingSources = [];
    ch.fundingSources.push(`${sponsorName} (${fundingAmount})`);
  }
  return { success: true, message: 'Industry funding committed successfully' };
}

// 19. Fetch Impact Stories
export async function getImpactStories() {
  if (!sessionWorkspaces || sessionWorkspaces.length === 0) {
    return [];
  }
  return sessionWorkspaces.map(w => {
    const isDeployed = w.progressPercentage === 100 || w.currentPhase === 'Deployment' || w.status?.toLowerCase().includes('deploy');
    return {
      title: w.title,
      location: w.location || 'Jharkhand',
      beneficiaries: isDeployed ? '4,800 Villagers' : `${(w.progressPercentage || 25) * 30 + 500} Villagers`,
      domain: w.domain || 'Rural Innovation',
      progress: w.progressPercentage || 0,
      status: isDeployed ? 'Deployed & Telemetry Active' : 'Active Engineering Sprint',
      desc: `Collaborative solution adopted by ${w.team?.university || 'NIT Jamshedpur'} with ${w.team?.industry || 'CSR Partner'}.`
    };
  });
}



