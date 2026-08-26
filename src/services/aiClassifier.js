/**
 * AgriAI agricultural residue classifier.
 *
 * This SIH prototype does not run a trained computer-vision model yet. It uses
 * deterministic metadata/sample-hint heuristics and clearly labels the result
 * as prototype inference. A real ONNX/TensorFlow model can replace the
 * heuristic resolver later without changing the API contract.
 */

const wasteTypes = require('../data/wasteTypes.json');

const HEURISTIC_KEYWORDS = {
  straw: 'rice-straw',
  paddy: 'rice-straw',
  rice: 'rice-straw',
  husk: 'rice-husk',
  chaff: 'rice-husk',
  maize: 'maize-stalk',
  corn: 'maize-stalk',
  stalk: 'maize-stalk',
  cob: 'maize-cob',
  corncob: 'maize-cob',
  bagasse: 'sugarcane-bagasse',
  cane: 'sugarcane-bagasse',
  sugar: 'sugarcane-bagasse',
  cotton: 'cotton-residue',
  groundnut: 'groundnut-shell',
  peanut: 'groundnut-shell',
  shell: 'groundnut-shell',
  coconut: 'coconut-residue',
  coir: 'coconut-residue'
};

const KEYWORD_ORDER = Object.keys(HEURISTIC_KEYWORDS).sort((a, b) => b.length - a.length);

function resolveFromMetadata(input = {}) {
  const query = `${input.filename || ''} ${input.sampleHint || ''}`.toLowerCase();
  const matchedKeyword = KEYWORD_ORDER.find(keyword => query.includes(keyword));

  if (matchedKeyword) {
    return {
      wasteId: HEURISTIC_KEYWORDS[matchedKeyword],
      matchedKeyword,
      evidence: 'filename/sample hint'
    };
  }

  return {
    wasteId: 'rice-straw',
    matchedKeyword: null,
    evidence: 'prototype default sample'
  };
}

function buildPredictions(primaryWaste) {
  const otherWastes = wasteTypes.filter(w => w.id !== primaryWaste.id);
  const secondary = otherWastes[0] || primaryWaste;
  const tertiary = otherWastes[1] || secondary;

  // Deterministic prototype scores; these are NOT model probabilities.
  const primaryConfidence = primaryWaste.id === 'rice-straw' ? 92 : 90;
  const secondaryConfidence = 6;
  const tertiaryConfidence = 2;

  return [
    { id: primaryWaste.id, name: primaryWaste.name, confidence: primaryConfidence },
    { id: secondary.id, name: secondary.name, confidence: secondaryConfidence },
    { id: tertiary.id, name: tertiary.name, confidence: tertiaryConfidence }
  ];
}

function classifyBiomassImage(input = {}) {
  const resolved = resolveFromMetadata(input);
  const primaryWaste = wasteTypes.find(w => w.id === resolved.wasteId) || wasteTypes[0];
  const predictions = buildPredictions(primaryWaste);

  return {
    success: true,
    engine: 'AgriAI Heuristic Inference v1.3 (Prototype)',
    mode: 'metadata-heuristic',
    identifiedWaste: primaryWaste,
    confidenceScore: predictions[0].confidence,
    predictions,
    evidence: {
      matchedKeyword: resolved.matchedKeyword,
      source: resolved.evidence
    },
    extractedFeatures: {
      colorProfile: primaryWaste.visualCharacteristics,
      estimatedFiberType: primaryWaste.category,
      suggestedOptimalMoisture: primaryWaste.optimalMoisture
    },
    safetyAdvice: primaryWaste.safetyAdvice,
    disclaimer: 'Prototype heuristic result based on filename/sample hint. It is not a trained image-recognition model. Farmer confirmation/correction is supported.'
  };
}

module.exports = { classifyBiomassImage };
