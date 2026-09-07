import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Challenge from './models/Challenge.js';
import Workspace from './models/Workspace.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/samadhansetu';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clean existing records
    await User.deleteMany();
    await Challenge.deleteMany();
    await Workspace.deleteMany();

    // 1. Seed Users (All 4 Roles)
    const users = await User.insertMany([
      {
        fullName: 'Ramesh Mahto (Farmer)',
        mobileNumber: '9876543210',
        email: 'ramesh.farmer@samadhansetu.gov.in',
        password: 'password123',
        role: 'Citizen',
        state: 'Jharkhand',
        organization: 'Kanke Gram Panchayat',
      },
      {
        fullName: 'Prof. Dr. Sunita Sharma',
        mobileNumber: '9876543211',
        email: 'sunita.sharma@nitjsr.ac.in',
        password: 'password123',
        role: 'University',
        state: 'Jharkhand',
        organization: 'NIT Jamshedpur',
        skills: ['Water Engineering', 'Environmental Science', 'IoT Sensing'],
      },
      {
        fullName: 'Vikas Agarwal (CSR Head)',
        mobileNumber: '9876543212',
        email: 'vikas.agarwal@tataprojects.com',
        password: 'password123',
        role: 'Industry',
        state: 'Jharkhand',
        organization: 'Tata Projects Ltd',
      },
      {
        fullName: 'Amit Tirkey (District Collector)',
        mobileNumber: '9876543213',
        email: 'dc.ranchi@jharkhand.gov.in',
        password: 'password123',
        role: 'Government',
        state: 'Jharkhand',
        organization: 'District Administration Ranchi',
      },
    ]);
    console.log(`✓ Seeded ${users.length} Users across all 4 roles`);

    // 2. Seed Challenges
    const challenges = await Challenge.insertMany([
      {
        title: 'Unsafe Drinking Water',
        description: 'Severe arsenic and iron contamination in community hand pumps across Ranchi tolas.',
        domain: 'Water & Sanitation',
        priority: 'High',
        priorityScore: 8.6,
        status: 'Identified',
        district: 'Ranchi',
        block: 'Kanke',
        state: 'Jharkhand',
        location: {
          type: 'Point',
          coordinates: [85.3240, 23.3441],
        },
        reportCount: 23,
        suggestedExpertise: 'Environmental Engineering, Water Filtration, IoT Quality Monitoring',
        assignedDepartment: 'Drinking Water & Sanitation Dept (DWSD)',
      },
      {
        title: 'Rural Healthcare Access',
        description: 'Tribal hamlets lack cold-chain vaccine refrigeration and emergency tele-diagnostic connectivity during monsoon cutoffs.',
        domain: 'Healthcare',
        priority: 'Medium',
        priorityScore: 6.2,
        status: 'Identified',
        district: 'Bokaro',
        block: 'Petarwar',
        state: 'Jharkhand',
        location: {
          type: 'Point',
          coordinates: [86.1511, 23.6693],
        },
        reportCount: 17,
        suggestedExpertise: 'Biomedical Engineering, Solar Refrigeration, Telemedicine',
      },
      {
        title: 'Crop Storage Facilities',
        description: 'Post-harvest vegetable spoilage exceeds 30% due to absence of affordable micro-cold rooms for smallholder tomato farmers.',
        domain: 'Agriculture',
        priority: 'Low',
        priorityScore: 4.8,
        status: 'Identified',
        district: 'Dhanbad',
        block: 'Govindpur',
        state: 'Jharkhand',
        location: {
          type: 'Point',
          coordinates: [86.4304, 23.7957],
        },
        reportCount: 12,
        suggestedExpertise: 'Agricultural Engineering, Thermal Storage, IoT Moisture Control',
      },
      {
        title: 'Canal Silt Blockage & Seepage',
        description: 'Earthen canal banks collapsed after early rains, choking irrigation supply to 420 hectares of paddy fields.',
        domain: 'Agriculture',
        priority: 'High',
        priorityScore: 8.4,
        status: 'In Progress',
        district: 'Khunti',
        block: 'Karra',
        state: 'Jharkhand',
        location: {
          type: 'Point',
          coordinates: [85.2789, 23.0740],
        },
        reportCount: 19,
        suggestedExpertise: 'Civil Engineering, Soil Mechanics, Automated Sluice Gate Design',
      },
    ]);
    console.log(`✓ Seeded ${challenges.length} Master Challenges`);

    // 3. Seed Workspace
    const workspace = await Workspace.create({
      title: 'Clean Water Project — Village X',
      challengeId: challenges[0]._id,
      status: 'In Progress',
      currentPhase: 'Prototype',
      progressPercentage: 60,
      location: 'Jharkhand (Kanke Block)',
      team: {
        university: 'NIT Jamshedpur',
        industry: 'Tata Projects',
        government: 'Jharkhand Govt (DWSD)',
        community: 'Community Village X',
      },
      tasks: [
        { id: 1, title: 'Survey completed', date: '12 Aug 2026', done: true },
        { id: 2, title: 'Water testing (Arsenic & TDS)', date: '18 Aug 2026', done: true },
        { id: 3, title: 'Prototype development (Activated Alumina)', date: 'In Progress', done: false },
        { id: 4, title: 'Field pilot trial sanction', date: 'Pending', done: false },
        { id: 5, title: 'Community Handover & Deployment', date: 'Pending', done: false },
      ],
      hardwareBom: [
        { item: 'Activated Alumina Filter Cartridge', quantity: 2, cost: 4500 },
        { item: 'Solar DC Water Pump 0.5 HP', quantity: 1, cost: 18000 },
      ],
    });
    console.log(`✓ Seeded Project Workspace: "${workspace.title}"`);

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
