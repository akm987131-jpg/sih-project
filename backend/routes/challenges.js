import express from 'express';
import mongoose from 'mongoose';
import Challenge from '../models/Challenge.js';
import ChallengeReport from '../models/ChallengeReport.js';
import AuditLog from '../models/AuditLog.js';

// Modular Services
import { analyzeProblem, extractKeywords, calculatePriority, findSimilarChallenges, generateChallengeTitle } from '../services/ai_service.js';
import { resolveDistrict, formatGeoPoint } from '../services/location_service.js';
import { findUniversityMatches, findIndustryPartners } from '../services/matching_service.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Pure In-Memory State (RAM only - resets when server restarts or when MongoDB is offline)
export let memoryChallenges = [];
export let memoryReports = [];
export let memoryAuditLogs = [];

export function saveLocalData() {
  // RAM only: no disk persistence so data resets cleanly on refresh/restart
}

/**
 * GET /api/v1/challenges
 * Fetch challenges with optional filters: domain, priority, district, status, search.
 */
router.get('/', async (req, res) => {
  try {
    const { domain, priority, district, status, search, forIndustry } = req.query;
    const approvedForIndustry = ['Approved', 'Sanctioned', 'University Matched', 'In Development', 'Pilot', 'Deployed'];

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (domain && domain !== 'All') filter.domain = domain;
      if (priority && priority !== 'All') filter.priority = priority;
      if (district && district !== 'All') filter.district = district;
      if (status && status !== 'All') {
        filter.status = status;
      } else if (forIndustry === 'true') {
        // Industry only sees government-approved/sanctioned challenges (never unverified reports)
        filter.status = { $in: approvedForIndustry };
      }
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
    if (status && status !== 'All') {
      results = results.filter(c => c.status === status);
    } else if (forIndustry === 'true') {
      // Industry only sees government-approved/sanctioned challenges
      results = results.filter(c => approvedForIndustry.includes(c.status));
    }
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(c =>
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.district.toLowerCase().includes(s)
      );
    }
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * GET /api/v1/challenges/pending-verification
 * Returns challenges waiting for government officer review (status: Government Verification).
 */
router.get('/pending-verification', async (req, res) => {
  try {
    const pendingStatuses = ['Government Verification'];
    if (mongoose.connection.readyState === 1) {
      const pending = await Challenge.find({ status: { $in: pendingStatuses } })
        .sort({ priorityScore: -1, createdAt: -1 });
      const pendingWithReports = await Promise.all(pending.map(async (c) => {
        const reports = await ChallengeReport.find({ challengeId: c._id });
        const cObj = c.toObject();
        cObj.reports = reports;
        if (!cObj.photoUrl && reports.length > 0 && reports[0].photoUrl) {
          cObj.photoUrl = reports[0].photoUrl;
        }
        if (!cObj.locationName && reports.length > 0 && reports[0].locationName) {
          cObj.locationName = reports[0].locationName;
        }
        if (!cObj.citizenName && reports.length > 0 && reports[0].citizenName) {
          cObj.citizenName = reports[0].citizenName;
        }
        return cObj;
      }));
      return res.json({ success: true, count: pendingWithReports.length, data: pendingWithReports });
    }
    const pending = memoryChallenges.filter(c => pendingStatuses.includes(c.status)).map(c => {
      const reports = memoryReports.filter(r => r.challengeId === c._id);
      return {
        ...c,
        reports,
        photoUrl: c.photoUrl || (reports.length > 0 ? reports[0].photoUrl : ''),
        locationName: c.locationName || (reports.length > 0 ? reports[0].locationName : `${c.district}, Jharkhand`),
        citizenName: c.citizenName || (reports.length > 0 ? reports[0].citizenName : 'Anonymous Citizen'),
      };
    });
    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


/**
 * GET /api/v1/challenges/:id
 * Get a specific challenge with its citizen reports and university/industry match suggestions.
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
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
      reports = memoryReports.filter(r => r.challengeId === challenge._id);
    }

    const universityMatch = findUniversityMatches(challenge);
    const industryPartner = findIndustryPartners(challenge);

    res.json({
      success: true,
      data: challenge,
      reports,
      quadHelixMatch: { university: universityMatch, industry: industryPartner },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/challenges/report
 * Citizen submits a problem report.
 * Flow: validate -> resolveDistrict -> analyzeProblem -> findSimilarChallenges -> save -> return
 *
 * Status after processing:
 *  New cluster    -> 'Government Verification'
 *  Added to existing cluster -> cluster status unchanged, reportCount incremented
 */
router.post('/report', async (req, res) => {
  try {
    const { title, problemText, photoUrl, locationName, coordinates, severity = 'High', citizenName, citizenPhone, category, domain } = req.body;

    if (!problemText || problemText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Problem description is required' });
    }

    // Step 1: Resolve location
    const geoInfo = resolveDistrict(coordinates, locationName);
    const geoPoint = formatGeoPoint(geoInfo.coordinates[0], geoInfo.coordinates[1]);

    // Step 2: AI classification and keyword extraction (respects user selected domain/category)
    const userCategory = category || domain || '';
    const aiAnalysis = analyzeProblem(problemText, severity, userCategory);
    const keywords = extractKeywords(problemText);
    const finalTitle = (title && title.trim().length > 0) 
      ? title.trim() 
      : generateChallengeTitle(problemText, aiAnalysis.domain);
    const aiSummary = `Problem classified as ${aiAnalysis.domain}. Key issues: ${keywords.join(', ')}. Suggested expertise: ${aiAnalysis.suggestedExpertise}.`;

    // Step 3: Duplicate detection — clusters if same district and problem keyword or title overlap
    let existingCluster = null;
    if (mongoose.connection.readyState === 1) {
      const activeChallenges = await Challenge.find({ domain: aiAnalysis.domain, status: { $ne: 'Deployed' } });
      existingCluster = findSimilarChallenges(aiAnalysis.domain, geoInfo.coordinates, problemText, geoInfo.district, activeChallenges, finalTitle);
    } else {
      existingCluster = findSimilarChallenges(aiAnalysis.domain, geoInfo.coordinates, problemText, geoInfo.district, memoryChallenges, finalTitle);
    }

    let isGrouped = false;
    let targetChallenge = null;

    // Step 4: Save or update master challenge
    if (mongoose.connection.readyState === 1) {
      if (existingCluster) {
        existingCluster.reportCount += 1;
        const priorityCalc = calculatePriority(existingCluster.priority, existingCluster.reportCount);
        existingCluster.priorityScore = priorityCalc.priorityScore;
        if (existingCluster.status === 'AI Analysis') {
          existingCluster.status = 'Duplicate Check';
        }
        await existingCluster.save();
        targetChallenge = existingCluster;
        isGrouped = true;
      } else {
        targetChallenge = new Challenge({
          title: finalTitle,
          description: problemText,
          domain: aiAnalysis.domain,
          priority: aiAnalysis.priority,
          priorityScore: aiAnalysis.priorityScore,
          district: geoInfo.district,
          state: geoInfo.state,
          location: geoPoint,
          locationName: locationName || `${geoInfo.district}, Jharkhand`,
          photoUrl: photoUrl || '',
          citizenName: citizenName || 'Anonymous Citizen',
          citizenPhone: citizenPhone || '',
          reportCount: 1,
          suggestedExpertise: aiAnalysis.suggestedExpertise,
          aiSummary,
          keywords,
          status: 'Government Verification',
        });
        await targetChallenge.save();
      }

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
          keywords,
          aiSummary,
          currentStatus: targetChallenge.status,
        },
      });
    }

    // In-memory fallback
    if (existingCluster) {
      existingCluster.reportCount += 1;
      const priorityCalc = calculatePriority(existingCluster.priority, existingCluster.reportCount);
      existingCluster.priorityScore = priorityCalc.priorityScore;
      if (existingCluster.status === 'AI Analysis') existingCluster.status = 'Duplicate Check';
      if (!existingCluster.photoUrl && photoUrl) existingCluster.photoUrl = photoUrl;
      if (!existingCluster.locationName && locationName) existingCluster.locationName = locationName;
      targetChallenge = existingCluster;
      isGrouped = true;
    } else {
      targetChallenge = {
        _id: `mem_${Date.now()}`,
        title: finalTitle,
        description: problemText,
        domain: aiAnalysis.domain,
        priority: aiAnalysis.priority,
        priorityScore: aiAnalysis.priorityScore,
        district: geoInfo.district,
        state: geoInfo.state,
        location: geoPoint,
        locationName: locationName || `${geoInfo.district}, Jharkhand`,
        photoUrl: photoUrl || '',
        citizenName: citizenName || 'Anonymous Citizen',
        citizenPhone: citizenPhone || '',
        reportCount: 1,
        suggestedExpertise: aiAnalysis.suggestedExpertise,
        assignedDepartment: 'Drinking Water & Sanitation Dept (DWSD)',
        aiSummary,
        keywords,
        status: 'Government Verification',
        governmentAction: '',
        governmentNote: '',
        governmentOfficer: '',
        governmentActionAt: null,
        sanctionedAt: null,
        universityName: '',
        fundingSources: [],
        createdAt: new Date().toISOString(),
      };
      memoryChallenges.unshift(targetChallenge);
    }

    const reportId = `rep_${Date.now()}`;
    memoryReports.push({
      _id: reportId,
      challengeId: targetChallenge._id,
      citizenName: citizenName || 'Anonymous Citizen',
      citizenPhone: citizenPhone || '',
      problemText,
      photoUrl: photoUrl || '',
      locationName: locationName || `${geoInfo.district}, Jharkhand`,
      location: geoPoint,
      perceivedSeverity: severity,
      createdAt: new Date().toISOString(),
    });

    saveLocalData();

    res.status(201).json({
      success: true,
      message: isGrouped ? 'Grouped into existing Master Challenge' : 'New Master Challenge created',
      aiAnalysisResult: {
        reportId,
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
        keywords,
        aiSummary,
        currentStatus: targetChallenge.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/v1/challenges/:id/government-action
 * Government officer takes action on a challenge.
 * Actions: Approve -> 'Approved', Dismiss -> 'Dismissed', Sanction -> 'Sanctioned', RequestInfo -> stays 'Government Verification'
 * Every action is written to the AuditLog.
 */
router.patch('/:id/government-action', async (req, res) => {
  try {
    const { action, officerName, note } = req.body;

    const validActions = ['Approve', 'Dismiss', 'Sanction', 'RequestInfo'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }
    if (!officerName || officerName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'officerName is required for the audit log' });
    }

    const actionToStatus = {
      Approve: 'Approved',
      Dismiss: 'Dismissed',
      Sanction: 'Sanctioned',
      RequestInfo: 'Government Verification',
    };
    const newStatus = actionToStatus[action];

    if (mongoose.connection.readyState === 1) {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

      challenge.governmentAction = action;
      challenge.governmentNote = note || '';
      challenge.governmentOfficer = officerName.trim();
      challenge.governmentActionAt = new Date();
      challenge.status = newStatus;
      if (action === 'Sanction') challenge.sanctionedAt = new Date();
      await challenge.save();

      const auditEntry = new AuditLog({
        officerName: officerName.trim(),
        action,
        challengeId: String(challenge._id),
        challengeTitle: challenge.title,
        note: note || '',
      });
      await auditEntry.save();

      return res.json({ success: true, message: `Challenge ${action}d successfully`, data: challenge });
    }

    // In-memory fallback
    const challenge = memoryChallenges.find(c => c._id === req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    challenge.governmentAction = action;
    challenge.governmentNote = note || '';
    challenge.governmentOfficer = officerName.trim();
    challenge.governmentActionAt = new Date().toISOString();
    challenge.status = newStatus;
    if (action === 'Sanction') challenge.sanctionedAt = new Date().toISOString();

    memoryAuditLogs.unshift({
      _id: `audit_${Date.now()}`,
      officerName: officerName.trim(),
      action,
      challengeId: challenge._id,
      challengeTitle: challenge.title,
      note: note || '',
      timestamp: new Date().toISOString(),
    });

    saveLocalData();

    res.json({ success: true, message: `Challenge ${action}d successfully`, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/v1/challenges/:id/industry-fund
 * Industry commits CSR grant funding to a challenge.
 * Requirement: Challenge must be verified & approved/sanctioned by Government first.
 * Once funded, an Approved challenge becomes available for Universities to take!
 */
router.patch('/:id/industry-fund', async (req, res) => {
  try {
    const { sponsorName = 'Tata Projects CSR', fundingAmount = '₹12,00,000' } = req.body;

    if (mongoose.connection.readyState === 1) {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

      // Check that government has verified and approved/sanctioned this challenge as real
      const isGovernmentApproved = challenge.status === 'Approved' || challenge.status === 'Sanctioned';
      if (!isGovernmentApproved) {
        return res.status(400).json({
          success: false,
          message: `Cannot fund challenge. It must first be Approved or Sanctioned by Government. Current status: ${challenge.status}`,
        });
      }

      challenge.isIndustryFunded = true;
      challenge.industrySponsor = sponsorName;
      challenge.industryFundingAmount = fundingAmount;
      challenge.industryFundedAt = new Date();
      const grantTag = `${sponsorName} (${fundingAmount})`;
      if (!challenge.fundingSources) challenge.fundingSources = [];
      if (!challenge.fundingSources.includes(grantTag)) {
        challenge.fundingSources.push(grantTag);
      }
      await challenge.save();

      return res.json({
        success: true,
        message: `CSR Grant of ${fundingAmount} pledged by ${sponsorName}. Project is now unlocked for University adoption!`,
        data: challenge,
      });
    }

    // In-memory fallback
    const challenge = memoryChallenges.find(c => c._id === req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const isGovernmentApproved = challenge.status === 'Approved' || challenge.status === 'Sanctioned';
    if (!isGovernmentApproved) {
      return res.status(400).json({
        success: false,
        message: `Cannot fund challenge. It must first be Approved or Sanctioned by Government. Current status: ${challenge.status}`,
      });
    }

    challenge.isIndustryFunded = true;
    challenge.industrySponsor = sponsorName;
    challenge.industryFundingAmount = fundingAmount;
    challenge.industryFundedAt = new Date().toISOString();
    const grantTag = `${sponsorName} (${fundingAmount})`;
    if (!challenge.fundingSources) challenge.fundingSources = [];
    if (!challenge.fundingSources.includes(grantTag)) {
      challenge.fundingSources.push(grantTag);
    }

    saveLocalData();

    res.json({
      success: true,
      message: `CSR Grant of ${fundingAmount} pledged by ${sponsorName}. Project is now unlocked for University adoption!`,
      data: challenge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/v1/challenges/:id/university-apply
 * A university applies to solve a challenge.
 * A university can take the project if:
 *   1. Government Sanctioned it (status: 'Sanctioned')
 *   OR
 *   2. Government Approved it AND Industry Funded it (status: 'Approved' && (isIndustryFunded || fundingSources.length > 0))
 * After applying, status becomes 'University Matched'.
 */
router.patch('/:id/university-apply', async (req, res) => {
  try {
    const { universityName } = req.body;
    if (!universityName || universityName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'universityName is required' });
    }

    const checkEligibility = (challenge) => {
      const isSanctioned = challenge.status === 'Sanctioned';
      const isApprovedAndFunded = challenge.status === 'Approved' && 
        (challenge.isIndustryFunded || (challenge.fundingSources && challenge.fundingSources.length > 0));
      return isSanctioned || isApprovedAndFunded;
    };

    if (mongoose.connection.readyState === 1) {
      const challenge = await Challenge.findById(req.params.id);
      if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
      if (!checkEligibility(challenge)) {
        return res.status(400).json({
          success: false,
          message: `Challenge is not eligible for university adoption. Must be Government Sanctioned OR Government Approved with Industry Funding. Current status: ${challenge.status}, Industry funded: ${Boolean(challenge.isIndustryFunded)}`,
        });
      }
      challenge.universityName = universityName.trim();
      challenge.universityAppliedAt = new Date();
      challenge.status = 'University Matched';
      await challenge.save();
      return res.json({ success: true, message: `${universityName} applied successfully`, data: challenge });
    }

    // In-memory fallback
    const challenge = memoryChallenges.find(c => c._id === req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (!checkEligibility(challenge)) {
      return res.status(400).json({
        success: false,
        message: `Challenge is not eligible for university adoption. Must be Government Sanctioned OR Government Approved with Industry Funding. Current status: ${challenge.status}, Industry funded: ${Boolean(challenge.isIndustryFunded)}`,
      });
    }
    challenge.universityName = universityName.trim();
    challenge.universityAppliedAt = new Date().toISOString();
    challenge.status = 'University Matched';

    saveLocalData();

    res.json({ success: true, message: `${universityName} applied successfully`, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/v1/challenges/seed
 * Seeds 5 demo challenges across different workflow stages for testing:
 *   1. Government Verification (pending officer decision - hidden from Industry & University)
 *   2. Sanctioned (Government Sanctioned - immediately open for Universities)
 *   3. University Matched (Active project with NIT Jamshedpur)
 *   4. Approved (Government Approved as real - visible to Industry to fund, not yet takeable by Universities)
 *   5. Approved + Industry Funded (Government Approved AND Industry Funded - ready for University adoption)
 */
router.post('/seed', (req, res) => {
  const ts = Date.now();

  // 1. Pending Verification (hidden from industry & university)
  const sample1 = {
    _id: `chal_${ts}_1`,
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
    aiSummary: 'High arsenic contamination affecting 8 panchayats. Immediate filtration and IoT monitoring required.',
    keywords: ['arsenic', 'groundwater', 'contamination', 'tube-well', 'filtration'],
    status: 'Government Verification',
    governmentAction: '', governmentNote: '', governmentOfficer: '',
    governmentActionAt: null, sanctionedAt: null,
    universityName: '', fundingSources: [],
    isIndustryFunded: false, industrySponsor: '', industryFundingAmount: '',
    createdAt: new Date().toISOString(),
  };

  // 2. Government Sanctioned (open for university adoption)
  const sample2 = {
    _id: `chal_${ts}_2`,
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
    aiSummary: 'Fungal blight affecting potato yield. Solar spore traps and IoT weather forecasting recommended.',
    keywords: ['blight', 'fungal', 'potato', 'crop', 'farmers', 'yield'],
    status: 'Sanctioned',
    governmentAction: 'Sanction',
    governmentNote: 'Approved for university innovation — high agricultural impact',
    governmentOfficer: 'District Collector, Hazaribagh',
    governmentActionAt: new Date().toISOString(),
    sanctionedAt: new Date().toISOString(),
    universityName: '', fundingSources: ['Government Grant'],
    isIndustryFunded: false, industrySponsor: '', industryFundingAmount: '',
    createdAt: new Date().toISOString(),
  };

  // 3. Already Matched with University
  const sample3 = {
    _id: `chal_${ts}_3`,
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
    aiSummary: 'Forest produce spoiling due to no cold storage. Phase-change solar cold storage recommended.',
    keywords: ['cold storage', 'solar', 'tribal', 'forest produce', 'mahua'],
    status: 'University Matched',
    governmentAction: 'Sanction',
    governmentNote: 'Critical tribal livelihood issue — sanctioned for immediate university intervention',
    governmentOfficer: 'DC East Singhbhum',
    governmentActionAt: new Date().toISOString(),
    sanctionedAt: new Date().toISOString(),
    universityName: 'NIT Jamshedpur',
    universityAppliedAt: new Date().toISOString(),
    fundingSources: ['Government Grant', 'Tata Steel CSR'],
    isIndustryFunded: true, industrySponsor: 'Tata Steel CSR', industryFundingAmount: '₹10,00,000',
    createdAt: new Date().toISOString(),
  };

  // 4. Government Approved as Real (visible to Industry to fund, NOT yet takeable by university)
  const sample4 = {
    _id: `chal_${ts}_4`,
    title: 'Smart Fluoride Filtration & Telemetry in Palamu',
    description: 'Fluorosis detected in 12 schools in Palamu district. Verified authentic by DWSD. Awaiting CSR/Industry grant to initiate university prototyping.',
    domain: 'Healthcare',
    priority: 'High',
    priorityScore: 9.1,
    district: 'Palamu',
    state: 'Jharkhand',
    location: { type: 'Point', coordinates: [84.0715, 24.0378] },
    reportCount: 9,
    suggestedExpertise: 'Biomedical & Environmental Engineering',
    assignedDepartment: 'Department of Health & DWSD',
    aiSummary: 'Severe fluorosis verified in rural schools. Need activated alumina filtration prototype.',
    keywords: ['fluoride', 'filtration', 'drinking water', 'fluorosis', 'telemetry'],
    status: 'Approved',
    governmentAction: 'Approve',
    governmentNote: 'Verified authentic field emergency by DWSD. Approved for industry CSR co-funding.',
    governmentOfficer: 'District Magistrate, Palamu',
    governmentActionAt: new Date().toISOString(),
    sanctionedAt: null,
    universityName: '',
    fundingSources: [],
    isIndustryFunded: false,
    industrySponsor: '',
    industryFundingAmount: '',
    createdAt: new Date().toISOString(),
  };

  // 5. Government Approved + Industry Funded (unlocked for University adoption!)
  const sample5 = {
    _id: `chal_${ts}_5`,
    title: 'Decentralized Micro-Hydro for Irrigation in Simdega',
    description: 'Small perennial streams flowing through tribal hamlets lack lifting pumps. Verified authentic by Irrigation Dept and funded by Tata Projects CSR.',
    domain: 'Infrastructure',
    priority: 'Medium',
    priorityScore: 7.8,
    district: 'Simdega',
    state: 'Jharkhand',
    location: { type: 'Point', coordinates: [84.5000, 22.6167] },
    reportCount: 6,
    suggestedExpertise: 'Civil & Hydro-Mechanical Engineering',
    assignedDepartment: 'Water Resources Department',
    aiSummary: 'Micro-hydro run-of-the-river lift irrigation for tribal farmers. CSR funded and verified.',
    keywords: ['micro-hydro', 'irrigation', 'lift pump', 'tribal farming', 'stream'],
    status: 'Approved',
    governmentAction: 'Approve',
    governmentNote: 'Approved as genuine high-priority irrigation project.',
    governmentOfficer: 'Deputy Commissioner, Simdega',
    governmentActionAt: new Date().toISOString(),
    sanctionedAt: null,
    universityName: '',
    fundingSources: ['Tata Projects CSR (₹14,50,000)'],
    isIndustryFunded: true,
    industrySponsor: 'Tata Projects CSR',
    industryFundingAmount: '₹14,50,000',
    createdAt: new Date().toISOString(),
  };

  memoryChallenges = [sample1, sample2, sample3, sample4, sample5];
  memoryReports = [
    { _id: 'rep_1', challengeId: sample1._id, citizenName: 'Ramu Singh', problemText: sample1.description, locationName: 'Ranchi, Jharkhand', perceivedSeverity: 'High', createdAt: new Date().toISOString() },
    { _id: 'rep_2', challengeId: sample2._id, citizenName: 'Kalyan Mahato', problemText: sample2.description, locationName: 'Hazaribagh, Jharkhand', perceivedSeverity: 'Medium', createdAt: new Date().toISOString() },
    { _id: 'rep_3', challengeId: sample3._id, citizenName: 'Sunita Oraon', problemText: sample3.description, locationName: 'East Singhbhum, Jharkhand', perceivedSeverity: 'High', createdAt: new Date().toISOString() },
    { _id: 'rep_4', challengeId: sample4._id, citizenName: 'Anand Kumar', problemText: sample4.description, locationName: 'Palamu, Jharkhand', perceivedSeverity: 'High', createdAt: new Date().toISOString() },
    { _id: 'rep_5', challengeId: sample5._id, citizenName: 'Birsa Munda', problemText: sample5.description, locationName: 'Simdega, Jharkhand', perceivedSeverity: 'Medium', createdAt: new Date().toISOString() },
  ];
  memoryAuditLogs = [
    { _id: 'audit_1', officerName: 'District Collector, Hazaribagh', action: 'Sanction', challengeId: sample2._id, challengeTitle: sample2.title, note: sample2.governmentNote, timestamp: new Date().toISOString() },
    { _id: 'audit_2', officerName: 'DC East Singhbhum', action: 'Sanction', challengeId: sample3._id, challengeTitle: sample3.title, note: sample3.governmentNote, timestamp: new Date().toISOString() },
    { _id: 'audit_3', officerName: 'District Magistrate, Palamu', action: 'Approve', challengeId: sample4._id, challengeTitle: sample4.title, note: sample4.governmentNote, timestamp: new Date().toISOString() },
    { _id: 'audit_4', officerName: 'Deputy Commissioner, Simdega', action: 'Approve', challengeId: sample5._id, challengeTitle: sample5.title, note: sample5.governmentNote, timestamp: new Date().toISOString() },
  ];

  saveLocalData();

  res.json({ success: true, message: 'Sample challenges seeded', count: memoryChallenges.length, data: memoryChallenges });
});

/**
 * POST /api/v1/challenges/reset
 * Wipe all in-memory data back to blank slate
 */
router.post('/reset', (req, res) => {
  memoryChallenges = [];
  memoryReports = [];
  memoryAuditLogs = [];
  saveLocalData();
  res.json({ success: true, message: 'All datasets reset to blank slate', count: 0, data: [] });
});

export default router;
