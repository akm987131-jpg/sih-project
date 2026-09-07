import express from 'express';
import mongoose from 'mongoose';
import Challenge from '../models/Challenge.js';
import ChallengeReport from '../models/ChallengeReport.js';

// Modular Services as specified in Rule 4, 7 & 8
import { analyzeProblem, calculatePriority, findSimilarChallenges } from '../services/ai_service.js';
import { resolveDistrict, formatGeoPoint } from '../services/location_service.js';
import { findUniversityMatches, findIndustryPartners } from '../services/matching_service.js';

const router = express.Router();

// Clean slate storage: Starts completely blank until citizens report problems
export let memoryChallenges = [];
export let memoryReports = [];

/**
 * GET /api/v1/challenges
 * Fetch list of challenges with optional filters for domain, priority, district, and search keyword.
 */
router.get('/', async (req, res) => {
  try {
    const { domain, priority, district, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (domain && domain !== 'All') filter.domain = domain;
      if (priority && priority !== 'All') filter.priority = priority;
      if (district && district !== 'All') filter.district = district;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { district: { $regex: search, $options: 'i' } },
        ];
      }
      const challenges = await Challenge.find(filter).sort({ priorityScore: -1, createdAt: -1 });
      return res.json({ success: true, count: challenges.length, data: challenges });
    }

    // In-memory fallback
    let results = [...memoryChallenges];
    if (domain && domain !== 'All') results = results.filter(c => c.domain === domain);
    if (priority && priority !== 'All') results = results.filter(c => c.priority === priority);
    if (district && district !== 'All') results = results.filter(c => c.district === district);
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(c => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s) || c.district.toLowerCase().includes(s));
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/v1/challenges/:id
 * Retrieve specific challenge details along with university & industry matchmaking suggestions.
 */
router.get('/:id', async (req, res) => {
  try {
    let challenge = null;
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
      reports = await ChallengeReport.find({ challengeId: challenge._id });
    } else {
      challenge = memoryChallenges.find(c => c._id === req.params.id) || memoryChallenges[0];
      reports = memoryReports.filter(r => r.challengeId === challenge._id);
    }

    // Attach Quad-Helix University and Industry matching metadata
    const universityMatch = findUniversityMatches(challenge);
    const industryPartner = findIndustryPartners(challenge);

    res.json({
      success: true,
      data: challenge,
      reports,
      quadHelixMatch: {
        university: universityMatch,
        industry: industryPartner,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/challenges/report
 * Follows Rule 11:
 * validateChallenge() -> resolveDistrict() -> analyzeProblem() -> findSimilarChallenges() -> calculatePriority() -> saveChallenge() -> return result
 */
router.post('/report', async (req, res) => {
  try {
    const {
      problemText,
      photoUrl,
      locationName,
      coordinates,
      severity = 'High',
      citizenName,
      citizenPhone,
    } = req.body;

    // Step 1: Validate input
    if (!problemText || problemText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Problem description is required' });
    }

    // Step 2: Location resolution (GIS service)
    const geoInfo = resolveDistrict(coordinates, locationName);
    const geoPoint = formatGeoPoint(geoInfo.coordinates[0], geoInfo.coordinates[1]);

    // Step 3: AI Classification & Analysis (AI service)
    const aiAnalysis = analyzeProblem(problemText, severity);

    // Step 4: Deduplication & Cluster Finding (AI service)
    let existingCluster = null;
    if (mongoose.connection.readyState === 1) {
      const activeChallenges = await Challenge.find({ domain: aiAnalysis.domain, status: { $ne: 'Deployed' } });
      existingCluster = findSimilarChallenges(aiAnalysis.domain, geoInfo.coordinates, activeChallenges);
    } else {
      existingCluster = findSimilarChallenges(aiAnalysis.domain, geoInfo.coordinates, memoryChallenges);
    }

    let isGrouped = false;
    let targetChallenge = null;

    // Step 5: Save or Update Master Challenge
    if (mongoose.connection.readyState === 1) {
      if (existingCluster) {
        // Increment report count & dynamically recalculate priority
        existingCluster.reportCount += 1;
        const priorityCalc = calculatePriority(existingCluster.priority, existingCluster.reportCount);
        existingCluster.priorityScore = priorityCalc.priorityScore;
        await existingCluster.save();
        targetChallenge = existingCluster;
        isGrouped = true;
      } else {
        targetChallenge = new Challenge({
          title: aiAnalysis.domain === 'Water & Sanitation' ? 'Unsafe Drinking Water' : `${aiAnalysis.domain} Community Challenge`,
          description: problemText,
          domain: aiAnalysis.domain,
          priority: aiAnalysis.priority,
          priorityScore: aiAnalysis.priorityScore,
          district: geoInfo.district,
          state: geoInfo.state,
          location: geoPoint,
          reportCount: 1,
          suggestedExpertise: aiAnalysis.suggestedExpertise,
        });
        await targetChallenge.save();
      }

      // Save individual citizen report
      const newReport = new ChallengeReport({
        challengeId: targetChallenge._id,
        citizenName: citizenName || 'Anonymous Citizen',
        citizenPhone: citizenPhone || '',
        problemText,
        photoUrl: photoUrl || '',
        locationName: locationName || `${geoInfo.district}, Jharkhand`,
        location: geoPoint,
        perceivedSeverity: severity,
        clipAuthenticityScore: 0.91,
      });
      await newReport.save();

      // Step 6: Return structured response
      return res.status(201).json({
        success: true,
        message: isGrouped ? 'Grouped into existing Master Challenge' : 'New Master Challenge created',
        aiAnalysisResult: {
          reportId: newReport._id,
          challengeId: targetChallenge._id,
          identifiedProblem: targetChallenge.title,
          domain: targetChallenge.domain,
          location: `${geoInfo.district}, Jharkhand`,
          priority: targetChallenge.priority,
          priorityScore: targetChallenge.priorityScore,
          similarReportsFound: targetChallenge.reportCount,
          isGroupedWithCluster: isGrouped,
          suggestedExpertise: targetChallenge.suggestedExpertise,
          assignedDepartment: targetChallenge.assignedDepartment || 'Department of Rural Development',
        },
      });
    }

    // Step 5 (Offline/In-Memory Fallback)
    if (existingCluster) {
      existingCluster.reportCount += 1;
      const priorityCalc = calculatePriority(existingCluster.priority, existingCluster.reportCount);
      existingCluster.priorityScore = priorityCalc.priorityScore;
      targetChallenge = existingCluster;
      isGrouped = true;
    } else {
      targetChallenge = {
        _id: `mem_${Date.now()}`,
        title: aiAnalysis.domain === 'Water & Sanitation' ? 'Unsafe Drinking Water' : `${aiAnalysis.domain} Community Challenge`,
        description: problemText,
        domain: aiAnalysis.domain,
        priority: aiAnalysis.priority,
        priorityScore: aiAnalysis.priorityScore,
        district: geoInfo.district,
        state: geoInfo.state,
        location: geoPoint,
        reportCount: 1,
        suggestedExpertise: aiAnalysis.suggestedExpertise,
        assignedDepartment: 'Drinking Water & Sanitation Dept (DWSD)',
        createdAt: new Date().toISOString()
      };
      memoryChallenges.unshift(targetChallenge);
    }

    const reportId = `rep_${Date.now()}`;
    memoryReports.push({
      _id: reportId,
      challengeId: targetChallenge._id,
      problemText,
      locationName: locationName || `${geoInfo.district}, Jharkhand`,
      perceivedSeverity: severity,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: isGrouped ? 'Grouped into existing Master Challenge' : 'New Master Challenge created',
      aiAnalysisResult: {
        reportId: reportId,
        challengeId: targetChallenge._id,
        identifiedProblem: targetChallenge.title,
        domain: targetChallenge.domain,
        location: `${geoInfo.district}, Jharkhand`,
        priority: targetChallenge.priority,
        priorityScore: targetChallenge.priorityScore,
        similarReportsFound: targetChallenge.reportCount,
        isGroupedWithCluster: isGrouped,
        suggestedExpertise: targetChallenge.suggestedExpertise,
        assignedDepartment: targetChallenge.assignedDepartment || 'Department of Rural Development',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/challenges/seed
 * Seeds realistic community challenges for interactive demonstration
 */
router.post('/seed', (req, res) => {
  const sample1 = {
    _id: `chal_${Date.now()}_1`,
    title: 'Groundwater Arsenic & Turbidity Contamination',
    description: 'High arsenic content (>0.05 mg/L) detected in deep tube-wells across 8 panchayats. Immediate filtration & IoT water quality monitoring needed.',
    domain: 'Water & Sanitation',
    priority: 'High',
    priorityScore: 9.4,
    district: 'Ranchi',
    state: 'Jharkhand',
    location: { type: 'Point', coordinates: [85.3240, 23.3441] },
    reportCount: 14,
    suggestedExpertise: 'Environmental & Chemical Engineering',
    assignedDepartment: 'Drinking Water & Sanitation Dept (DWSD)',
    status: 'Escalated',
    createdAt: new Date().toISOString()
  };

  const sample2 = {
    _id: `chal_${Date.now()}_2`,
    title: 'Late Blight Disease in Plateau Potato Farming',
    description: 'Fungal outbreak destroying 60% of seed potato yields in Kanke block. Farmers need affordable solar spore traps and localized weather forecasting.',
    domain: 'Agriculture',
    priority: 'Medium',
    priorityScore: 7.2,
    district: 'Hazaribagh',
    state: 'Jharkhand',
    location: { type: 'Point', coordinates: [85.3585, 23.9961] },
    reportCount: 8,
    suggestedExpertise: 'Agronomy & Embedded IoT Systems',
    assignedDepartment: 'Department of Agriculture & Sugarcane',
    status: 'Seeking University Lead',
    createdAt: new Date().toISOString()
  };

  const sample3 = {
    _id: `chal_${Date.now()}_3`,
    title: 'Solar Cold-Storage for Forest Produce',
    description: 'Tribal minor forest produce (Mahua, Lac) spoiling before reaching regional haats. Village federations request decentralized phase-change cold storages.',
    domain: 'Renewable Energy',
    priority: 'High',
    priorityScore: 8.8,
    district: 'East Singhbhum',
    state: 'Jharkhand',
    location: { type: 'Point', coordinates: [86.2029, 22.8046] },
    reportCount: 11,
    suggestedExpertise: 'Thermal Engineering & Solar Microgrids',
    assignedDepartment: 'Jharkhand Renewable Energy Development Agency (JREDA)',
    status: 'Seeking CSR Co-Sponsor',
    createdAt: new Date().toISOString()
  };

  memoryChallenges = [sample1, sample2, sample3];
  memoryReports = [
    { _id: 'rep_1', challengeId: sample1._id, problemText: sample1.description, locationName: 'Ranchi, Jharkhand', perceivedSeverity: 'High', createdAt: new Date().toISOString() },
    { _id: 'rep_2', challengeId: sample2._id, problemText: sample2.description, locationName: 'Hazaribagh, Jharkhand', perceivedSeverity: 'Medium', createdAt: new Date().toISOString() },
    { _id: 'rep_3', challengeId: sample3._id, problemText: sample3.description, locationName: 'East Singhbhum, Jharkhand', perceivedSeverity: 'High', createdAt: new Date().toISOString() }
  ];

  res.json({ success: true, message: 'Sample community challenges seeded successfully', count: memoryChallenges.length, data: memoryChallenges });
});

/**
 * POST /api/v1/challenges/reset
 * Wipes dataset back to blank slate
 */
router.post('/reset', (req, res) => {
  memoryChallenges = [];
  memoryReports = [];
  res.json({ success: true, message: 'All datasets reset to blank slate', count: 0, data: [] });
});

export default router;
