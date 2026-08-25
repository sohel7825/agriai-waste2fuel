/**
 * Farmer-Centric Economic Viability & Best Option Decision Engine (SIH 2026 Prototype)
 * 
 * CORE RULES:
 * - Simple plain-language explanations first, technical names separately.
 * - Multi-criteria scoring to rank: 🥇 BEST OPTION, 🥈 SECOND OPTION, 🥉 THIRD OPTION.
 * - Strict transparency against fake precision ("Indicative estimate").
 * - Residue-specific alternative filtering (does not blindly suggest mushroom cultivation for every crop).
 */

const wasteTypes = require('../data/wasteTypes.json');
const facilities = require('../data/facilities.json');
const alternatives = require('../data/alternatives.json');

/**
 * Calculate Great-Circle distance using Haversine formula
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 15;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
}

/**
 * Find matching facilities for a given waste type and location
 */
function findMatchingFacilities(wasteId, userLat, userLon) {
  const matches = facilities.filter(f => f.acceptedWaste.includes(wasteId));
  
  return matches.map(f => {
    const distanceKm = calculateHaversineDistance(userLat, userLon, f.latitude, f.longitude);
    const purchaseRate = (f.purchasePricePerKg && f.purchasePricePerKg[wasteId]) || 2.20;
    
    const baseLogisticsFee = 250;
    const perKmRate = 12;
    const estimatedTripTransportCost = +(baseLogisticsFee + (distanceKm * perKmRate)).toFixed(0);

    return {
      id: f.id,
      name: f.name,
      type: f.type,
      location: f.location,
      district: f.district,
      state: f.state,
      latitude: f.latitude,
      longitude: f.longitude,
      distanceKm: distanceKm,
      acceptedWaste: f.acceptedWaste,
      minimumQuantity: f.minimumQuantity,
      capacityTpd: f.capacityTpd,
      purchaseRatePerKg: purchaseRate,
      transportRebatePerKm: f.transportRebatePerKm,
      estimatedTripTransportCost: estimatedTripTransportCost,
      status: f.status,
      phone: f.phone,
      isDemo: true
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Main Evaluation Engine
 */
function evaluateBiomassViability(params) {
  const wasteId = params.wasteId || 'rice-straw';
  const quantityKg = Math.max(1, Number(params.quantityKg) || 1000);
  const condition = params.condition || 'Dry (<15%)';
  const userLat = Number(params.latitude) || 16.3067;
  const userLon = Number(params.longitude) || 80.4365;
  const locationName = params.locationName || 'Guntur, Andhra Pradesh';

  const wasteInfo = wasteTypes.find(w => w.id === wasteId) || wasteTypes[0];
  const matchingFacilities = findMatchingFacilities(wasteId, userLat, userLon);
  const nearestFacility = matchingFacilities[0] || null;

  // 1. Energy Potential (Standard Indicative Conversion Factors)
  const totalEnergyMJ = +(quantityKg * wasteInfo.calorificValueMJ).toFixed(0);
  const totalKwh = +(quantityKg * wasteInfo.kwhPerKg * 0.32).toFixed(1);
  const ethanolLiters = +( (quantityKg / 1000) * wasteInfo.ethanolYieldLPerTonne ).toFixed(1);
  const cbgM3 = +( quantityKg * wasteInfo.cbgYieldM3PerKg ).toFixed(1);

  // 2. Logistics & Economic Calculations
  const distanceKm = nearestFacility ? nearestFacility.distanceKm : 30;
  const unitPurchasePrice = nearestFacility ? nearestFacility.purchaseRatePerKg : wasteInfo.basePricePerKg;
  const grossBiomassValue = +(quantityKg * unitPurchasePrice).toFixed(0);

  const truckTrips = Math.ceil(quantityKg / 1500);
  const rawTransportCost = (250 * truckTrips) + (distanceKm * 14 * truckTrips);
  const transportRebate = nearestFacility ? (distanceKm * nearestFacility.transportRebatePerKm * truckTrips) : 0;
  const netTransportCost = +Math.max(150, rawTransportCost - transportRebate).toFixed(0);
  const collectionHandlingCost = +(quantityKg * 0.30).toFixed(0);

  const estimatedNetValue = +(grossBiomassValue - netTransportCost - collectionHandlingCost).toFixed(0);
  const netValuePerKg = +(estimatedNetValue / quantityKg).toFixed(2);

  // 3. Multi-Option Ranking Logic (🥇 BEST, 🥈 SECOND, 🥉 THIRD)
  const isConditionWet = condition.toLowerCase().includes('wet');
  const isDistanceTooFar = distanceKm > 65;
  const isBelowFacilityMinimum = nearestFacility ? (quantityKg < nearestFacility.minimumQuantity) : true;

  let rankedOptions = [];
  let economicStatus = "GOOD"; // "GOOD" (🟢), "POSSIBLE" (🟡), "NOT_ECONOMICAL" (🔴)
  let bestOptionTitle = "";
  let bestOptionWhy = "";

  // Filter valid alternatives strictly for this specific residue
  const validAlternatives = alternatives.filter(a => a.suitableResidues.includes(wasteId));

  if (isConditionWet) {
    economicStatus = "NOT_ECONOMICAL";
    bestOptionTitle = "🌱 On-Farm Composting & Organic Humus";
    bestOptionWhy = "Because the waste is wet (>30% moisture), industrial fuel conversion is uneconomical. Composting turns moisture into rich soil humus right on your farm.";

    rankedOptions = [
      {
        rank: "🥇 BEST OPTION",
        title: "🌱 On-Farm Aerobic Composting",
        why: "High moisture accelerates natural microbial decay, saving ₹2,500 – ₹4,000/acre in chemical fertilizers without transport cost.",
        action: "Follow 6-step compost guide on site"
      },
      {
        rank: "🥈 SECOND OPTION",
        title: "🪱 Earthworm Vermicomposting",
        why: "Produces premium black gold vermicompost selling at ₹6–₹10/kg in local markets.",
        action: "Mix with cow dung in shaded beds"
      },
      {
        rank: "🥉 THIRD OPTION",
        title: "🌾 In-Situ Soil Mulching",
        why: "Spread directly on field to retain moisture and suppress weeds for next crop.",
        action: "Use Happy Seeder or spread evenly"
      }
    ];
  } else if (estimatedNetValue <= 0 || netValuePerKg < 0.45 || (isDistanceTooFar && quantityKg < 1500)) {
    economicStatus = "NOT_ECONOMICAL";
    bestOptionTitle = "🌱 On-Farm Regenerative Use (Compost / Biochar)";
    bestOptionWhy = `Transporting ${quantityKg} kg over ${distanceKm} km costs ₹${netTransportCost}, consuming most of the value. Making compost or biochar on your field yields far better return.`;

    rankedOptions = [
      {
        rank: "🥇 BEST OPTION",
        title: "🌱 On-Farm Aerobic Composting",
        why: "Zero transport cost and replaces chemical fertilizer with organic soil nutrients.",
        action: "Start windrow compost pile"
      },
      {
        rank: "🥈 SECOND OPTION",
        title: (wasteId === 'rice-straw' || wasteId === 'maize-cob') ? "🍄 Oyster Mushroom Cultivation" : "🧫 Farm-Scale Biochar",
        why: (wasteId === 'rice-straw' || wasteId === 'maize-cob') ? "Generates ₹6,000+ income per 100 kg straw within 30 days." : "Locks carbon in soil and cuts irrigation needs by 25%.",
        action: "Follow ICAR verified tutorial"
      },
      {
        rank: "🥉 THIRD OPTION",
        title: "🚛 Community Biomass Pooling",
        why: "If you still wish to sell to a facility, pool with 3-4 neighboring farms to share truck costs.",
        action: "Join village aggregation cluster"
      }
    ];
  } else if (isBelowFacilityMinimum) {
    economicStatus = "POSSIBLE";
    bestOptionTitle = "🚛 Community Biomass Pooling (Cluster Sale)";
    bestOptionWhy = `Your lot (${quantityKg} kg) is below the single-truck delivery limit (${nearestFacility ? nearestFacility.minimumQuantity : 1000} kg). Pooling with nearby farmers cuts transport costs by ~38%.`;

    rankedOptions = [
      {
        rank: "🥇 BEST OPTION",
        title: "🚛 Community Biomass Pooling",
        why: `Pool with nearby farmers to achieve the ${nearestFacility ? nearestFacility.minimumQuantity : 1000} kg threshold and unlock ₹${estimatedNetValue} group earnings.`,
        action: "Join Guntur Agro-Cluster #1"
      },
      {
        rank: "🥈 SECOND OPTION",
        title: "🌱 On-Farm Aerobic Composting",
        why: "Immediate on-site fertilizer generation with zero logistics hassle.",
        action: "Compost on field"
      },
      {
        rank: "🥉 THIRD OPTION",
        title: (wasteId === 'groundnut-shell' || wasteId === 'cotton-residue') ? "🧱 Village Briquetting" : "🍄 Mushroom Cultivation",
        why: "Converts residue into solid local fuel logs or edible protein food.",
        action: "Explore farm guide"
      }
    ];
  } else {
    economicStatus = "GOOD";
    bestOptionTitle = `🏭 Send to Bio-Energy Facility (${wasteInfo.pathways[0] ? wasteInfo.pathways[0].name : 'Renewable Fuel'})`;
    bestOptionWhy = `Your volume (${quantityKg} kg) is dry, viable, and located within manageable distance (${distanceKm} km to ${nearestFacility ? nearestFacility.name : 'facility'}). Estimated net return: ₹${estimatedNetValue}.`;

    rankedOptions = [
      {
        rank: "🥇 BEST OPTION",
        title: `🏭 Supply to ${nearestFacility ? nearestFacility.name : 'Biomass Facility'}`,
        why: `High volume and dry condition provide positive net income of ₹${estimatedNetValue} (approx ₹${unitPurchasePrice}/kg).`,
        action: "Book dispatch notification"
      },
      {
        rank: "🥈 SECOND OPTION",
        title: "🚛 Community Biomass Aggregation",
        why: "Group with neighbors to cut truck fuel costs even further and boost profit margin.",
        action: "Add to regional cluster"
      },
      {
        rank: "🥉 THIRD OPTION",
        title: "🌱 On-Farm Composting / Biochar",
        why: "Reliable fallback if industrial transport schedules are delayed.",
        action: "Keep covered and compost"
      }
    ];
  }

  // 4. Environmental & National Security Calculations
  const co2AvoidedKg = +(quantityKg * 1.52).toFixed(1);
  const pm25SavedGrams = +(quantityKg * 3.2).toFixed(1);
  const crudeOilOffsetLiters = +( (quantityKg / 1000) * 165 ).toFixed(1);
  const treesEquivalent = Math.round(co2AvoidedKg / 21);

  return {
    success: true,
    inputSummary: {
      wasteId: wasteId,
      wasteName: wasteInfo.name,
      simpleDesc: wasteInfo.simple_desc,
      category: wasteInfo.category,
      quantityKg: quantityKg,
      condition: condition,
      harvestDate: params.harvestDate || new Date().toISOString().split('T')[0],
      location: locationName,
      coordinates: { latitude: userLat, longitude: userLon }
    },
    decision: {
      status: economicStatus, // "GOOD" (🟢), "POSSIBLE" (🟡), "NOT_ECONOMICAL" (🔴)
      statusBadge: economicStatus === "GOOD" ? "🟢 Good option" : (economicStatus === "POSSIBLE" ? "🟡 Possible option" : "🔴 Not economical for factory"),
      bestOptionTitle: bestOptionTitle,
      bestOptionWhy: bestOptionWhy,
      rankedOptions: rankedOptions
    },
    energyPotential: {
      calorificValueMJPerKg: wasteInfo.calorificValueMJ,
      totalEnergyMJ: totalEnergyMJ,
      electricityPotentialKwh: totalKwh,
      ethanolEquivalentLiters: ethanolLiters,
      cbgEquivalentM3: cbgM3,
      disclaimer: "Indicative estimate based on typical technical database values. Actual output depends on moisture, composition, processing technology, and facility conditions."
    },
    endUseAllocation: {
      primaryTarget: "🚗 Clean Transportation Fuel",
      transportationPotential: `${ethanolLiters > 0 ? ethanolLiters + ' L Bio-Ethanol / ' : ''}${cbgM3} m³ CBG`,
      electricityPotential: `${totalKwh} kWh Clean Electricity`,
      strategicImpact: `Offsets ~${crudeOilOffsetLiters} Liters of imported petroleum crude oil.`
    },
    environmentalImpact: {
      co2AvoidedKg: co2AvoidedKg,
      pm25SavedGrams: pm25SavedGrams,
      crudeOilOffsetLiters: crudeOilOffsetLiters,
      treesEquivalentAnnual: treesEquivalent,
      disclaimer: "Estimated emissions reduction vs baseline of open field residue burning."
    },
    economicBreakdown: {
      formula: "Indicative Net Value = Gross Biomass Value - Estimated Transport Cost - Collection & Handling",
      grossBiomassValue: grossBiomassValue,
      unitPricePerKg: unitPurchasePrice,
      transportationCost: netTransportCost,
      collectionHandlingCost: collectionHandlingCost,
      estimatedNetFarmerValue: estimatedNetValue,
      netValuePerKg: netValuePerKg,
      distanceToFacilityKm: distanceKm,
      isEstimated: true,
      currency: "INR (₹)",
      disclaimer: "Prototype calculation for decision support. Factory gate prices and transport rates are indicative benchmarks."
    },
    nearestFacility: nearestFacility,
    allMatchingFacilities: matchingFacilities,
    onFarmAlternatives: validAlternatives
  };
}

module.exports = {
  calculateHaversineDistance,
  findMatchingFacilities,
  evaluateBiomassViability
};
