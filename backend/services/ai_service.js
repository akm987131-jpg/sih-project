/**
 * AI Service for SamadhanSetu (समाधानसेतु)
 * Responsibility: Problem domain classification, priority scoring, and cluster deduplication.
 * Designed to be clear, simple, and readable for junior developers.
 */

/**
 * Classify a problem description into one of the 4 core domains.
 * Also determines the recommended engineering expertise needed.
 * 
 * @param {string} text - The raw problem description from the citizen
 * @returns {object} - { domain, suggestedExpertise }
 */
export function classifyDomain(text = '') {
  const lowerText = text.toLowerCase();

  // Keyword-based NLP heuristics for SIH 2026 Theme: Agriculture & Rural Development
  if (
    lowerText.includes('crop') ||
    lowerText.includes('farm') ||
    lowerText.includes('canal') ||
    lowerText.includes('soil') ||
    lowerText.includes('seed') ||
    lowerText.includes('irrigation') ||
    lowerText.includes('grain')
  ) {
    return {
      domain: 'Agriculture',
      suggestedExpertise: 'Agricultural Engineering, Irrigation Systems, IoT Moisture Control',
    };
  }

  if (
    lowerText.includes('health') ||
    lowerText.includes('doctor') ||
    lowerText.includes('medicine') ||
    lowerText.includes('clinic') ||
    lowerText.includes('vaccine') ||
    lowerText.includes('hospital') ||
    lowerText.includes('fever')
  ) {
    return {
      domain: 'Healthcare',
      suggestedExpertise: 'Biomedical Engineering, Public Health, Solar Cold-Chain',
    };
  }

  if (
    lowerText.includes('road') ||
    lowerText.includes('bridge') ||
    lowerText.includes('school') ||
    lowerText.includes('building') ||
    lowerText.includes('culvert') ||
    lowerText.includes('electricity') ||
    lowerText.includes('power')
  ) {
    return {
      domain: 'Infrastructure',
      suggestedExpertise: 'Civil Engineering, Structural Diagnostics, Renewable Energy',
    };
  }

  // Default domain for water contamination & sanitation
  return {
    domain: 'Water & Sanitation',
    suggestedExpertise: 'Environmental Engineering, Water Filtration, IoT TDS Quality Monitoring',
  };
}

/**
 * Calculate the priority score (0.0 to 10.0) based on severity and cluster volume.
 * 
 * @param {string} severity - 'High', 'Medium', or 'Low'
 * @param {number} reportCount - Number of citizens reporting the same issue
 * @returns {object} - { priority, priorityScore }
 */
export function calculatePriority(severity = 'High', reportCount = 1) {
  let baseScore = 5.0;

  if (severity === 'High') {
    baseScore = 8.0;
  } else if (severity === 'Medium') {
    baseScore = 6.0;
  } else if (severity === 'Low') {
    baseScore = 4.0;
  }

  // Each additional citizen report increases priority by 0.2 up to max 10.0
  const clusterBonus = Math.min(2.0, (reportCount - 1) * 0.2);
  const totalScore = Number((baseScore + clusterBonus).toFixed(1));

  let finalPriority = 'Low';
  if (totalScore >= 7.5) {
    finalPriority = 'High';
  } else if (totalScore >= 5.5) {
    finalPriority = 'Medium';
  }

  return {
    priority: finalPriority,
    priorityScore: Math.min(10.0, totalScore),
  };
}

/**
 * Complete AI analysis pipeline for a citizen problem report.
 * 
 * @param {string} problemText - Citizen problem description
 * @param {string} severity - Perceived severity ('High', 'Medium', 'Low')
 * @returns {object} - Full analysis result
 */
export function analyzeProblem(problemText, severity = 'High') {
  const { domain, suggestedExpertise } = classifyDomain(problemText);
  const { priority, priorityScore } = calculatePriority(severity, 1);

  return {
    domain,
    suggestedExpertise,
    priority,
    priorityScore,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Find if this report matches an existing challenge cluster.
 * 
 * @param {string} domain - The classified domain
 * @param {Array<number>} coordinates - [longitude, latitude]
 * @param {Array<object>} existingChallenges - List of active challenges
 * @returns {object|null} - Matching challenge or null
 */
export function findSimilarChallenges(domain, coordinates, existingChallenges = []) {
  // Find challenges in the same domain that are not yet fully deployed
  const candidates = existingChallenges.filter(
    (c) => c.domain === domain && c.status !== 'Deployed'
  );

  if (candidates.length === 0) {
    return null;
  }

  // Return the best match (first active cluster in that domain)
  return candidates[0];
}
