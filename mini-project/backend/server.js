
const dns = require('dns');

// Use public DNS servers for MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDb } = require('./config/db');
const { users, isAtlasConnected } = require('./services/dbStore');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded static assets
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: isAtlasConnected()
      ? 'MongoDB Atlas (Connected)'
      : 'Active (Local Data Layer)',
    service: 'Legal Metrology Verification System (LMVS) Backend',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/stats', statsRoutes);

// Seed initial demo data if empty
async function seedInitialData() {
  try {
    if (isAtlasConnected()) {
      const officerCount = await User.countDocuments({
        role: 'Officer',
      });

      if (officerCount === 0) {
        console.log('🌱 Seeding default Legal Metrology Officer...');

        const defaultOfficer = new User({
          name: 'Legal Metrology Officer',
          email: 'officer@lmvs.gov',
          officerId: '113iom20',
          phone: '011-2338-0000',
          shopName: 'Legal Metrology Enforcement Division',
          shopAddress: 'District Administrative Complex, Room 104',
          password: 'Officer@123',
          role: 'Officer',
        });

        await defaultOfficer.save();

        console.log('✅ Default Officer seeded into MongoDB Atlas');
      }

      const ownerCount = await User.countDocuments({
        role: 'Owner',
      });

      if (ownerCount === 0) {
        console.log('🌱 Seeding demo Machine Holder...');

        const defaultOwner = new User({
          name: 'Rajesh Sharma',
          email: 'owner@lmvs.shop',
          phone: '9876543210',
          aadhaarNo: '5432 1098 7654',
          shopName: 'Sharma General Provisions & Grain Mart',
          shopAddress: 'Shop #14, Main Mandi Complex, Sector 2',
          password: 'Owner@123',
          role: 'Owner',
        });

        await defaultOwner.save();

        console.log('✅ Demo Machine Holder seeded into MongoDB Atlas');
      }
    }
  } catch (err) {
    console.warn('Seeding notice:', err.message);
  }
}

// Serve Frontend Static Files
const frontendDir = path.join(__dirname, '..');

app.use(express.static(frontendDir));

// Fallback route for index
app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err);

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred',
  });
});

// Start Server
async function startServer() {
  try {
    await connectDb();
    await seedInitialData();

    const server = app.listen(PORT, () => {
      console.log('=======================================================');
      console.log(`🚀 LMVS Backend running at http://localhost:${PORT}`);
      console.log(`🌐 Frontend serving from: ${frontendDir}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/api/health`);
      console.log('=======================================================');
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start LMVS Server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
