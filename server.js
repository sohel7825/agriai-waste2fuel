/**
 * AgriAI – Waste2Fuel Server Entrypoint (SIH 2026 Prototype)
 * Problem Statement: SIH26203 – Student Innovation | Theme: Renewable / Sustainable Energy
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for prototype visibility
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'AgriAI – Waste2Fuel',
    version: '1.0.0 (SIH 2026 Ready)',
    tagline: 'Agricultural Waste Is Not Waste — It Is a Resource for Future Fuel.',
    uptimeSeconds: process.uptime()
  });
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback for client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('===============================================================');
  console.log('  AgriAI – Waste2Fuel Prototype Server Active');
  console.log('  SIH 2026 Problem Statement: SIH26203 (Student Innovation)');
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`  Network URL: http://<YOUR-IP>:${PORT}`);
  console.log('  Demo Focus: Andhra Pradesh (Guntur Agro Basin)');
  console.log('===============================================================');
});
