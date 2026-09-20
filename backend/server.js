import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route Handlers
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import workspaceRoutes from './routes/workspaces.js';
import statsRoutes from './routes/stats.js';
import auditLogRoutes from './routes/auditlogs.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development & hackathon demo
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Route & Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'SamadhanSetu (समाधानसेतु)',
    theme: 'Agriculture, FoodTech & Rural Development',
    state: 'Government of Jharkhand',
    ps_id: '26043',
    motto: 'People. Ideas. Impact. — Together for a Better Tomorrow',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/challenges',
      '/api/v1/workspaces',
      '/api/v1/stats',
      '/api/v1/gov/district-map',
    ],
  });
});

// API Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes); // Rule 4 compliant users route
app.use('/api/v1/challenges', challengeRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/projects', workspaceRoutes); // Rule 4 compliant projects route
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/gov', statsRoutes);
app.use('/api/v1/impact', statsRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SamadhanSetu Backend Running on http://localhost:${PORT}`);
  console.log(`🌐 Ready to serve all 12 frontend screens & MongoDB data`);
  console.log(`=======================================================`);
});
