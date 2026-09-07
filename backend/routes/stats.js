import express from 'express';
import { memoryChallenges, memoryReports } from './challenges.js';
import { memoryWorkspaces } from './workspaces.js';

const router = express.Router();

// GET /api/v1/stats/summary (Calculated dynamically from live records)
router.get('/summary', (req, res) => {
  const reportsCount = memoryReports.length;
  const challengesCount = memoryChallenges.length;
  const workspacesCount = memoryWorkspaces.length;
  const deployedCount = memoryWorkspaces.filter(w => w.currentPhase === 'Deployment' || w.status === 'Completed').length;

  res.json({
    success: true,
    data: {
      reportsReceived: String(reportsCount),
      challengesIdentified: String(challengesCount),
      projectsInProgress: String(workspacesCount),
      solutionsDeployed: String(deployedCount),
      peopleBenefited: String(reportsCount > 0 ? reportsCount * 1250 : 0),
      statesCovered: challengesCount > 0 ? "1" : "0",
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

// GET /api/v1/impact/stories
router.get('/stories', (req, res) => {
  const stories = memoryWorkspaces.map(w => ({
    title: w.title,
    location: w.location,
    beneficiaries: '3,200+ Villagers',
    desc: `Collaborative solution spearheaded by ${w.team?.university || 'State University'} with CSR support from ${w.team?.industry || 'Industry'}.`
  }));

  res.json({
    success: true,
    data: stories,
  });
});

export default router;
