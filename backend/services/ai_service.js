/**
 * AI Service for SamadhanSetu (समाधानसेतु)
 * Responsibility: Domain classification, keyword extraction, priority scoring, duplicate cluster detection.
 * Designed to be clear and readable for junior developers.
 */

/**
 * Classify a citizen problem description into one of the 5 core domains.
 * Uses keyword-based heuristics — no external AI model required.
 *
 * @param {string} text - The raw problem description
 * @returns {{ domain: string, suggestedExpertise: string }}
 */
/**
 * Classify a citizen problem description into one of the 5 core domains.
 * Uses keyword-based heuristics, with optional user category hint.
 *
 * @param {string} text - The raw problem description
 * @param {string} userCategory - Optional domain chosen by the citizen
 * @returns {{ domain: string, suggestedExpertise: string }}
 */
export function classifyDomain(text = '', userCategory = '') {
  const validDomains = ['Agriculture', 'Healthcare', 'Infrastructure', 'Renewable Energy', 'Water & Sanitation'];
  
  // If a valid category was explicitly selected, respect it!
  if (userCategory && validDomains.includes(userCategory)) {
    const expertiseMap = {
      'Agriculture': 'Agricultural Engineering, Irrigation Systems, IoT Moisture Control',
      'Healthcare': 'Biomedical Engineering, Public Health, Solar Cold-Chain',
      'Infrastructure': 'Civil Engineering, Structural Diagnostics, Renewable Energy',
      'Renewable Energy': 'Thermal Engineering, Solar Microgrids, Cold-Chain Logistics',
      'Water & Sanitation': 'Environmental Engineering, Water Filtration, IoT TDS Quality Monitoring'
    };
    return { 
      domain: userCategory, 
      suggestedExpertise: expertiseMap[userCategory] || 'Interdisciplinary Engineering' 
    };
  }

  const t = text.toLowerCase();

  if (t.includes('crop') || t.includes('farm') || t.includes('canal') || t.includes('soil') ||
      t.includes('seed') || t.includes('irrigation') || t.includes('grain') ||
      t.includes('potato') || t.includes('blight') || t.includes('harvest') || t.includes('fertilizer') ||
      t.includes('pest') || t.includes('paddy') || t.includes('wheat') || t.includes('kisan')) {
    return { domain: 'Agriculture', suggestedExpertise: 'Agricultural Engineering, Irrigation Systems, IoT Moisture Control' };
  }

  if (t.includes('health') || t.includes('doctor') || t.includes('medicine') ||
      t.includes('clinic') || t.includes('vaccine') || t.includes('hospital') || t.includes('fever') ||
      t.includes('disease') || t.includes('ambulance') || t.includes('patient') || t.includes('dispensary')) {
    return { domain: 'Healthcare', suggestedExpertise: 'Biomedical Engineering, Public Health, Solar Cold-Chain' };
  }

  if (t.includes('road') || t.includes('bridge') || t.includes('school') ||
      t.includes('building') || t.includes('culvert') || t.includes('electricity') || t.includes('power') ||
      t.includes('ditch') || t.includes('pothole') || t.includes('drain') || t.includes('drainage') ||
      t.includes('street') || t.includes('highway') || t.includes('transport') || t.includes('transformer')) {
    return { domain: 'Infrastructure', suggestedExpertise: 'Civil Engineering, Structural Diagnostics, Renewable Energy' };
  }

  if (t.includes('solar') || t.includes('energy') || t.includes('cold storage') ||
      t.includes('forest') || t.includes('mahua') || t.includes('renewable') ||
      t.includes('microgrid') || t.includes('biomass') || t.includes('wind') || t.includes('battery')) {
    return { domain: 'Renewable Energy', suggestedExpertise: 'Thermal Engineering, Solar Microgrids, Cold-Chain Logistics' };
  }

  // Default: Water & Sanitation
  return { domain: 'Water & Sanitation', suggestedExpertise: 'Environmental Engineering, Water Filtration, IoT TDS Quality Monitoring' };
}

/**
 * Extract the most relevant keywords from a citizen problem description.
 * Simple dictionary-based keyword matching — architecture is ready for NLP upgrades.
 *
 * @param {string} text - Raw citizen problem text
 * @returns {string[]} - Up to 8 matching keywords
 */
export function extractKeywords(text = '') {
  const t = text.toLowerCase();

  const knownKeywords = [
    'water', 'drinking', 'contamination', 'arsenic', 'borewell', 'tube-well', 'filtration', 'sanitation',
    'crop', 'farm', 'soil', 'irrigation', 'blight', 'potato', 'fungal', 'harvest', 'seed', 'fertilizer',
    'road', 'bridge', 'school', 'electricity', 'power', 'infrastructure', 'culvert',
    'solar', 'energy', 'cold storage', 'forest', 'mahua', 'tribal', 'renewable',
    'health', 'hospital', 'doctor', 'medicine', 'vaccine', 'fever',
    'village', 'rural', 'community', 'panchayat', 'district', 'block',
    'contaminated', 'polluted', 'unsafe', 'disease', 'spoiling', 'flooding',
  ];

  const found = knownKeywords.filter(kw => t.includes(kw));

  // Return up to 8 matching keywords
  if (found.length > 0) return found.slice(0, 8);

  // Fallback: pick the longest words from the text
  return text.split(/\s+/).filter(w => w.length > 4).slice(0, 5).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
}

/**
 * Calculate the priority score (0.0 to 10.0) based on severity and report volume.
 *
 * @param {string} severity - 'High', 'Medium', or 'Low'
 * @param {number} reportCount - Number of citizens reporting the same issue
 * @returns {{ priority: string, priorityScore: number }}
 */
export function calculatePriority(severity = 'High', reportCount = 1) {
  let baseScore = 5.0;
  if (severity === 'High') baseScore = 8.0;
  else if (severity === 'Medium') baseScore = 6.0;
  else if (severity === 'Low') baseScore = 4.0;

  // Each extra report adds 0.2 to the score, capped at +2.0
  const clusterBonus = Math.min(2.0, (reportCount - 1) * 0.2);
  const totalScore = Number((baseScore + clusterBonus).toFixed(1));

  let finalPriority = 'Low';
  if (totalScore >= 7.5) finalPriority = 'High';
  else if (totalScore >= 5.5) finalPriority = 'Medium';

  return { priority: finalPriority, priorityScore: Math.min(10.0, totalScore) };
}

/**
 * Full AI analysis pipeline for a citizen problem report.
 *
 * @param {string} problemText - Citizen description
 * @param {string} severity - 'High', 'Medium', or 'Low'
 * @param {string} userCategory - Optional domain category chosen by citizen
 * @returns {object} - Classification + priority result
 */
export function analyzeProblem(problemText, severity = 'High', userCategory = '') {
  const { domain, suggestedExpertise } = classifyDomain(problemText, userCategory);
  const { priority, priorityScore } = calculatePriority(severity, 1);
  return { domain, suggestedExpertise, priority, priorityScore, analyzedAt: new Date().toISOString() };
}

/**
 * Generate a smart, readable challenge title based on the user's problem description.
 *
 * @param {string} problemText - Raw problem description
 * @param {string} domain - Domain name
 * @returns {string} - Concise title
 */
export function generateChallengeTitle(problemText = '', domain = 'Water & Sanitation') {
  const clean = problemText.trim().replace(/\s+/g, ' ');
  if (!clean) return `${domain} Issue`;

  // If the citizen entered a short text (e.g. "water shortage", "broken canal"), use it directly
  if (clean.length <= 45 && !clean.includes('.')) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Extract first clean clause/sentence
  const firstSentence = clean.split(/[.\n!?]/)[0].trim();
  if (firstSentence.length > 5 && firstSentence.length <= 55) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }

  // Fallback: Use extracted keywords
  const keywords = extractKeywords(clean);
  if (keywords.length >= 2) {
    const keyPhrase = keywords.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' ');
    return `${keyPhrase} Problem`;
  }

  return `${clean.slice(0, 40)}...`;
}

/**
 * Find similar / duplicate challenges to cluster reports into one Master Challenge.
 *
 * Checks:
 * 1. Same Domain (e.g. Water & Sanitation)
 * 2. Same Title match OR shared core keywords (e.g. "pipeline", "handpump", "arsenic", "bridge", "canal")
 * 3. Text overlap / similarity threshold >= 0.3
 *
 * @param {string} domain - Domain name
 * @param {Array} coordinates - [lng, lat]
 * @param {string} problemText - Citizen problem description
 * @param {string} district - District name
 * @param {Array} existingChallenges - List of current challenges
 * @param {string} title - Optional problem title
 * @returns {object|null} - Matching existing challenge or null
 */
export function findSimilarChallenges(domain, coordinates, problemText = '', district = '', existingChallenges = [], title = '') {
  if (!existingChallenges || existingChallenges.length === 0) return null;

  const normalize = (str = '') => 
    str.toLowerCase()
       .replace(/[^a-z0-9\s]/g, ' ')
       .split(/\s+/)
       .filter(w => w.length > 2 && !['issue', 'problem', 'the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(w));

  const currentWords = new Set([...normalize(problemText), ...normalize(title)]);
  const currentTitle = (title || '').trim().toLowerCase();

  for (const c of existingChallenges) {
    if (c.domain !== domain || c.status === 'Deployed' || c.status === 'Dismissed') {
      continue;
    }

    const existingTitle = (c.title || '').trim().toLowerCase();
    const existingWords = new Set([...normalize(c.description || ''), ...normalize(c.title || '')]);

    // Condition 1: Exact or near-exact title match (e.g., both named "pipeline")
    if (currentTitle && existingTitle && (currentTitle === existingTitle || currentTitle.includes(existingTitle) || existingTitle.includes(currentTitle))) {
      return c;
    }

    // Condition 2: Keyword overlap (e.g. both contain "pipeline", "water", "handpump", etc.)
    let commonCount = 0;
    for (const word of currentWords) {
      if (existingWords.has(word)) {
        commonCount++;
      }
    }

    const totalUnique = new Set([...currentWords, ...existingWords]).size;
    const similarityRatio = totalUnique > 0 ? commonCount / totalUnique : 0;

    // If they share at least 1 strong subject word or >= 25% word similarity
    if (commonCount >= 1 && (similarityRatio >= 0.2 || currentWords.size <= 2)) {
      return c;
    }
  }

  return null;
}


