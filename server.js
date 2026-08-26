/**
 * AgriAI – Waste2Fuel Server Entrypoint (SIH 2026 Prototype)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRouter = require('./src/routes/api');
const dataStore = require('./src/services/dataStore');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');

// Initialize the writable prototype data store at startup.
dataStore.read('farms');
dataStore.read('collections');

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', apiRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'AgriAI – Waste2Fuel',
    version: '1.1.0',
    tagline: 'Agricultural Waste Is Not Waste — It Is a Resource for Future Fuel.',
    aiVisionEnabled: Boolean(process.env.OPENAI_API_KEY),
    aiChatEnabled: Boolean(process.env.OPENAI_API_KEY),
    persistentStore: true,
    dataDirectory: dataStore.DATA_DIR,
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.use(express.static(PUBLIC_DIR, { index: false }));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ success: false, message: 'API route not found.' });
  try {
    let html = fs.readFileSync(INDEX_FILE, 'utf8');
    const bridgeTag = '<script src="js/vision-bridge.js"></script>';
    if (!html.includes(bridgeTag)) html = html.replace('</body>', `  ${bridgeTag}\n</body>`);
    res.type('html').send(html);
  } catch (error) {
    console.error('Frontend render error:', error);
    res.status(500).send('AgriAI frontend could not be loaded.');
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('===============================================================');
    console.log('  AgriAI – Waste2Fuel Server Active');
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Vision AI: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'fallback mode'}`);
    console.log(`  Persistent data: ${dataStore.DATA_DIR}`);
    console.log('===============================================================');
  });
}

module.exports = app;
