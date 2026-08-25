/**
 * Automated Verification Test Suite for AgriAI – Waste2Fuel Backend REST APIs
 * SIH 2026 — Problem Statement SIH26203 | Renewable / Sustainable Energy
 *
 * Tests: 11 suites covering all API endpoints and new enhanced response structures.
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:3000/api';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting AgriAI API Test Suite...\n');
  let passed = 0, total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // 1. Health Check
  await test('GET /api/health returns healthy status', async () => {
    const res = await request('GET', '/health');
    if (res.status !== 200 || res.body.status !== 'healthy')
      throw new Error(`Expected 200 + healthy, got ${res.status}`);
  });

  // 2. Waste Types
  await test('GET /api/waste-types returns all 8 residues', async () => {
    const res = await request('GET', '/waste-types');
    if (res.status !== 200 || res.body.count !== 8)
      throw new Error(`Expected 8 waste types, got ${res.body.count}`);
  });

  // 3. AI Classifier
  await test('POST /api/analyze identifies Rice straw with confidence score', async () => {
    const res = await request('POST', '/analyze', { filename: 'paddy_straw_field.jpg', sampleHint: 'rice straw' });
    if (res.status !== 200 || !res.body.identifiedWaste || res.body.identifiedWaste.id !== 'rice-straw')
      throw new Error(`Expected rice-straw detection, got ${JSON.stringify(res.body)}`);
    if (!res.body.confidenceScore || res.body.confidenceScore < 80)
      throw new Error(`Confidence score missing or too low: ${res.body.confidenceScore}`);
  });

  // 4. Viability Engine — Viable case (uses new decision.status)
  await test('POST /api/calculate-viability returns GOOD decision for 1000kg dry straw', async () => {
    const res = await request('POST', '/calculate-viability', {
      wasteId: 'rice-straw',
      quantityKg: 1000,
      condition: 'Dry (<15%)',
      latitude: 16.3067,
      longitude: 80.4365,
      locationName: 'Guntur, Andhra Pradesh'
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = res.body;

    // Validate new structured response
    if (!body.decision || !body.decision.status)
      throw new Error('Missing decision object');
    if (body.decision.status !== 'GOOD')
      throw new Error(`Expected GOOD decision status, got "${body.decision.status}"`);
    if (!body.energyPotential || !body.energyPotential.totalEnergyMJ)
      throw new Error('Missing energyPotential.totalEnergyMJ');
    if (!body.economicBreakdown || body.economicBreakdown.estimatedNetFarmerValue === undefined)
      throw new Error('Missing economicBreakdown.estimatedNetFarmerValue');
    if (!body.environmentalImpact || !body.endUseAllocation)
      throw new Error('Missing environmentalImpact or endUseAllocation');
    if (!body.decision.rankedOptions || body.decision.rankedOptions.length < 3)
      throw new Error('Missing ranked options (expected 3)');
  });

  // 5. Viability Engine — Wet / Non-viable case
  await test('POST /api/calculate-viability returns NOT_ECONOMICAL for wet condition with on-farm alternatives', async () => {
    const res = await request('POST', '/calculate-viability', {
      wasteId: 'rice-straw',
      quantityKg: 500,
      condition: 'Wet (>30%)',
      latitude: 16.3067,
      longitude: 80.4365
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = res.body;

    if (!body.decision || !body.decision.status)
      throw new Error('Missing decision object for wet case');
    if (body.decision.status !== 'NOT_ECONOMICAL')
      throw new Error(`Expected NOT_ECONOMICAL for wet condition, got "${body.decision.status}"`);
    if (!body.onFarmAlternatives || body.onFarmAlternatives.length === 0)
      throw new Error('Expected onFarmAlternatives list for non-viable case');
  });

  // 6. Facilities Search with distance calculation
  await test('GET /api/facilities returns matching facilities with distance calculation', async () => {
    const res = await request('GET', '/facilities?wasteId=rice-straw&lat=16.3067&lon=80.4365');
    if (res.status !== 200 || res.body.count === 0)
      throw new Error(`Expected facilities, got count ${res.body.count}`);
    if (typeof res.body.data[0].distanceKm !== 'number')
      throw new Error('Distance in km not calculated');
  });

  // 7. On-Farm Alternatives (at least 5 validated methods)
  await test('GET /api/alternatives returns all validated farm-level methods', async () => {
    const res = await request('GET', '/alternatives');
    if (res.status !== 200 || res.body.count < 5)
      throw new Error(`Expected at least 5 alternatives, got ${res.body.count}`);
  });

  // 8. Video Library
  await test('GET /api/videos returns ICAR/KVK verified educational videos', async () => {
    const res = await request('GET', '/videos');
    if (res.status !== 200 || res.body.count < 4)
      throw new Error(`Expected at least 4 verified videos, got ${res.body.count}`);
    const v = res.body.data[0];
    if (!v.source || !v.organization || !v.title_te || !v.title_hi)
      throw new Error('Video missing required multilingual fields (title_te, title_hi, organization)');
  });

  // 9. Collections / Community Pooling
  await test('GET/POST /api/collections handles multi-farmer community pooling', async () => {
    const getRes = await request('GET', '/collections');
    if (getRes.status !== 200 || getRes.body.count === 0)
      throw new Error('Expected existing collections');
    const postRes = await request('POST', '/collections', {
      name: 'Test Guntur Aggregation Cluster',
      district: 'Guntur',
      farmIds: ['farm-01', 'farm-02']
    });
    if (postRes.status !== 201 || !postRes.body.data.totalBiomassKg)
      throw new Error('Failed to create new aggregation cluster');
  });

  // 10. Dashboard Analytics
  await test('GET /api/dashboard returns complete metrics & chart data', async () => {
    const res = await request('GET', '/dashboard');
    if (res.status !== 200 || !res.body.summary || !res.body.charts)
      throw new Error('Dashboard missing summary or charts object');
    if (!res.body.charts.biomassByCrop || !res.body.charts.biomassByDistrict)
      throw new Error('Dashboard missing required chart datasets');
  });

  // 11. Multilingual Conversational AI (English, Telugu, Hindi)
  await test('POST /api/chat processes queries in English, Telugu, and Hindi', async () => {
    const enRes = await request('POST', '/chat', { message: 'What if my crop waste is wet?', language: 'en' });
    if (enRes.status !== 200 || !enRes.body.reply)
      throw new Error('English chat failed');

    const teRes = await request('POST', '/chat', { message: 'వరి గడ్డిని ఇథనాల్‌గా ఎలా మారుస్తారు?', language: 'te' });
    if (teRes.status !== 200 || !teRes.body.reply || teRes.body.language !== 'te')
      throw new Error('Telugu chat failed');

    const hiRes = await request('POST', '/chat', { message: 'गुंटूर डेमो चलाएं', language: 'hi' });
    if (hiRes.status !== 200 || !hiRes.body.reply || !hiRes.body.actionTrigger)
      throw new Error('Hindi chat with action trigger failed');
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} / ${total} passed`);
  console.log(`========================================\n`);

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
