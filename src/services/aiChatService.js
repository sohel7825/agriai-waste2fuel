/**
 * Conversational AI Farmer Assistant for AgriAI – Waste2Fuel
 * 
 * DESIGN:
 * Answers in English, Telugu (తెలుగు), or Hindi (हिन्दी)
 * Follows the 7-Part Farmer-Friendly Actionable Format:
 * WHAT I FOUND → WHAT YOU CAN DO → BEST OPTION → WHY → NEARBY OPTION → IF NOT POSSIBLE → ALTERNATIVE
 */

const wasteTypes = require('../data/wasteTypes.json');
const facilities = require('../data/facilities.json');
const alternatives = require('../data/alternatives.json');

/**
 * Detect language from user query
 */
function detectLanguage(text = '') {
  if (/[\u0c00-\u0c7f]/.test(text)) return 'te'; // Telugu
  if (/[\u0900-\u097f]/.test(text)) return 'hi'; // Hindi
  return 'en';
}

/**
 * Build structured 7-part farmer response
 */
function generateStructuredFarmerResponse(wasteId, qtyKg, condition, lang = 'en') {
  const waste = wasteTypes.find(w => w.id === wasteId) || wasteTypes[0];
  const isWet = (condition || '').toLowerCase().includes('wet');

  if (lang === 'te') {
    if (isWet) {
      return `🌾 నేను కనుగొన్నది:\n${waste.name_te || waste.name}\n\n📦 పరిమాణం & పరిస్థితి:\n${qtyKg} కిలోలు (తడి వ్యర్థం)\n\n⭐ ఉత్తమ ఎంపిక:\nపొలంలోనే సేంద్రియ కంపోస్ట్ ఎరువు తయారు చేయండి.\n\n❓ ఎందుకు (కారణం):\nతేమ ఎక్కువగా ఉండటం వల్ల ఫ్యాక్టరీకి పంపడం లాభదాయకం కాదు. కంపోస్ట్ చేయడం వల్ల ఎకరానికి ₹3,500 ఎరువుల ఖర్చు ఆదా అవుతుంది.\n\n🏭 సమీప అవకాశం:\nపొడి వ్యర్థమైతే గుంటూరు 2G బయో-ఇథనాల్ రిఫైనరీ కొనుగోలు చేస్తుంది.\n\n🔄 ప్రత్యామ్నాయం:\nవర్మీ కంపోస్ట్ లేదా పుట్టగొడుగుల పెంపకం ద్వారా అదనపు ఆదాయం పొందవచ్చు.`;
    } else {
      return `🌾 నేను కనుగొన్నది:\n${waste.name_te || waste.name}\n\n📦 పరిమాణం & పరిస్థితి:\n${qtyKg} కిలోలు (ఎండిన వ్యర్థం)\n\n⭐ ఉత్తమ ఎంపిక:\nసమీపంలోని బయో-ఇంధన కేంద్రానికి పంపండి.\n\n❓ ఎందుకు (కారణం):\nమీ వ్యర్థాల పరిమాణం పెద్దది మరియు సమీప రిఫైనరీ అందుబాటులో ఉంది (అంచనా నికర లాభం: ₹1,482).\n\n🏭 సమీప కేంద్రం:\nడెమో 2G బయో-ఇథనాల్ రిఫైనరీ – గుంటూరు (సుమారు 12 కి.మీ).\n\n🔄 ఒకవేళ రవాణా వీలుకాకపోతే:\nపొలంలోనే వర్మీ కంపోస్ట్ లేదా ఆయిస్టర్ పుట్టగొడుగుల సాగు ద్వారా ₹6,000+ ఆదాయం పొందండి.`;
    }
  } else if (lang === 'hi') {
    if (isWet) {
      return `🌾 मुझे क्या मिला:\n${waste.name_hi || waste.name}\n\n📦 मात्रा और स्थिति:\n${qtyKg} किलो (गीला अवशेष)\n\n⭐ सर्वोत्तम विकल्प:\nखेत पर ही जैविक कम्पोस्ट खाद बनाएं।\n\n❓ क्यों (कारण):\nअधिक नमी होने के कारण फैक्ट्री भेजना अलाभकारी है। कम्पोस्ट खाद बनाने से ₹3,500 प्रति एकड़ रासायनिक खाद बचेगी।\n\n🏭 नजदीकी प्लांट:\nसूखा होने पर गुंटूर 2G बायो-इथेनॉल रिफाइनरी में भेजा जा सकता है।\n\n🔄 यदि यह संभव न हो:\nवर्मी कम्पोस्ट या बायोचार बनाकर खेत की मिट्टी उपजाऊ बनाएं।`;
    } else {
      return `🌾 मुझे क्या मिला:\n${waste.name_hi || waste.name}\n\n📦 मात्रा और स्थिति:\n${qtyKg} किलो (सूखा बायोमास)\n\n⭐ सर्वोत्तम विकल्प:\nनजदीकी बायोमास/ईंधन केंद्र को आपूर्ति करें।\n\n❓ क्यों (कारण):\nमात्रा पर्याप्त है और नजदीकी रिफाइनरी उपलब्ध है (अनुमानित शुद्ध लाभ: ₹1,482)।\n\n🏭 नजदीकी केंद्र:\nडेमो 2G बायो-इथेनॉल रिफाइनरी – गुंटूर (लगभग 12 किमी दूर)।\n\n🔄 यदि परिवहन संभव न हो:\nखेत पर ढींगरी (ऑयस्टर) मशरूम उगाएं या वर्मी कम्पोस्ट बनाएं।`;
    }
  } else {
    if (isWet) {
      return `🌾 WHAT I FOUND:\n${waste.name}\n\n📦 QUANTITY & CONDITION:\n${qtyKg} kg (Wet residue)\n\n⭐ BEST OPTION:\nMake on-farm aerobic compost.\n\n❓ WHY:\nHigh moisture makes industrial transport uneconomical. Composting saves ₹3,500/acre in fertilizer costs without transport expense.\n\n🏭 NEARBY FACILITY:\nDemo 2G Bio-Ethanol Refinery – Guntur (accepts dry residue).\n\n🔄 IF THAT IS NOT POSSIBLE:\nTry earthworm vermicomposting or field mulching for soil carbon.`;
    } else {
      return `🌾 WHAT I FOUND:\n${waste.name}\n\n📦 QUANTITY & CONDITION:\n${qtyKg} kg (Dry residue)\n\n⭐ BEST OPTION:\nSend to a suitable biomass bio-energy facility.\n\n❓ WHY:\nYour quantity is large enough for collection and a profitable nearby processing route is available (Estimated net return: ₹1,482).\n\n🏭 NEARBY FACILITY:\nDemo 2G Bio-Ethanol Refinery – Guntur (approx 12 km away).\n\n🔄 IF THAT IS NOT POSSIBLE:\nTry on-farm oyster mushroom cultivation (₹6,000+ return) or vermicomposting.`;
    }
  }
}

/**
 * Process natural language user query
 */
function processAIChat(userQuery = '', currentLang = 'en') {
  const query = userQuery.trim().toLowerCase();
  const detected = detectLanguage(userQuery);
  const lang = (detected !== 'en') ? detected : (currentLang || 'en');

  let reply = "";
  let actionTrigger = null;

  // Extract quantity if present
  const qtyMatch = query.match(/(\d+)/);
  const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1000;

  // Extract residue
  let wasteId = 'rice-straw';
  if (query.includes('bagasse') || query.includes('చెరకు') || query.includes('बगास') || query.includes('गन्ना')) wasteId = 'sugarcane-bagasse';
  else if (query.includes('cotton') || query.includes('పత్తి') || query.includes('कपास')) wasteId = 'cotton-residue';
  else if (query.includes('maize') || query.includes('మొక్కజొన్న') || query.includes('मक्का')) wasteId = 'maize-stalk';
  else if (query.includes('husk') || query.includes('పొట్టు') || query.includes('तవుడు') || query.includes('भूसा')) wasteId = 'rice-husk';
  else if (query.includes('groundnut') || query.includes('వేరుశనగ') || query.includes('मूंगफली')) wasteId = 'groundnut-shell';
  else if (query.includes('coconut') || query.includes('కొబ్బరి') || query.includes('नारियल')) wasteId = 'coconut-residue';

  const isWet = query.includes('wet') || query.includes('తడి') || query.includes('తేమ') || query.includes('गीला') || query.includes('नमी');

  // Intent 1: Demo / Test
  if (query.includes('demo') || query.includes('డెమో') || query.includes('डेमो') || query.includes('guntur')) {
    actionTrigger = { type: 'RUN_DEMO' };
    reply = generateStructuredFarmerResponse('rice-straw', 1000, 'Dry (<15%)', lang);
  }
  // Intent 2: General Residue Question
  else if (query.includes('straw') || query.includes('వరి') || query.includes('पराली') || query.includes('కచరా') || query.includes('waste') || query.includes('कचरे') || query.includes('చేయాలి') || query.includes('करें')) {
    reply = generateStructuredFarmerResponse(wasteId, qty, isWet ? 'Wet (>30%)' : 'Dry (<15%)', lang);
    actionTrigger = { type: 'NAVIGATE', view: isWet ? 'farmer-alternatives-view' : 'recommendation-view' };
  }
  // Intent 3: Facilities / Map
  else if (query.includes('facility') || query.includes('plant') || query.includes('map') || query.includes('కేంద్రాలు') || query.includes('నక్షా') || query.includes('प्लांट')) {
    actionTrigger = { type: 'NAVIGATE', view: 'facility-finder-view' };
    if (lang === 'te') {
      reply = "🏭 సమీప ఇంధన కేంద్రాలు:\nగుంటూరు పారిశ్రామిక ప్రాంతంలో 2G బయో-ఇథనాల్ రిఫైనరీ, విజయవాడలో CBG బయోగ్యాస్ ప్లాంట్ మరియు తెనాలిలో బ్రికెట్ తయారీ కేంద్రం అందుబాటులో ఉన్నాయి. వివరాలు తెరుస్తున్నాను.";
    } else if (lang === 'hi') {
      reply = "🏭 नजदीकी बायोमास केंद्र:\nगुंटूर औद्योगिक क्षेत्र में 2G बायो-इथेनॉल रिफाइनरी, विजयवाड़ा में सीबीजी प्लांट और तेनाली में ब्रिकेटिंग सेंटर स्थित हैं।";
    } else {
      reply = "🏭 Nearby Facilities:\nDemo 2G Bio-Ethanol Refinery (Guntur), Demo CBG Center (Vijayawada), and Demo Briquette Plant (Tenali) are available in the regional database.";
    }
  }
  // Intent 4: Alternatives / Compost / Mushroom
  else if (query.includes('compost') || query.includes('biochar') || query.includes('mushroom') || query.includes('ఎరువు') || query.includes('పుట్టగొడుగు') || query.includes('खाद') || query.includes('मशरूम')) {
    actionTrigger = { type: 'NAVIGATE', view: 'farmer-alternatives-view' };
    if (lang === 'te') {
      reply = "🌱 పొలంలోనే ఉత్తమ ప్రత్యామ్నాయాలు:\n1. సూక్ష్మజీవుల కంపోస్ట్ ఎరువు (45 రోజులు - ₹3,500 ఆదా)\n2. ఆయిస్టర్ పుట్టగొడుగుల సాగు (₹6,000+ ఆదాయం)\n3. వర్మీ కంపోస్ట్ మరియు బయోచార్ బొగ్గు తయారీ. పూర్తి గైడ్ తెరుస్తున్నాను.";
    } else if (lang === 'hi') {
      reply = "🌱 खेत स्तर पर विकल्प:\n1. एरोबिक कम्पोस्ट खाद (45 दिन - ₹3,500 बचत)\n2. ढींगरी (ऑयस्टर) मशरूम उत्पादन (₹6,000+ आय)\n3. वर्मी कम्पोस्ट एवं बायोचार। पूरी गाइड खोली जा रही है।";
    } else {
      reply = "🌱 On-Farm Alternatives:\n1. Aerobic Microbial Composting (45-60 days, saves ₹3,500/acre)\n2. Oyster Mushroom Cultivation (yields ₹6,000+ revenue)\n3. Earthworm Vermicompost & Flame-Cap Biochar.";
    }
  }
  // Default greeting / general
  else {
    reply = generateStructuredFarmerResponse(wasteId, qty, 'Dry (<15%)', lang);
  }

  return {
    success: true,
    language: lang,
    reply: reply,
    actionTrigger: actionTrigger
  };
}

module.exports = {
  processAIChat,
  generateStructuredFarmerResponse
};
