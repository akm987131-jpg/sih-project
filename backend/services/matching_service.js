/**
 * Matchmaking Service for SamadhanSetu (समाधानसेतु)
 * Responsibility: Quad-Helix matching between Master Challenges, Universities (Solvers), and Industry (CSR Sponsors).
 * Simple, beginner-readable implementation for SIH 2026.
 */

// Registered University Innovation Hubs in Jharkhand
const UNIVERSITY_CATALOG = [
  {
    institutionName: 'NIT Jamshedpur',
    department: 'Civil & Environmental Engineering',
    specialties: ['Water & Sanitation', 'Infrastructure'],
    academicCreditsAwarded: 4,
    leadFaculty: 'Dr. R. K. Sharma',
    studentInvolvementCap: 15,
  },
  {
    institutionName: 'Birsa Agricultural University (BAU Ranchi)',
    department: 'Faculty of Agricultural Engineering',
    specialties: ['Agriculture', 'FoodTech & Rural Development'],
    academicCreditsAwarded: 6,
    leadFaculty: 'Prof. S. Soren',
    studentInvolvementCap: 20,
  },
  {
    institutionName: 'BIT Mesra, Ranchi',
    department: 'Department of Bio-Engineering',
    specialties: ['Healthcare', 'Telemedicine'],
    academicCreditsAwarded: 4,
    leadFaculty: 'Dr. Ananya Roy',
    studentInvolvementCap: 12,
  },
  {
    institutionName: 'IIT (ISM) Dhanbad',
    department: 'Environmental Science & Engineering',
    specialties: ['Water & Sanitation', 'Infrastructure', 'Agriculture'],
    academicCreditsAwarded: 4,
    leadFaculty: 'Prof. V. K. Singh',
    studentInvolvementCap: 18,
  },
];

// Registered Corporate CSR & Industry Innovation Partners
const INDUSTRY_CATALOG = [
  {
    partnerName: 'Tata Projects Limited',
    csrDomain: 'Water & Sanitation',
    maxGrantPledge: '₹15,00,000',
    mentorshipAvailable: true,
    focusAreas: ['Clean Water', 'Rural Sanitation', 'Piped Water Supply'],
  },
  {
    partnerName: 'Tata Steel Foundation',
    csrDomain: 'Agriculture',
    maxGrantPledge: '₹20,00,000',
    mentorshipAvailable: true,
    focusAreas: ['Farmer Livelihoods', 'Irrigation Infrastructure', 'Soil Health'],
  },
  {
    partnerName: 'Jindal Steel & Power CSR',
    csrDomain: 'Healthcare',
    maxGrantPledge: '₹12,00,000',
    mentorshipAvailable: true,
    focusAreas: ['Rural Healthcare Clinics', 'Telemedicine', 'Nutrition'],
  },
  {
    partnerName: 'Adani Foundation Rural Infra',
    csrDomain: 'Infrastructure',
    maxGrantPledge: '₹25,00,000',
    mentorshipAvailable: true,
    focusAreas: ['Rural Bridges', 'Micro-Solar Grids', 'School Facilities'],
  },
];

/**
 * Match a challenge to the most suitable academic institution in Jharkhand.
 * 
 * @param {object} challenge - The challenge object containing domain and district
 * @returns {object} - Best matched university profile with confidence score
 */
export function findUniversityMatches(challenge) {
  const domain = challenge.domain || 'Water & Sanitation';

  const matched = UNIVERSITY_CATALOG.find((u) => u.specialties.includes(domain)) || UNIVERSITY_CATALOG[0];

  return {
    institutionName: matched.institutionName,
    department: matched.department,
    academicCredits: matched.academicCreditsAwarded,
    leadFaculty: matched.leadFaculty,
    matchConfidencePercent: 94,
    nep2020Track: 'B.Tech Capstone / Experiential Rural Internship',
  };
}

/**
 * Match a challenge to an industry corporate sponsor willing to fund prototypes.
 * 
 * @param {object} challenge - The challenge object
 * @returns {object} - Best matched corporate CSR partner
 */
export function findIndustryPartners(challenge) {
  const domain = challenge.domain || 'Water & Sanitation';

  const matched = INDUSTRY_CATALOG.find((i) => i.csrDomain === domain) || INDUSTRY_CATALOG[0];

  return {
    partnerName: matched.partnerName,
    csrDomain: matched.csrDomain,
    availableGrant: matched.maxGrantPledge,
    mentorshipOffered: matched.mentorshipAvailable,
    status: 'Ready to Sponsor',
  };
}
