/**
 * Community Biomass Aggregation & Logistics Pooling Engine (SIH 2026 Prototype)
 * 
 * CORE VALUE:
 * Smallholder farmers with 300–800 kg cannot economically hire individual 5-tonne trucks.
 * This engine pools nearby farms (e.g. 500kg + 800kg + 700kg + 1000kg = 3000kg)
 * into a single coordinated route, cutting per-kg logistics cost by 35-45%
 * and fulfilling the minimum delivery batch requirements of industrial bio-refineries.
 */

const collections = require('../data/collections.json');
const farms = require('../data/farms.json');
const facilities = require('../data/facilities.json');

/**
 * Get all active community biomass clusters
 */
function getClusters() {
  return collections;
}

/**
 * Group available farms into an ad-hoc or simulated cluster
 * @param {Array<string>} farmIds 
 */
function createBiomassCluster(params) {
  const farmList = params.farmIds && params.farmIds.length > 0 
    ? farms.filter(f => params.farmIds.includes(f.id))
    : farms.slice(0, 4); // Default to Farmer A, B, C, D

  const totalBiomassKg = farmList.reduce((sum, f) => sum + (f.quantity || 0), 0);
  const wasteType = farmList[0] ? farmList[0].wasteType : 'rice-straw';
  const wasteTypeName = farmList[0] ? farmList[0].wasteTypeName : 'Rice straw';

  // Find nearest compatible facility
  const compatibleFacilities = facilities.filter(fac => fac.acceptedWaste.includes(wasteType));
  const destFacility = compatibleFacilities[0] || facilities[0];

  // Logistics calculations
  // Individual trips: each farmer pays approx ₹800 - ₹1200 for individual small auto/tractor trip
  const individualTripCostTotal = farmList.length * 950;
  // Consolidated 6-Tonne single round trip: base ₹1800 + distance handling
  const consolidatedTripCost = Math.round(1600 + (farmList.length * 190));
  const logisticsSavings = Math.max(0, individualTripCostTotal - consolidatedTripCost);
  const savingsPercent = Math.round((logisticsSavings / individualTripCostTotal) * 100);

  const purchaseRate = (destFacility.purchasePricePerKg && destFacility.purchasePricePerKg[wasteType]) || 2.20;
  const indicativeTotalPayout = Math.round(totalBiomassKg * purchaseRate);

  const newCluster = {
    id: `cluster-${Date.now()}`,
    name: params.name || `Community Aggregation Cluster #${collections.length + 1}`,
    district: params.district || farmList[0]?.district || "Guntur",
    state: "Andhra Pradesh",
    wasteType: wasteType,
    wasteTypeName: wasteTypeName,
    centerLatitude: 16.2915,
    centerLongitude: 80.5315,
    farmerCount: farmList.length,
    totalBiomassKg: totalBiomassKg,
    farms: farmList.map(f => ({
      id: f.id,
      farmerName: f.farmerName,
      quantity: f.quantity,
      location: f.location
    })),
    destinationFacilityId: destFacility.id,
    destinationFacilityName: destFacility.name,
    scheduledPickupDate: params.pickupDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    suggestedTruckType: totalBiomassKg > 2500 ? "6-Tonne Medium Commercial Vehicle" : "3-Tonne Light Commercial Vehicle",
    individualTripCostTotal: individualTripCostTotal,
    consolidatedTripCost: consolidatedTripCost,
    logisticsSavings: logisticsSavings,
    savingsPercent: savingsPercent,
    status: "Active - Ready for Route Dispatch",
    indicativeTotalPayout: indicativeTotalPayout,
    isDemo: true
  };

  return newCluster;
}

module.exports = {
  getClusters,
  createBiomassCluster
};
