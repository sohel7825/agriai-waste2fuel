/**
 * REST API Routes for AgriAI – Waste2Fuel (SIH 2026 Prototype)
 */

const express = require('express');
const router = express.Router();

const wasteTypesData = require('../data/wasteTypes.json');
const facilitiesData = require('../data/facilities.json');
const alternativesData = require('../data/alternatives.json');
const videosData = require('../data/videos.json');
let farmsData = [...require('../data/farms.json')];
let collectionsData = [...require('../data/collections.json')];

const { classifyBiomassImage } = require('../services/aiClassifier');
const { evaluateBiomassViability, findMatchingFacilities } = require('../services/viabilityEngine');
const { createBiomassCluster } = require('../services/aggregationEngine');
const { getAdvisorReply, isAIConfigured } = require('../services/aiAdvisor');

const VALID_LANGUAGES = new Set(['en', 'te', 'hi']);

function isFiniteNumber(value) {
  return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function validCoordinate(value, min, max) {
  return isFiniteNumber(value) && Number(value) >= min && Number(value) <= max;
}

router.get('/waste-types', (req, res) => {
  res.json({ success: true, count: wasteTypesData.length, data: wasteTypesData });
});

router.post('/analyze', (req, res) => {
  try {
    const { filename, mimeType, sampleHint } = req.body || {};
    if (mimeType && !String(mimeType).startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only image files are supported.' });
    }
    if (!filename && !sampleHint) {
      return res.status(400).json({ success: false, message: 'Provide an image filename or sample hint.' });
    }
    return res.json(classifyBiomassImage({ filename, mimeType, sampleHint }));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI Classification Error: ' + error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body || {};
    if (!String(message || '').trim()) {
      return res.status(400).json({ success: false, message: 'Query message is required.' });
    }
    const safeLanguage = VALID_LANGUAGES.has(language) ? language : 'en';
    const result = await getAdvisorReply(String(message).trim(), safeLanguage);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'AI Chat Error: ' + error.message });
  }
});

router.get('/ai-status', (req, res) => {
  res.json({ success: true, provider: isAIConfigured() ? 'openai' : 'local' });
});

router.get('/facilities', (req, res) => {
  try {
    const { wasteId, lat, lon, district } = req.query;
    const userLat = lat === undefined ? 16.3067 : Number(lat);
    const userLon = lon === undefined ? 80.4365 : Number(lon);

    if (!validCoordinate(userLat, -90, 90) || !validCoordinate(userLon, -180, 180)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude or longitude.' });
    }

    if (wasteId && !wasteTypesData.some(w => w.id === wasteId)) {
      return res.status(400).json({ success: false, message: 'Unknown waste type.' });
    }

    let results = findMatchingFacilities(wasteId || 'rice-straw', userLat, userLon);
    if (district) {
      results = results.filter(f => f.district.toLowerCase().includes(String(district).toLowerCase()));
    }

    return res.json({
      success: true,
      count: results.length,
      userLocation: { latitude: userLat, longitude: userLon },
      data: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Facility search error: ' + error.message });
  }
});

router.post('/calculate-viability', (req, res) => {
  try {
    const { wasteId, quantityKg, condition, harvestDate, latitude, longitude, locationName } = req.body || {};

    if (!wasteId || !wasteTypesData.some(w => w.id === wasteId)) {
      return res.status(400).json({ success: false, message: 'A valid wasteId is required.' });
    }
    if (!isFiniteNumber(quantityKg) || Number(quantityKg) <= 0 || Number(quantityKg) > 10000000) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number up to 10,000,000 kg.' });
    }
    if (!condition) {
      return res.status(400).json({ success: false, message: 'Moisture condition is required.' });
    }
    if (latitude !== undefined && !validCoordinate(latitude, -90, 90)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude.' });
    }
    if (longitude !== undefined && !validCoordinate(longitude, -180, 180)) {
      return res.status(400).json({ success: false, message: 'Invalid longitude.' });
    }

    const evaluation = evaluateBiomassViability({
      wasteId,
      quantityKg: Number(quantityKg),
      condition,
      harvestDate,
      latitude,
      longitude,
      locationName
    });

    return res.json(evaluation);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Viability calculation error: ' + error.message });
  }
});

router.get('/alternatives', (req, res) => {
  const { wasteId } = req.query;
  if (wasteId && !wasteTypesData.some(w => w.id === wasteId)) {
    return res.status(400).json({ success: false, message: 'Unknown waste type.' });
  }
  const results = wasteId ? alternativesData.filter(alt => alt.suitableResidues.includes(wasteId)) : alternativesData;
  return res.json({ success: true, count: results.length, data: results });
});

router.get('/videos', (req, res) => {
  const { wasteType, alternative, lang } = req.query;
  if (wasteType && !wasteTypesData.some(w => w.id === wasteType)) {
    return res.status(400).json({ success: false, message: 'Unknown waste type.' });
  }
  if (lang && !VALID_LANGUAGES.has(lang)) {
    return res.status(400).json({ success: false, message: 'Language must be en, te, or hi.' });
  }

  let results = [...videosData];
  if (wasteType) results = results.filter(v => v.wasteType === wasteType);
  if (alternative) results = results.filter(v => v.alternative === alternative);
  if (lang) results = results.filter(v => v.language === lang);

  return res.json({ success: true, count: results.length, data: results });
});

router.get('/farms', (req, res) => {
  const { district, wasteType, availableOnly } = req.query;
  if (wasteType && !wasteTypesData.some(w => w.id === wasteType)) {
    return res.status(400).json({ success: false, message: 'Unknown waste type.' });
  }

  let results = [...farmsData];
  if (district) results = results.filter(f => f.district.toLowerCase().includes(String(district).toLowerCase()));
  if (wasteType) results = results.filter(f => f.wasteType === wasteType);
  if (availableOnly === 'true') results = results.filter(f => f.availableForCollection);

  return res.json({ success: true, count: results.length, data: results });
});

router.post('/farms', (req, res) => {
  try {
    const { farmerName, phone, location, district, latitude, longitude, wasteType, quantity, harvestDate, condition, notes } = req.body || {};

    if (!String(farmerName || '').trim() || !wasteType || !isFiniteNumber(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: 'Farmer name, valid waste type, and positive quantity are required.' });
    }
    if (!wasteTypesData.some(w => w.id === wasteType)) {
      return res.status(400).json({ success: false, message: 'Unknown waste type.' });
    }
    if (latitude !== undefined && !validCoordinate(latitude, -90, 90)) {
      return res.status(400).json({ success: false, message: 'Invalid latitude.' });
    }
    if (longitude !== undefined && !validCoordinate(longitude, -180, 180)) {
      return res.status(400).json({ success: false, message: 'Invalid longitude.' });
    }

    const wasteInfo = wasteTypesData.find(w => w.id === wasteType);
    const newFarm = {
      id: `farm-${Date.now()}`,
      farmerName: String(farmerName).trim(),
      phone: phone || '+91 98480 ' + Math.floor(10000 + Math.random() * 90000),
      location: location || 'Guntur District, Andhra Pradesh',
      district: district || 'Guntur',
      latitude: latitude === undefined ? 16.3067 : Number(latitude),
      longitude: longitude === undefined ? 80.4365 : Number(longitude),
      wasteType,
      wasteTypeName: wasteInfo.name,
      quantity: Math.round(Number(quantity)),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      condition: condition || 'Dry (<15%)',
      availableForCollection: true,
      status: 'Available',
      notes: notes || 'Registered via AgriAI Web Portal'
    };

    farmsData.unshift(newFarm);
    return res.status(201).json({ success: true, message: 'Farm biomass lot registered successfully!', data: newFarm });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Farm registration error: ' + error.message });
  }
});

router.get('/collections', (req, res) => {
  res.json({ success: true, count: collectionsData.length, data: collectionsData });
});

router.post('/collections', (req, res) => {
  try {
    const { name, district, farmIds, pickupDate } = req.body || {};
    if (farmIds !== undefined && (!Array.isArray(farmIds) || farmIds.length === 0)) {
      return res.status(400).json({ success: false, message: 'farmIds must be a non-empty list when supplied.' });
    }
    if (farmIds && !farmIds.every(id => farmsData.some(farm => farm.id === id))) {
      return res.status(400).json({ success: false, message: 'One or more selected farm lots were not found.' });
    }

    const newCluster = createBiomassCluster({ name, district, farmIds, pickupDate, farms: farmsData });
    collectionsData.unshift(newCluster);

    if (farmIds?.length) {
      farmsData.forEach(f => {
        if (farmIds.includes(f.id)) f.status = 'Pooled in Cluster';
      });
    }

    return res.status(201).json({ success: true, message: 'Community biomass aggregation cluster created successfully!', data: newCluster });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Cluster creation error: ' + error.message });
  }
});

router.get('/dashboard', (req, res) => {
  try {
    const totalFarms = farmsData.length;
    const totalBiomassKg = farmsData.reduce((sum, f) => sum + (Number(f.quantity) || 0), 0);
    const totalCollections = collectionsData.length;
    const totalFacilities = facilitiesData.length;

    const byCropMap = {};
    farmsData.forEach(f => {
      const name = f.wasteTypeName || f.wasteType;
      byCropMap[name] = (byCropMap[name] || 0) + (Number(f.quantity) || 0);
    });
    const biomassByCrop = Object.entries(byCropMap).map(([crop, kg]) => ({ crop, kg }));

    const byDistrictMap = {};
    farmsData.forEach(f => {
      const dist = f.district || 'Guntur';
      byDistrictMap[dist] = (byDistrictMap[dist] || 0) + (Number(f.quantity) || 0);
    });
    const biomassByDistrict = Object.entries(byDistrictMap).map(([district, kg]) => ({ district, kg }));

    const totalEnergyMJ = Math.round(totalBiomassKg * 15.5);
    const totalElectricityKwh = Math.round(totalBiomassKg * 4.3 * 0.32);
    const totalEthanolLiters = Math.round((totalBiomassKg / 1000) * 220);
    const totalCbgM3 = Math.round(totalBiomassKg * 0.28);
    const totalEstimatedValueInr = Math.round(totalBiomassKg * 2.45);
    const totalCo2AvoidedTonnes = +((totalBiomassKg * 1.52) / 1000).toFixed(2);
    const totalCrudeOilSavedLiters = Math.round((totalBiomassKg / 1000) * 165);

    const pathwaysDistribution = [
      { pathway: '2G Bio-Ethanol (🚗 Transport)', percentage: 38 },
      { pathway: 'CBG / Bio-CNG (🚛 Heavy Transport)', percentage: 26 },
      { pathway: 'Solid Briquettes & Pellets (⚡ Power)', percentage: 22 },
      { pathway: 'On-Farm Biochar & Compost (🌱 Carbon)', percentage: 14 }
    ];

    return res.json({
      success: true,
      summary: {
        totalRegisteredFarmers: totalFarms,
        totalBiomassRegisteredKg: totalBiomassKg,
        totalBiomassRegisteredTonnes: +(totalBiomassKg / 1000).toFixed(2),
        totalPotentialEnergyMJ: totalEnergyMJ,
        totalElectricityPotentialKwh: totalElectricityKwh,
        totalEthanolPotentialLiters: totalEthanolLiters,
        totalCbgPotentialM3: totalCbgM3,
        totalEstimatedValueInr,
        totalCo2AvoidedTonnes,
        totalCrudeOilSavedLiters,
        activeFacilitiesCount: totalFacilities,
        activeCollectionClusters: totalCollections
      },
      charts: {
        biomassByCrop,
        biomassByDistrict,
        pathwaysDistribution,
        monthlyTrend: [
          { month: 'May', tonnes: 18.2 },
          { month: 'Jun', tonnes: 24.5 },
          { month: 'Jul', tonnes: 31.0 },
          { month: 'Aug', tonnes: +(totalBiomassKg / 1000 + 42).toFixed(1) }
        ]
      },
      recentFarms: farmsData.slice(0, 5),
      activeClusters: collectionsData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Dashboard data error: ' + error.message });
  }
});

router.post('/reset-demo', (req, res) => {
  farmsData = [...require('../data/farms.json')];
  collectionsData = [...require('../data/collections.json')];
  res.json({ success: true, message: 'Demo dataset successfully reset to default Guntur, Andhra Pradesh baseline.' });
});

module.exports = router;
