/**
 * AgriAI – Waste2Fuel Server Entrypoint (SIH 2026 Prototype)
 * Problem Statement: SIH26203 – Student Innovation | Theme: Renewable / Sustainable Energy
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRouter = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');

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
    aiVisionEnabled: Boolean(process.env.OPENAI_API_KEY),
    uptimeSeconds: process.uptime()
  });
});

// Serve static assets but keep index.html under the SPA route below so we can
// inject the optional vision bridge without changing the source HTML manually.
app.use(express.static(PUBLIC_DIR, { index: false }));

// SPA fallback for client routing with the vision bridge loaded after app.js.
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found.' });
  }

  try {
    let html = fs.readFileSync(INDEX_FILE, 'utf8');
    const bridgeTag = '<script src="js/vision-bridge.js"></script>';
    if (!html.includes(bridgeTag)) {
      html = html.replace('</body>', `  ${bridgeTag}\n</body>`);
    }
    res.type('html').send(html);
  } catch (error) {
    console.error('Frontend render error:', error);
    res.status(500).send('AgriAI frontend could not be loaded.');
  }
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
  console.log(`  Vision AI: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'fallback mode'}`);
  console.log('===============================================================');
});
