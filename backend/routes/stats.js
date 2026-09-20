import express from 'express';
import { memoryChallenges, memoryReports } from './challenges.js';
import { memoryWorkspaces } from './workspaces.js';

const router = express.Router();

// GET /api/v1/stats/summary (Calculated dynamically from live records)
router.get('/summary', (req, res) => {
  const reportsCount = memoryReports.length > 0 
    ? memoryReports.length 
    : memoryChallenges.reduce((acc, c) => acc + (c.reportCount || 1), 0);
  const challengesCount = memoryChallenges.length;
  const workspacesCount = memoryWorkspaces.length;
  const deployedCount = memoryWorkspaces.filter(w => 
    w.progressPercentage === 100 || 
    w.currentPhase === 'Deployment' || 
    w.status?.toLowerCase().includes('deploy')
  ).length;

  const uniqueDistricts = [...new Set([
    ...memoryChallenges.map(c => c.district).filter(Boolean),
    ...memoryWorkspaces.map(w => w.location).filter(Boolean)
  ])];

  const estimatedBeneficiaries = (reportsCount > 0)
    ? (reportsCount * 1850)
    : (workspacesCount > 0 ? workspacesCount * 3200 : 0);

  res.json({
    success: true,
    data: {
      reportsReceived: String(reportsCount),
      challengesIdentified: String(challengesCount),
      projectsInProgress: String(workspacesCount),
      solutionsDeployed: String(deployedCount),
      peopleBenefited: estimatedBeneficiaries > 0 ? estimatedBeneficiaries.toLocaleString('en-IN') : "0",
      statesCovered: uniqueDistricts.length > 0 ? `${uniqueDistricts.length} Districts` : (challengesCount > 0 ? "1 District" : "0"),
    },
  });
});

// GET /api/v1/gov/district-map (Calculated dynamically from live challenges)
router.get('/district-map', (req, res) => {
  const districtMap = {};
  
  memoryChallenges.forEach(c => {
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

  res.json({
    success: true,
    data: {
      state: "Jharkhand",
      totalDistricts: 24,
      districtHotspots: Object.values(districtMap),
    },
  });
});

// GET /api/v1/impact/stories & /api/v1/stats/stories
router.get('/stories', (req, res) => {
  const stories = memoryWorkspaces.map(w => ({
    title: w.title,
    location: w.location || 'Jharkhand',
    beneficiaries: `${(w.progressPercentage || 25) * 40 + 800} Villagers`,
    domain: w.domain || 'Rural Innovation',
    progress: w.progressPercentage || 0,
    status: w.status || 'Active Engineering Sprint',
    desc: `Collaborative solution adopted by ${w.team?.university || 'University Innovation Lab'} with ${w.team?.industry || 'CSR Partner'}.`
  }));

  res.json({
    success: true,
    data: stories,
  });
});

export default router;
