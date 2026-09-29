const materialTypes = require('../data/wasteTypes.json');

function detectLanguage(text = '') {
  if (/[\u0c00-\u0c7f]/.test(text)) return 'te';
  if (/[\u0900-\u097f]/.test(text)) return 'hi';
  return 'en';
}

function findMaterial(query) {
  if (query.includes('bagasse') || query.includes('చెరకు') || query.includes('बगास') || query.includes('गन्ना')) return 'sugarcane-bagasse';
  if (query.includes('cotton') || query.includes('పత్తి') || query.includes('कपास')) return 'cotton-residue';
  if (query.includes('maize') || query.includes('మొక్కజొన్న') || query.includes('मक्का')) return 'maize-stalk';
  if (query.includes('husk') || query.includes('పొట్టు') || query.includes('तवుడు') || query.includes('भूसा')) return 'rice-husk';
  if (query.includes('groundnut') || query.includes('వేరుశనగ') || query.includes('मूंगफली')) return 'groundnut-shell';
  if (query.includes('coconut') || query.includes('కొబ్బరి') || query.includes('नारियल')) return 'coconut-residue';
  return 'rice-straw';
}

function buildResponse(materialId, quantityKg, condition, lang) {
  const material = materialTypes.find(item => item.id === materialId) || materialTypes[0];
  const wet = condition === 'wet';
  const name = lang === 'te' ? (material.name_te || material.name) : lang === 'hi' ? (material.name_hi || material.name) : material.name;

  if (lang === 'te') {
    return wet
      ? `🌾 గుర్తించిన పదార్థం: ${name}\n\n📦 పరిమాణం & పరిస్థితి: ${quantityKg} కిలోలు, తడి\n\n⭐ తదుపరి చర్య: ముందుగా ఆరబెట్టడం లేదా సురక్షితమైన పొల స్థాయి వినియోగాన్ని పరిశీలించండి.\n\n❓ కారణం: అధిక తేమ ఉన్నప్పుడు పారిశ్రామిక రవాణా ఎల్లప్పుడూ అనుకూలం కాదు.\n\n🛡️ పంట నష్టం అయితే, ఫోటోలు, తేదీ, ప్రదేశం మరియు నష్టం వివరాలతో Loss Case రూపొందించండి.`
      : `🌾 గుర్తించిన పదార్థం: ${name}\n\n📦 పరిమాణం & పరిస్థితి: ${quantityKg} కిలోలు, పొడి\n\n⭐ తదుపరి చర్య: సమీపంలో ధృవీకరించబడిన బయోమాస్, బయోఫ్యూయల్ లేదా ఇతర వినియోగ మార్గాలను పోల్చండి.\n\n❓ కారణం: పరిమాణం, రవాణా, పరిస్థితి మరియు స్థానిక సదుపాయాల ఆధారంగా సరైన మార్గం మారుతుంది.\n\n🛡️ పంట నష్టం అయితే, అధికారిక బీమా/రిపోర్టింగ్ ప్రక్రియకు అవసరమైన ఆధారాలను సిద్ధం చేయండి.`;
  }

  if (lang === 'hi') {
    return wet
      ? `🌾 पहचानी गई सामग्री: ${name}\n\n📦 मात्रा और स्थिति: ${quantityKg} किलो, गीली\n\n⭐ अगला कदम: पहले सुखाने या सुरक्षित खेत-स्तरीय उपयोग पर विचार करें।\n\n❓ कारण: अधिक नमी में औद्योगिक परिवहन हमेशा उपयुक्त नहीं होता।\n\n🛡️ फसल नुकसान होने पर फोटो, तारीख, स्थान और नुकसान के विवरण के साथ Loss Case बनाएं।`
      : `🌾 पहचानी गई सामग्री: ${name}\n\n📦 मात्रा और स्थिति: ${quantityKg} किलो, सूखी\n\n⭐ अगला कदम: पास के सत्यापित बायोमास, बायोफ्यूल या अन्य उपयोग मार्गों की तुलना करें।\n\n❓ कारण: सही मार्ग मात्रा, परिवहन, स्थिति और स्थानीय सुविधाओं पर निर्भर करता है।\n\n🛡️ फसल नुकसान होने पर आधिकारिक बीमा/रिपोर्टिंग प्रक्रिया के लिए साक्ष्य तैयार करें।`;
  }

  return wet
    ? `🌾 MATERIAL IDENTIFIED: ${name}\n\n📦 QUANTITY & CONDITION: ${quantityKg} kg, wet\n\n⭐ NEXT ACTION: Consider drying, safe storage, or a suitable on-farm pathway before industrial transport.\n\n❓ WHY: High moisture can make some processing and transport routes unsuitable.\n\n🛡️ If this is crop damage, create a loss case with photos, date, location, crop, and damage details.`
    : `🌾 MATERIAL IDENTIFIED: ${name}\n\n📦 QUANTITY & CONDITION: ${quantityKg} kg, dry\n\n⭐ NEXT ACTION: Compare suitable biomass, biofuel, on-farm, and other utilization pathways.\n\n❓ WHY: The practical route depends on quantity, condition, transport, local facilities, safety, and farmer goals.\n\n🛡️ If this is crop damage, prepare evidence for the applicable official insurance/reporting process.`;
}

function processAIChat(userQuery = '', currentLang = 'en') {
  const raw = String(userQuery || '').trim();
  const query = raw.toLowerCase();
  const lang = detectLanguage(raw) !== 'en' ? detectLanguage(raw) : (currentLang || 'en');
  const quantityMatch = query.match(/(\d+(?:\.\d+)?)/);
  const quantityKg = quantityMatch ? Number(quantityMatch[1]) : 1000;
  const materialId = findMaterial(query);
  const wet = query.includes('wet') || query.includes('తడి') || query.includes('తేమ') || query.includes('गीला') || query.includes('नमी');

  let actionTrigger = null;

  if (query.includes('insurance') || query.includes('claim') || query.includes('బీమా') || query.includes('बीमा')) {
    actionTrigger = { type: 'NAVIGATE', view: 'insurance-intelligence-view' };
    return {
      success: true,
      language: lang,
      reply: lang === 'te'
        ? '🛡️ పంట బీమా సహాయం: మీ పంట, సీజన్, ప్రదేశం మరియు నష్టం వివరాలను నమోదు చేసి అధికారిక బీమా ప్రక్రియను తనిఖీ చేయండి. AgriAI క్లెయిమ్‌ను ఆమోదించదు లేదా పరిహారాన్ని నిర్ణయించదు.'
        : lang === 'hi'
          ? '🛡️ फसल बीमा सहायता: फसल, मौसम, स्थान और नुकसान का विवरण दर्ज करें और लागू आधिकारिक बीमा प्रक्रिया जांचें। AgriAI दावा मंजूर या मुआवजा तय नहीं करता।'
          : '🛡️ Crop insurance assistance: enter your crop, season, location, and damage details and follow the applicable official insurance process. AgriAI does not approve claims or determine compensation.',
      actionTrigger
    };
  }

  if (query.includes('loss') || query.includes('damage') || query.includes('flood') || query.includes('rain') || query.includes('cyclone') || query.includes('నష్టం') || query.includes('వరద') || query.includes('వర్షం') || query.includes('नुकसान') || query.includes('बाढ़')) {
    actionTrigger = { type: 'NAVIGATE', view: 'insurance-intelligence-view' };
    return { success: true, language: lang, reply: buildResponse(materialId, quantityKg, wet ? 'wet' : 'dry', lang), actionTrigger };
  }

  if (query.includes('facility') || query.includes('plant') || query.includes('map') || query.includes('కేంద్రం') || query.includes('प्लांट')) {
    actionTrigger = { type: 'NAVIGATE', view: 'facility-finder-view' };
  } else if (query.includes('compost') || query.includes('biochar') || query.includes('mushroom') || query.includes('ఎరువు') || query.includes('పుట్టగొడుగు') || query.includes('खाद') || query.includes('मशरूम')) {
    actionTrigger = { type: 'NAVIGATE', view: 'farmer-alternatives-view' };
  } else if (query.includes('waste') || query.includes('residue') || query.includes('straw') || query.includes('crop') || query.includes('వరి') || query.includes('पराली')) {
    actionTrigger = { type: 'NAVIGATE', view: wet ? 'farmer-alternatives-view' : 'recommendation-view' };
  }

  const result = buildResponse(materialId, quantityKg, wet ? 'wet' : 'dry', lang);
  return { success: true, language: lang, reply: result, actionTrigger };
}

module.exports = { processAIChat, buildResponse };
