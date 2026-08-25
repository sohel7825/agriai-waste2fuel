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

/**
 * GET /api/waste-types
 * Retrieve all 8 supported agricultural residues with chemical, biological, and energy attributes
 */
router.get('/waste-types', (req, res) => {
  res.json({
    success: true,
    count: wasteTypesData.length,
    data: wasteTypesData
  });
});

/**
 * POST /api/analyze
 * AI Computer Vision Residue Identification
 * Accepts image metadata, base64 payload, or sample hints
 */
router.post('/analyze', (req, res) => {
  try {
    const { filename, mimeType, sampleHint, imageBase64 } = req.body || {};
    const result = classifyBiomassImage({ filename, mimeType, sampleHint, imageBase64 });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "AI Classification Error: " + error.message });
  }
});

/**
 * POST /api/chat
 * Multilingual AI Conversational Biomass Advisor
 * Processes natural language queries in English, Telugu, and Hindi
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body || {};
    if (!message) {
      return res.status(400).json({ success: false, message: "Query message is required." });
    }
    const result = await getAdvisorReply(message, language);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "AI Chat Error: " + error.message });
  }
});

router.get('/ai-status', (req, res) => {
  res.json({ success: true, provider: isAIConfigured() ? 'openai' : 'local' });
});

/**
 * GET /api/facilities
 * Find matching renewable energy / industrial facilities with distance & logistics cost
 */
router.get('/facilities', (req, res) => {
  try {
    const { wasteId, lat, lon, district } = req.query;
    const userLat = parseFloat(lat) || 16.3067; // Default Guntur
    const userLon = parseFloat(lon) || 80.4365;

    let results = findMatchingFacilities(wasteId || 'rice-straw', userLat, userLon);

    if (district) {
      results = results.filter(f => f.district.toLowerCase().includes(district.toLowerCase()));
    }

    res.json({
      success: true,
      count: results.length,
      userLocation: { latitude: userLat, longitude: userLon },
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Facility search error: " + error.message });
  }
});

/**
 * POST /api/calculate-viability
 * Decision Support Engine: Energy yield, transport cost, and transparent economic viability
 */
router.post('/calculate-viability', (req, res) => {
  try {
    const { wasteId, quantityKg, condition, harvestDate, latitude, longitude, locationName } = req.body || {};
    
    const evaluation = evaluateBiomassViability({
      wasteId,
      quantityKg,
      condition,
      harvestDate,
      latitude,
      longitude,
      locationName
    });

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ success: false, message: "Viability calculation error: " + error.message });
  }
});

/**
 * GET /api/alternatives
 * Retrieve farmer-level on-farm alternatives (Compost, Biochar, Mushroom, Briquettes, Mulch)
 */
router.get('/alternatives', (req, res) => {
  const { wasteId } = req.query;
  let results = alternativesData;

  if (wasteId) {
    results = results.filter(alt => alt.suitableResidues.includes(wasteId));
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

/**
 * GET /api/videos
 * Retrieve structured educational tutorials from verified agricultural institutions (ICAR / KVK)
 */
router.get('/videos', (req, res) => {
  const { wasteType, alternative, lang } = req.query;
  let results = [...videosData];

  if (wasteType) {
    results = results.filter(v => v.wasteType === wasteType);
  }
  if (alternative) {
    results = results.filter(v => v.alternative === alternative);
  }
  if (lang) {
    results = results.filter(v => v.language === lang);
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

/**
 * GET /api/farms
 * Retrieve list of registered farm lots
 */
router.get('/farms', (req, res) => {
  const { district, wasteType, availableOnly } = req.query;
  let results = [...farmsData];

  if (district) {
    results = results.filter(f => f.district.toLowerCase().includes(district.toLowerCase()));
  }
  if (wasteType) {
    results = results.filter(f => f.wasteType === wasteType);
  }
  if (availableOnly === 'true') {
    results = results.filter(f => f.availableForCollection);
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

/**
 * POST /api/farms
 * Register a new farm biomass lot
 */
router.post('/farms', (req, res) => {
  try {
    const { farmerName, phone, location, district, latitude, longitude, wasteType, quantity, harvestDate, condition, notes } = req.body || {};

    if (!farmerName || !wasteType || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required farm registration fields." });
    }

    const wasteInfo = wasteTypesData.find(w => w.id === wasteType) || wasteTypesData[0];

    const newFarm = {
      id: `farm-${Date.now()}`,
      farmerName: farmerName.trim(),
      phone: phone || "+91 98480 " + Math.floor(10000 + Math.random() * 90000),
      location: location || "Guntur District, Andhra Pradesh",
      district: district || "Guntur",
      latitude: parseFloat(latitude) || (16.20 + Math.random() * 0.2),
      longitude: parseFloat(longitude) || (80.40 + Math.random() * 0.2),
      wasteType: wasteType,
      wasteTypeName: wasteInfo.name,
      quantity: parseInt(quantity, 10),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      condition: condition || "Dry (<15%)",
      availableForCollection: true,
      status: "Available",
      notes: notes || "Registered via AgriAI Web Portal"
    };

    farmsData.unshift(newFarm);

    res.status(201).json({
      success: true,
      message: "Farm biomass lot registered successfully!",
      data: newFarm
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Farm registration error: " + error.message });
  }
});

/**
 * GET /api/collections
 * Retrieve community aggregation clusters
 */
router.get('/collections', (req, res) => {
  res.json({
    success: true,
    count: collectionsData.length,
    data: collectionsData
  });
});

/**
 * POST /api/collections
 * Create a new pooled community biomass cluster
 */
router.post('/collections', (req, res) => {
  try {
    const { name, district, farmIds, pickupDate } = req.body || {};
    if (farmIds && (!Array.isArray(farmIds) || farmIds.length === 0)) {
      return res.status(400).json({ success: false, message: 'farmIds must be a non-empty list when supplied.' });
    }
    if (farmIds && !farmIds.some(id => farmsData.some(farm => farm.id === id))) {
      return res.status(400).json({ success: false, message: 'None of the selected farm lots were found.' });
    }
    const newCluster = createBiomassCluster({ name, district, farmIds, pickupDate, farms: farmsData });
    
    collectionsData.unshift(newCluster);

    // Mark included farms as Pooled / In Progress
    if (farmIds && farmIds.length > 0) {
      farmsData.forEach(f => {
        if (farmIds.includes(f.id)) {
          f.status = "Pooled in Cluster";
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Community biomass aggregation cluster created successfully!",
      data: newCluster
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cluster creation error: " + error.message });
  }
});

/**
 * GET /api/dashboard
 * Aggregated metrics for both Farmer Dashboard and Admin/Gov/Industry Dashboard
 */
router.get('/dashboard', (req, res) => {
  try {
    const totalFarms = farmsData.length;
    const totalBiomassKg = farmsData.reduce((sum, f) => sum + (f.quantity || 0), 0);
    const totalCollections = collectionsData.length;
    const totalFacilities = facilitiesData.length;

    // Biomass breakdown by crop
    const byCropMap = {};
    farmsData.forEach(f => {
      const name = f.wasteTypeName || f.wasteType;
      byCropMap[name] = (byCropMap[name] || 0) + f.quantity;
    });
    const biomassByCrop = Object.entries(byCropMap).map(([crop, kg]) => ({ crop, kg }));

    // Biomass breakdown by district
    const byDistrictMap = {};
    farmsData.forEach(f => {
      const dist = f.district || "Guntur";
      byDistrictMap[dist] = (byDistrictMap[dist] || 0) + f.quantity;
    });
    const biomassByDistrict = Object.entries(byDistrictMap).map(([district, kg]) => ({ district, kg }));

    // Theoretical aggregate renewable energy potentials & environmental offsets
    const totalEnergyMJ = Math.round(totalBiomassKg * 15.5);
    const totalElectricityKwh = Math.round(totalBiomassKg * 4.3 * 0.32);
    const totalEthanolLiters = Math.round((totalBiomassKg / 1000) * 220);
    const totalCbgM3 = Math.round(totalBiomassKg * 0.28);
    const totalEstimatedValueInr = Math.round(totalBiomassKg * 2.45);
    const totalCo2AvoidedTonnes = +( (totalBiomassKg * 1.52) / 1000 ).toFixed(2);
    const totalCrudeOilSavedLiters = Math.round((totalBiomassKg / 1000) * 165);

    // Fuel pathway distribution for demo visualization
    const pathwaysDistribution = [
      { pathway: "2G Bio-Ethanol (🚗 Transport)", percentage: 38 },
      { pathway: "CBG / Bio-CNG (🚛 Heavy Transport)", percentage: 26 },
      { pathway: "Solid Briquettes & Pellets (⚡ Power)", percentage: 22 },
      { pathway: "On-Farm Biochar & Compost (🌱 Carbon)", percentage: 14 }
    ];

    res.json({
      success: true,
      summary: {
        totalRegisteredFarmers: totalFarms,
        totalBiomassRegisteredKg: totalBiomassKg,
        totalBiomassRegisteredTonnes: +(totalBiomassKg / 1000).toFixed(2),
        totalPotentialEnergyMJ: totalEnergyMJ,
        totalElectricityPotentialKwh: totalElectricityKwh,
        totalEthanolPotentialLiters: totalEthanolLiters,
        totalCbgPotentialM3: totalCbgM3,
        totalEstimatedValueInr: totalEstimatedValueInr,
        totalCo2AvoidedTonnes: totalCo2AvoidedTonnes,
        totalCrudeOilSavedLiters: totalCrudeOilSavedLiters,
        activeFacilitiesCount: totalFacilities,
        activeCollectionClusters: totalCollections
      },
      charts: {
        biomassByCrop: biomassByCrop,
        biomassByDistrict: biomassByDistrict,
        pathwaysDistribution: pathwaysDistribution,
        monthlyTrend: [
          { month: "May", tonnes: 18.2 },
          { month: "Jun", tonnes: 24.5 },
          { month: "Jul", tonnes: 31.0 },
          { month: "Aug", tonnes: +(totalBiomassKg / 1000 + 42).toFixed(1) }
        ]
      },
      recentFarms: farmsData.slice(0, 5),
      activeClusters: collectionsData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Dashboard data error: " + error.message });
  }
});

/**
 * POST /api/reset-demo
 * Resets dynamic collections and farms to pristine default demo state
 */
router.post('/reset-demo', (req, res) => {
  farmsData = [...require('../data/farms.json')];
  collectionsData = [...require('../data/collections.json')];
  res.json({
    success: true,
    message: "Demo dataset successfully reset to default Guntur, Andhra Pradesh baseline."
  });
});

module.exports = router;
