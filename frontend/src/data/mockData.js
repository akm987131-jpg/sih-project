// SamadhanSetu Master Data State (Completely Blank / Clean Slate)

export const platformStats = {
  reportsReceived: "0",
  challengesIdentified: "0",
  projectsInProgress: "0",
  solutionsDeployed: "0",
  peopleBenefited: "0",
  statesCovered: "0"
};

export const journeySteps = [
  { step: 1, title: "People", subtitle: "Report Problems", color: "#2563EB", desc: "Citizens voice hyper-local issues via text, photo, GPS, or voice note." },
  { step: 2, title: "AI", subtitle: "Understands & Groups", color: "#16A34A", desc: "AI verifies authenticity, groups duplicates, and scores severity." },
  { step: 3, title: "University", subtitle: "Solves", color: "#0D9488", desc: "Faculty & students engineer prototypes and earn NEP 2020 credits." },
  { step: 4, title: "Industry", subtitle: "Supports", color: "#EA580C", desc: "AgTech and corporate CSR leaders sponsor micro-grants and mentorship." },
  { step: 5, title: "Government", subtitle: "Enables", color: "#1E3A8A", desc: "District administration sanctions trial permits and field access." },
  { step: 6, title: "Impact", subtitle: "A Better Tomorrow", color: "#DC2626", desc: "Verifiable deployment, IoT telemetry, and closed-loop citizen SMS." }
];

// Fully blank datasets
export const sampleChallenges = [];

export const universityData = {
  institution: "State University Innovation Cell",
  facultyLead: "Department of Engineering & Applied Sciences",
  recommendedChallenges: [],
  ongoingProjects: []
};

export const industryData = {
  corporateName: "CSR Foundation & Industry Alliance",
  csrBudget: "₹0",
  availableOpportunities: [],
  sponsoredProjects: []
};

export const industryOpportunities = [];

export const governmentStats = {
  reportsReceived: "0",
  verified: "0",
  projects: "0",
  deployed: "0",
  districtHotspots: [],
  recentChallenges: []
};

export const currentWorkspace = {
  _id: "empty_workspace",
  title: "No Active Project Workspace",
  status: "Pending Initiation",
  currentPhase: "Not Started",
  progressPercentage: 0,
  location: "Jharkhand",
  team: {
    university: "Awaiting University Match",
    industry: "Awaiting Industry CSR Partner",
    government: "Awaiting Nodal Department",
    community: "Awaiting Citizen Confirmation"
  },
  phases: [
    { name: "Research", status: "pending" },
    { name: "Prototype", status: "pending" },
    { name: "Pilot", status: "pending" },
    { name: "Deployment", status: "pending" }
  ],
  tasks: [],
  hardwareBom: []
};

export const impactStories = [];
export const successStories = [];
