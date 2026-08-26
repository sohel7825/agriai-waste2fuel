/**
 * AgriAI agricultural residue classifier.
 *
 * Primary path: OpenAI vision model when an image data URL and OPENAI_API_KEY
 * are available. Fallback path: deterministic metadata/sample heuristics.
 *
 * The API response shape stays stable so the frontend can work in both modes.
 */

const OpenAI = require('openai');
const wasteTypes = require('../data/wasteTypes.json');

const HEURISTIC_KEYWORDS = {
  straw: 'rice-straw', paddy: 'rice-straw', rice: 'rice-straw',
  husk: 'rice-husk', chaff: 'rice-husk',
  maize: 'maize-stalk', corn: 'maize-stalk', stalk: 'maize-stalk',
  cob: 'maize-cob', corncob: 'maize-cob',
  bagasse: 'sugarcane-bagasse', cane: 'sugarcane-bagasse', sugar: 'sugarcane-bagasse',
  cotton: 'cotton-residue', groundnut: 'groundnut-shell', peanut: 'groundnut-shell',
  shell: 'groundnut-shell', coconut: 'coconut-residue', coir: 'coconut-residue'
};

const KEYWORD_ORDER = Object.keys(HEURISTIC_KEYWORDS).sort((a, b) => b.length - a.length);

function resolveFromMetadata(input = {}) {
  const query = `${input.filename || ''} ${input.sampleHint || ''}`.toLowerCase();
  const matchedKeyword = KEYWORD_ORDER.find(keyword => query.includes(keyword));
  return matchedKeyword
    ? { wasteId: HEURISTIC_KEYWORDS[matchedKeyword], matchedKeyword, evidence: 'filename/sample hint' }
    : { wasteId: 'rice-straw', matchedKeyword: null, evidence: 'prototype default sample' };
}

function buildPredictions(primaryWaste, confidence = 90) {
  const otherWastes = wasteTypes.filter(w => w.id !== primaryWaste.id);
  const secondary = otherWastes[0] || primaryWaste;
  const tertiary = otherWastes[1] || secondary;
  const primary = Math.max(1, Math.min(99, Math.round(Number(confidence) || 90)));
  const remaining = Math.max(0, 100 - primary);
  const second = Math.round(remaining * 0.7);
  const third = Math.max(0, remaining - second);
  return [
    { id: primaryWaste.id, name: primaryWaste.name, confidence: primary },
    { id: secondary.id, name: secondary.name, confidence: second },
    { id: tertiary.id, name: tertiary.name, confidence: third }
  ];
}

function normalizeResult(result, mode, evidence = {}) {
  const wasteId = result?.wasteId;
  const primaryWaste = wasteTypes.find(w => w.id === wasteId) || wasteTypes[0];
  const confidence = Math.max(1, Math.min(99, Number(result?.confidence) || 85));
  const predictions = buildPredictions(primaryWaste, confidence);

  return {
    success: true,
    engine: mode === 'openai-vision' ? 'OpenAI Vision + AgriAI Catalog v1' : 'AgriAI Heuristic Inference v1.4 (Prototype)',
    mode,
    identifiedWaste: primaryWaste,
    confidenceScore: predictions[0].confidence,
    predictions,
    evidence: {
      matchedKeyword: evidence.matchedKeyword || null,
      source: evidence.source || mode,
      visualReason: result?.reason || null
    },
    extractedFeatures: {
      colorProfile: primaryWaste.visualCharacteristics,
      estimatedFiberType: primaryWaste.category,
      suggestedOptimalMoisture: primaryWaste.optimalMoisture
    },
    safetyAdvice: primaryWaste.safetyAdvice,
    disclaimer: mode === 'openai-vision'
      ? 'AI vision estimate. Confirm the residue type before making commercial or safety-critical decisions.'
      : 'Prototype heuristic result based on filename/sample hint. It is not a trained image-recognition model.'
  };
}

function extractJson(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Vision model returned invalid JSON.');
  return JSON.parse(match[0]);
}

function isValidImageDataUrl(imageData) {
  return typeof imageData === 'string'
    && /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(imageData)
    && imageData.length <= 8 * 1024 * 1024;
}

async function classifyWithVision(imageData, language = 'en') {
  if (!process.env.OPENAI_API_KEY || !isValidImageDataUrl(imageData)) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const catalog = wasteTypes.map(w => `${w.id}: ${w.name}`).join('\n');
  const response = await client.responses.create({
    model: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    instructions: `You classify Indian agricultural residue photos for the AgriAI prototype.\nOnly choose a wasteId from this exact catalog:\n${catalog}\nDo not invent IDs. If the image is unclear, choose the closest catalog item with low confidence. Return ONLY valid JSON with keys wasteId, confidence, reason. confidence must be 1-99. Reason must be one short sentence. Language preference: ${language}.`,
    input: [{
      role: 'user',
      content: [
        { type: 'input_text', text: 'Identify the agricultural residue visible in this image.' },
        { type: 'input_image', image_url: imageData, detail: 'low' }
      ]
    }],
    max_output_tokens: 180,
    store: false
  });

  const result = extractJson(response.output_text);
  if (!wasteTypes.some(w => w.id === result.wasteId)) {
    throw new Error('Vision model returned an unknown residue type.');
  }
  return result;
}

async function classifyBiomassImage(input = {}) {
  const language = input.language || 'en';

  if (input.imageData) {
    try {
      const visionResult = await classifyWithVision(input.imageData, language);
      if (visionResult) return normalizeResult(visionResult, 'openai-vision');
    } catch (error) {
      console.warn('OpenAI vision unavailable; using deterministic fallback:', error.message);
    }
  }

  const resolved = resolveFromMetadata(input);
  return normalizeResult(
    { wasteId: resolved.wasteId, confidence: resolved.wasteId === 'rice-straw' ? 92 : 90 },
    'metadata-heuristic',
    { matchedKeyword: resolved.matchedKeyword, source: resolved.evidence }
  );
}

module.exports = { classifyBiomassImage };
