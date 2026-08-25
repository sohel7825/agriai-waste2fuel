/**
 * Comprehensive Multilingual Translation Engine (i18n) for AgriAI – Waste2Fuel
 * Supports: English (en), Telugu (te - తెలుగు), Hindi (hi - हिन्दी)
 */

const I18N = {
  currentLang: 'en',

  translations: {
    en: {
      tagline: "Agricultural Residue to Renewable Fuel Decision Support",
      proto_title: "🌾 SIH 2026 Prototype — Problem Statement SIH26203 | Renewable Energy",
      proto_badge: "Prototype / Demonstration Data",
      quick_demo_btn: "⚡ 1-Click Demo Mode (Guntur, AP)",

      nav_home: "🏠 Home",
      nav_dashboard: "📊 Farmer Dashboard",
      nav_analyze: "🔍 Analyze Waste",
      nav_recommendation: "💡 Recommendation",
      nav_facilities: "🏭 Facilities",
      nav_alternatives: "🌱 Farm Alternatives",
      nav_pooling: "🚛 Community Pooling",
      nav_map: "🗺️ Biomass Map",
      nav_admin: "📈 Admin Hub",
      nav_learn: "📚 Learn & Do",

      hero_tag: "🌟 SIH 2026 Student Innovation Prototype",
      hero_title: "AgriAI – Waste2Fuel",
      hero_tagline: "“Agricultural Waste Is Not Waste — It Is a Resource for Future Fuel.”",
      hero_desc: "AgriAI empowers smallholder farmers to convert crop residues into clean bio-energy or high-value organic assets. Using intelligent visual classification, transparent logistical calculations, and community aggregation, AgriAI connects suitable biomass with 2G ethanol bio-refineries, CBG plants, and sustainable farm-level alternatives.",
      btn_analyze: "🔍 Analyze My Waste",
      btn_demo: "⚡ Run Demo Mode (Guntur, AP)",
      btn_map: "🗺️ View Biomass Map",
      btn_dashboard: "📊 Open Dashboard",

      sec_reserve_badge: "Strategic Distributed Energy Reserve",
      sec_reserve_title: "Strengthening India's Fuel Independence & Crisis Resilience",
      sec_reserve_desc: "In a major fuel-supply disruption or emergency, dependence on imported crude oil creates a strategic vulnerability. AgriAI mobilizes rural crop residues into a decentralized domestic clean fuel reserve — converting surplus straw and stalks into 2G Ethanol (🚗 Transport), CBG / Bio-CNG (🚛 Heavy Transport), and Cogeneration (⚡ Backup Rural Electricity).",
      sec_zero_burn: "🌾 Zero Burning (Smog Prevented)",
      sec_crude_cut: "⛽ Crude Bill Cut (Domestic Fuel)",
      sec_grid_backup: "⚡ Rural Grid Backup (Biomass Power)",

      uvp_title: "✨ What Makes AgriAI Unique?",
      uvp_subtitle: "“AgriAI does not simply identify agricultural waste. It decides what the most practical next step is.”",
      outcome_1_title: "1. CAN BECOME FUEL",
      outcome_1_desc: "When lot size, dry condition, and logistics match nearby bio-refineries, AgriAI calculates net earnings and connects farmers directly to 2G Bio-Ethanol, CBG, or Briquetting plants.",
      outcome_2_title: "2. CAN BE COLLECTED ECONOMICALLY",
      outcome_2_desc: "Single small farm batches (300–800 kg) cannot afford solo trucks. AgriAI pools neighboring farmers into 3000+ kg clusters, unlocking factory pricing and slashing transport costs by 38%.",
      outcome_3_title: "3. INDUSTRIAL ROUTE NOT VIABLE",
      outcome_3_desc: "If biomass is wet, volume is low, or industrial transport is uneconomical, AgriAI avoids forced industrial routes and delivers step-by-step guidance for Compost, Biochar, or Mushroom cultivation.",

      step_1_title: "Farmer In Field", step_1_desc: "Opens AgriAI mobile/web portal at harvest.",
      step_2_title: "Upload Photo", step_2_desc: "Snaps picture of straw, husks, or stalks.",
      step_3_title: "AI Identification", step_3_desc: "Modular vision classifier identifies residue & confidence.",
      step_4_title: "Quantity & Moisture", step_4_desc: "Farmer inputs lot weight, harvest date, and condition.",
      step_5_title: "Energy Potential", step_5_desc: "Calculates MJ, kWh electricity, and 2G Ethanol yield.",
      step_6_title: "Facility Matching", step_6_desc: "Finds nearest compatible processing units.",
      step_7_title: "Economic Viability", step_7_desc: "Calculates: Net Value = Biomass Value - Transport - Handling.",
      step_8_title: "Best Decision", step_8_desc: "Labels as GOOD, MODERATE, or NOT VIABLE.",
      step_9_title: "Dispatch or Reuse", step_9_desc: "Direct bio-refinery pickup or on-farm composting/biochar.",

      dash_registered_biomass: "Registered Biomass",
      dash_clean_energy: "Potential Clean Energy",
      dash_gross_value: "Indicative Gross Value",
      dash_nearby_fac: "Nearby Facilities",
      dash_quick_check: "🚀 Quick Waste Check",
      dash_alt_uses: "🌱 Alternative Uses",

      analyze_step1: "📸 Step 1: Upload or Capture Photo",
      analyze_dragdrop: "Drag & drop waste photo here",
      analyze_camera_btn: "📷 Open Camera Simulator",
      analyze_sample_hint: "Or test with sample field images:",
      analyze_step2: "⚖️ Step 2: Lot Parameters & Logistics",
      analyze_residue_label: "Confirmed Residue Type (AI Detected / Farmer Corrected):",
      analyze_qty_label: "Biomass Quantity (in kg):",
      analyze_cond_label: "Moisture Condition:",
      analyze_harvest_label: "Harvest Date:",
      analyze_loc_label: "Farm Location:",
      analyze_btn_submit: "🚀 Calculate Viability & Best Pathway",

      rec_title_main: "💡 Decision Support & Recommendation",
      rec_title_sub: "Evaluation of energy potential, logistics feasibility, and transparent net economic returns.",
      rec_btn_listen: "🔊 Listen to Advice (Voice)",
      rec_energy_title: "⚡ Estimated Energy & Bio-Fuel Potential",
      rec_math_title: "💰 Transparent Economic Breakdown",
      rec_env_title: "🌍 Environmental Carbon & Smog Offset:",
      rec_steps_title: "📝 Recommended Next Steps:",
      rec_alt_fallback_title: "🌱 On-Farm Alternatives for this Residue",

      voice_modal_title: "🎙️ AgriAI Multilingual Voice Assistant",
      voice_listening: "🎙️ Listening... Speak your crop residue or question in Telugu, Hindi, or English.",
      voice_btn_done: "⏹️ Done Speaking",

      chat_title: "🤖 AgriBot – AI Biomass Advisor",
      chat_subtitle: "Online • Multi-lingual (EN/TE/HI)",
      chat_placeholder: "Ask in English, తెలుగు, or हिन्दी (e.g. 1000kg rice straw)...",
      chat_welcome: "నమస్కారం! / नमस्ते! / Hello! I am your AgriAI Advisor. Ask me anything about crop residues, 2G Ethanol, CBG, or on-farm Composting."
    },

    te: {
      tagline: "వ్యవసాయ వ్యర్థాల నుండి పునరుత్పాదక ఇంధనం వైపు నిర్ణయ మద్దతు వేదిక",
      proto_title: "🌾 SIH 2026 విద్యార్థి ఆవిష్కరణ ప్రాజెక్ట్ — సమస్య ID: SIH26203 | పునరుత్పాదక ఇంధనం",
      proto_badge: "డెమో / నమూనా డేటా",
      quick_demo_btn: "⚡ 1-క్లిక్ గుంటూరు డెమో (వరి గడ్డి)",

      nav_home: "🏠 హోమ్",
      nav_dashboard: "📊 రైతు డ్యాష్‌బోర్డ్",
      nav_analyze: "🔍 వ్యర్థాల విశ్లేషణ",
      nav_recommendation: "💡 సిఫార్సు & లాభం",
      nav_facilities: "🏭 ఇంధన కేంద్రాలు",
      nav_alternatives: "🌱 పొలం ఎంపికలు",
      nav_pooling: "🚛 రైతుల సమూహం (పూలింగ్)",
      nav_map: "🗺️ బయోమాస్ మ్యాప్",
      nav_admin: "📈 అడ్మిన్ హబ్",
      nav_learn: "📚 నేర్చుకోండి & చేయండి",

      hero_tag: "🌟 SIH 2026 విద్యార్థి ఆవిష్కరణ ప్రాజెక్ట్",
      hero_title: "అగ్రి-ఏఐ – వేస్ట్ టు ఫ్యూయల్ (AgriAI)",
      hero_tagline: "“వ్యవసాయ వ్యర్థాలు చెత్త కాదు — అవి భవిష్యత్ ఇంధన సంపద.”",
      hero_desc: "వరి గడ్డి, పత్తి కట్టెలు, చెరకు పిప్పి వంటి పంట వ్యర్థాలను తగులబెట్టకుండా... 2G బయో-ఇథనాల్, బయోగ్యాస్ (CBG), బయోచార్ మరియు సేంద్రియ ఎరువులుగా మార్చుకోవడానికి అగ్రి-ఏఐ రైతులకు మార్గదర్శనం చేస్తుంది. ప్రత్యక్ష లాభాలు, రవాణా లెక్కలు మరియు సమీప రిఫైనరీలతో అనుసంధానం అందిస్తుంది.",
      btn_analyze: "🔍 వ్యర్థాలను విశ్లేషించండి",
      btn_demo: "⚡ గుంటూరు డెమో చూడండి",
      btn_map: "🗺️ బయోమాస్ మ్యాప్",
      btn_dashboard: "📊 రైతు డ్యాష్‌బోర్డ్",

      sec_reserve_badge: "వ్యూహాత్మక వికేంద్రీకృత ఇంధన రిజర్వ్",
      sec_reserve_title: "భారతదేశ ఇంధన స్వయంసమృద్ధి & సంక్షోభ నిరోధకత",
      sec_reserve_desc: "ఇంధన సరఫరా అంతరాయం లేదా సంక్షోభ సమయాల్లో విదేశీ ముడి చమురుపై ఆధారపడటం ప్రమాదకరం. అగ్రి-ఏఐ గ్రామీణ పంట వ్యర్థాలను దేశీయ స్వచ్ఛమైన ఇంధన నిల్వగా మారుస్తుంది — 2G ఇథనాల్ (🚗 రవాణా), CBG బయోగ్యాస్ (🚛 భారీ రవాణా), మరియు విద్యుత్ (⚡ బ్యాకప్ విద్యుత్).",
      sec_zero_burn: "🌾 పొగ కాలుష్య రహితం (పొలాల్లో కాల్చడం నివారణ)",
      sec_crude_cut: "⛽ దిగుమతి చమురు బిల్లు తగ్గింపు",
      sec_grid_backup: "⚡ గ్రామీణ గ్రిడ్ బ్యాకప్ విద్యుత్",

      uvp_title: "✨ అగ్రి-ఏఐ ప్రత్యేకత ఏమిటి?",
      uvp_subtitle: "“అగ్రి-ఏఐ కేవలం వ్యర్థాలను గుర్తించడమే కాదు... రైతుకు అత్యంత లాభదాయకమైన తదుపరి మార్గాన్ని నిర్ణయిస్తుంది.”",
      outcome_1_title: "1. ఇంధనంగా మార్చవచ్చు",
      outcome_1_desc: "ఎండిన వ్యర్థాలు తగినంత పరిమాణంలో ఉన్నప్పుడు 2G బయో-ఇథనాల్, బయోగ్యాస్ (CBG) రిఫైనరీలకు విక్రయించి నేరుగా నగదు పొందవచ్చు.",
      outcome_2_title: "2. రైతుల సమూహ రవాణా (పూలింగ్)",
      outcome_2_desc: "చిన్న రైతులు (500-800 కేజీలు) కలసి 3,000 కేజీల క్లస్టర్‌గా ఏర్పడి లారీ రవాణా ఖర్చులను 38% వరకు తగ్గించుకోవచ్చు.",
      outcome_3_title: "3. పొలంలోనే సేంద్రీయ వినియోగం",
      outcome_3_desc: "తేమ ఎక్కువగా ఉన్నా లేదా ఫ్యాక్టరీ దూరం ఎక్కువైనా... పొలంలోనే వర్మీ కంపోస్ట్, బయోచార్ లేదా పుట్టగొడుగుల పెంపకంతో ₹3,500+ ఆదా చేసుకోవచ్చు.",

      step_1_title: "పొలంలో రైతు", step_1_desc: "కోత సమయంలో అగ్రి-ఏఐ పోర్టల్ తెరుస్తారు.",
      step_2_title: "ఫోటో తీయండి", step_2_desc: "వరి గడ్డి, పొట్టు లేదా కట్టెల ఫోటో తీయండి.",
      step_3_title: "ఏఐ గుర్తింపు", step_3_desc: "కంప్యూటర్ విజన్ ద్వారా వ్యర్థ రకాన్ని గుర్తిస్తుంది.",
      step_4_title: "పరిమాణం & తేమ", step_4_desc: "బరువు, కోత తేదీ మరియు తేమ నమోదు చేయండి.",
      step_5_title: "ఇంధన సామర్థ్యం", step_5_desc: "MJ శక్తి, విద్యుత్ మరియు ఇథనాల్ లీటర్ల లెక్కింపు.",
      step_6_title: "సమీప కేంద్రం", step_6_desc: "సమీపంలోని బయో-రిఫైనరీలను మ్యాప్ చేస్తుంది.",
      step_7_title: "ఖర్చు & లాభం", step_7_desc: "నికర లాభం = వ్యర్థాల విలువ - రవాణా - నిర్వహణ.",
      step_8_title: "ఉత్తమ సిఫార్సు", step_8_desc: "మంచిది, మధ్యస్థం లేదా పొలం ఎంపికగా వర్గీకరిస్తుంది.",
      step_9_title: "రవాణా లేదా ఎరువు", step_9_desc: "ఫ్యాక్టరీకి పంపడం లేదా పొలంలోనే ఎరువుగా మార్చడం.",

      dash_registered_biomass: "నమోదైన వ్యర్థాలు",
      dash_clean_energy: "స్వచ్ఛమైన శక్తి సామర్థ్యం",
      dash_gross_value: "అంచనా స్థూల విలువ",
      dash_nearby_fac: "సమీప కేంద్రాలు",
      dash_quick_check: "🚀 త్వరిత వ్యర్థాల తనిఖీ",
      dash_alt_uses: "🌱 ప్రత్యామ్నాయ సేంద్రీయ ఉపయోగాలు",

      analyze_step1: "📸 దశ 1: ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి",
      analyze_dragdrop: "పంట వ్యర్థాల ఫోటోను ఇక్కడ వేయండి",
      analyze_camera_btn: "📷 కెమెరా సిమ్యులేటర్ తెరవండి",
      analyze_sample_hint: "లేదా నమూనా ఫోటోలతో ప్రయత్నించండి:",
      analyze_step2: "⚖️ దశ 2: వ్యర్థాల పరిమాణం & రవాణా వివరాలు",
      analyze_residue_label: "ధృవీకరించబడిన వ్యర్థ రకం (ఏఐ / రైతు సవరణ):",
      analyze_qty_label: "వ్యర్థాల పరిమాణం (కేజీలలో):",
      analyze_cond_label: "తేమ పరిస్థితి:",
      analyze_harvest_label: "కోత తేదీ:",
      analyze_loc_label: "పొలం స్థలం (గ్రామం / జిల్లా):",
      analyze_btn_submit: "🚀 లాభదాయకత & ఉత్తమ మార్గాన్ని లెక్కించండి",

      rec_title_main: "💡 నిర్ణయ మద్దతు & ఉత్తమ సిఫార్సు",
      rec_title_sub: "పునరుత్పాదక ఇంధన సామర్థ్యం, రవాణా సాధ్యాసాధ్యాలు మరియు రైతు నికర ఆదాయం లెక్కింపు.",
      rec_btn_listen: "🔊 సలహాను వినండి (వాయిస్)",
      rec_energy_title: "⚡ అంచనా వేసిన పునరుత్పాదక ఇంధన సామర్థ్యం",
      rec_math_title: "💰 పారదర్శక ఆర్థిక లెక్కల వివరాలు",
      rec_env_title: "🌍 పర్యావరణ పరిరక్షణ & కార్బన్ ఆదా:",
      rec_steps_title: "📝 రైతు చేయవలసిన తదుపరి పనులు:",
      rec_alt_fallback_title: "🌱 ఈ వ్యర్థానికి సంబంధించిన పొలం ప్రత్యామ్నాయాలు",

      voice_modal_title: "🎙️ అగ్రి-ఏఐ బహుభాషా వాయిస్ అసిస్టెంట్",
      voice_listening: "🎙️ వింటున్నాను... మీ పంట వ్యర్థాల గురించి తెలుగులో మాట్లాడండి (ఉదా: 1000 కేజీల వరి గడ్డి గుంటూరు).",
      voice_btn_done: "⏹️ మాట్లాడటం పూర్తయింది",

      chat_title: "🤖 అగ్రి-బోట్ – AI సలహాదారు",
      chat_subtitle: "ఆన్‌లైన్ • బహుభాషా మద్దతు (తెలుగు/హిందీ/ఇంగ్లీష్)",
      chat_placeholder: "తెలుగులో అడగండి (ఉదా: 1000 కేజీల వరి గడ్డిని ఏమి చేయాలి?)...",
      chat_welcome: "నమస్కారం! నేను మీ అగ్రి-ఏఐ సలహాదారుని. పంట వ్యర్థాల అమ్మకం, 2G ఇథనాల్, బయోగ్యాస్ లేదా కంపోస్టింగ్ గురించి ఏదైనా అడగండి."
    },

    hi: {
      tagline: "कृषि अवशेष से नवीकरणीय ईंधन निर्णय प्रणाली",
      proto_title: "🌾 SIH 2026 छात्र नवाचार — समस्या ID: SIH26203 | नवीकरणीय ऊर्जा",
      proto_badge: "डेमो / प्रोटोटाइप डेटा",
      quick_demo_btn: "⚡ 1-क्लिक गुंटूर डेमो (धान की पराली)",

      nav_home: "🏠 होम",
      nav_dashboard: "📊 किसान डैशबोर्ड",
      nav_analyze: "🔍 अवशेष विश्लेषण",
      nav_recommendation: "💡 सिफारिश व लाभ",
      nav_facilities: "🏭 प्रसंस्करण प्लांट",
      nav_alternatives: "🌱 खेत के विकल्प",
      nav_pooling: "🚛 सामूहिक एकत्रीकरण",
      nav_map: "🗺️ बायोमास नक्शा",
      nav_admin: "📈 एडमिन हब",
      nav_learn: "📚 सीखें और करें",

      hero_tag: "🌟 SIH 2026 नवाचार प्रोटोटाइप",
      hero_title: "एग्री-एआई – वेस्ट टू फ्यूल (AgriAI)",
      hero_tagline: "“कृषि अवशेष कचरा नहीं — यह भविष्य का ईंधन संसाधन है।”",
      hero_desc: "एग्री-एआई किसानों को पराली, भूसा और फसल अवशेषों को जलाने से रोककर 2G इथेनॉल, सीबीजी (CBG) बायोगैस, बायोचार या वर्मी कम्पोस्ट में बदलने में मदद करता है। सटीक परिवहन लागत, नजदीकी बायो-रिफाइनरी और वास्तविक लाभ की जानकारी पाएं।",
      btn_analyze: "🔍 अपशिष्ट विश्लेषण करें",
      btn_demo: "⚡ गुंटूर डेमो चलाएं",
      btn_map: "🗺️ बायोमास नक्शा",
      btn_dashboard: "📊 किसान डैशबोर्ड",

      sec_reserve_badge: "रणनीतिक विकेंद्रीकृत ईंधन भंडार",
      sec_reserve_title: "भारत की ईंधन आत्मनिर्भरता और संकट प्रतिरोधक क्षमता",
      sec_reserve_desc: "ईंधन आपूर्ति में व्यवधान या आपातकाल में विदेशी कच्चे तेल पर निर्भरता जोखिम पैदा करती है। एग्री-एआई ग्रामीण फसल अवशेषों को घरेलू स्वच्छ ईंधन भंडार में बदलता है — 2G इथेनॉल (🚗 परिवहन), सीबीजी बायोगैस (🚛 भारी परिवहन), और सह-उत्पादन (⚡ बैकअप बिजली)।",
      sec_zero_burn: "🌾 पराली दहन मुक्त (धुआं प्रदूषण रोकथाम)",
      sec_crude_cut: "⛽ कच्चे तेल आयात में कटौती",
      sec_grid_backup: "⚡ ग्रामीण ग्रिड बैकअप बिजली",

      uvp_title: "✨ एग्री-एआई की खासियत",
      uvp_subtitle: "“एग्री-एआई केवल कचरे की पहचान नहीं करता, बल्कि सबसे लाभदायक अगला कदम तय करता है।”",
      outcome_1_title: "1. ईंधन बनाया जा सकता है",
      outcome_1_desc: "सूखा बायोमास पर्याप्त मात्रा में होने पर 2G इथेनॉल और सीबीजी प्लांट से सीधे जुड़कर उचित दाम प्राप्त करें।",
      outcome_2_title: "2. सामूहिक एकत्रीकरण (पूलिंग)",
      outcome_2_desc: "छोटे किसान (500-800 किलो) मिलकर 3000 किलो का समूह बनाकर ट्रक से भेजें और 38% मालभाड़ा बचाएं।",
      outcome_3_title: "3. खेत पर ही जैविक उपयोग",
      outcome_3_desc: "यदि पराली गीली है या प्लांट दूर है, तो खेत पर वर्मी कम्पोस्ट या बायोचार बनाकर ₹3,500 प्रति एकड़ खाद बचाएं।",

      step_1_title: "खेत में किसान", step_1_desc: "कटाई के समय एग्री-एआई पोर्टल खोलते हैं।",
      step_2_title: "फोटो अपलोड करें", step_2_desc: "पराली, भूसे या डंठल की फोटो लें।",
      step_3_title: "एआई पहचान", step_3_desc: "कंप्यूटर विज़न तकनीक से अवशेष की पहचान।",
      step_4_title: "मात्रा और नमी", step_4_desc: "वजन, कटाई तिथि और नमी की स्थिति दर्ज करें।",
      step_5_title: "ऊर्जा क्षमता", step_5_desc: "MJ ऊर्जा, बिजली और इथेनॉल लीटर की गणना।",
      step_6_title: "नजदीकी प्लांट", step_6_desc: "निकटतम बायो-रिफाइनरी से मिलान।",
      step_7_title: "आर्थिक लाभ", step_7_desc: "शुद्ध लाभ = बायोमास मूल्य - परिवहन - हैंडलिंग।",
      step_8_title: "सर्वोत्तम निर्णय", step_8_desc: "उत्तम, मध्यम या खेत विकल्प के रूप में वर्गीकृत।",
      step_9_title: "फैक्ट्री या खाद", step_9_desc: "प्लांट को आपूर्ति या खेत पर कम्पोस्टिंग।",

      dash_registered_biomass: "पंजीकृत बायोमास",
      dash_clean_energy: "स्वच्छ ऊर्जा क्षमता",
      dash_gross_value: "अनुमानित कुल मूल्य",
      dash_nearby_fac: "नजदीकी प्लांट",
      dash_quick_check: "🚀 त्वरित पराली जांच",
      dash_alt_uses: "🌱 वैकल्पिक जैविक उपयोग",

      analyze_step1: "📸 चरण 1: फोटो अपलोड या कैप्चर करें",
      analyze_dragdrop: "फसल अवशेष की फोटो यहाँ डालें",
      analyze_camera_btn: "📷 कैमरा सिम्युलेटर खोलें",
      analyze_sample_hint: "या नमूना फोटो से जांचें:",
      analyze_step2: "⚖️ चरण 2: मात्रा एवं परिवहन विवरण",
      analyze_residue_label: "पुष्टीकृत अवशेष का प्रकार (AI / किसान द्वारा चयनित):",
      analyze_qty_label: "बायोमास मात्रा (किलोग्राम में):",
      analyze_cond_label: "नमी की स्थिति:",
      analyze_harvest_label: "कटाई की तिथि:",
      analyze_loc_label: "खेत का स्थान (गाँव / जिला):",
      analyze_btn_submit: "🚀 आर्थिक लाभ और सर्वोत्तम मार्ग की गणना करें",

      rec_title_main: "💡 निर्णय समर्थन और सर्वोत्तम सिफारिश",
      rec_title_sub: "नवीकरणीय ऊर्जा क्षमता, परिवहन व्यवहार्यता और किसान का शुद्ध लाभ।",
      rec_btn_listen: "🔊 सलाह सुनें (आवाज़)",
      rec_energy_title: "⚡ अनुमानित नवीकरणीय ऊर्जा और जैव-ईंधन क्षमता",
      rec_math_title: "💰 पारदर्शी वित्तीय लाभ का विवरण",
      rec_env_title: "🌍 पर्यावरण संरक्षण और कार्बन बचत:",
      rec_steps_title: "📝 किसान के लिए अगले कदम:",
      rec_alt_fallback_title: "🌱 इस अवशेष के लिए खेत स्तर के विकल्प",

      voice_modal_title: "🎙️ एग्री-एआई बहुभाषी वॉयस असिस्टेंट",
      voice_listening: "🎙️ सुन रहा हूँ... अपनी भाषा में फसल अवशेष बताएं (जैसे: 1000 किलो धान की पराली गुंटूर)।",
      voice_btn_done: "⏹️ बोलना समाप्त",

      chat_title: "🤖 एग्री-बॉट – AI सलाहकार",
      chat_subtitle: "ऑनलाइन • बहुभाषी (हिंदी/तेलुगु/अंग्रेजी)",
      chat_placeholder: "हिंदी में पूछें (जैसे: 1000 किलो पराली का क्या करें?)...",
      chat_welcome: "नमस्ते! मैं आपका एग्री-एआई सलाहकार हूँ। फसल अवशेषों की बिक्री, 2G इथेनॉल, बायोगैस या कम्पोस्टिंग के बारे में कुछ भी पूछें।"
    }
  },

  residueTranslations: {
    'rice-straw': { en: 'Rice straw', te: 'వరి గడ్డి', hi: 'धान की पराली' },
    'rice-husk': { en: 'Rice husk', te: 'వరి పొట్టు / తవుడు', hi: 'धान का भूसा / छिलका' },
    'maize-stalk': { en: 'Maize stalk', te: 'మొక్కజొన్న కట్టెలు', hi: 'मक्के का डंठल' },
    'maize-cob': { en: 'Maize cob', te: 'మొక్కజొన్న కంకి గుజ్జు', hi: 'मक्के का भुट्टा / कोर' },
    'sugarcane-bagasse': { en: 'Sugarcane bagasse', te: 'చెరకు పిప్పి (బగాస్)', hi: 'गन्ने की खोई (बगास)' },
    'cotton-residue': { en: 'Cotton residue', te: 'పత్తి కట్టెలు', hi: 'कपास की लकड़ी' },
    'groundnut-shell': { en: 'Groundnut shell', te: 'వేరుశనగ పొట్టు', hi: 'मूंगफली का छिलका' },
    'coconut-residue': { en: 'Coconut residue', te: 'కొబ్బరి చిప్పలు / పీచు', hi: 'नारियल का खोल / जटा' }
  },

  conditionTranslations: {
    'Dry (<15%)': { en: 'Dry (<15% moisture)', te: 'ఎండినది (<15% తేమ - ఇంధనానికి ఉత్తమం)', hi: 'सूखा (<15% नमी - ईंधन के लिए सर्वोत्तम)' },
    'Semi-dry (15-25%)': { en: 'Semi-dry (15-25%)', te: 'పాక్షికంగా ఎండినది (15-25% తేమ)', hi: 'अर्ध-सूखा (15-25% नमी)' },
    'Wet (>30%)': { en: 'Wet (>30% moisture)', te: 'తడి వ్యర్థం (>30% తేమ - కంపోస్ట్‌కు ఉత్తమం)', hi: 'गीला (>30% नमी - खाद के लिए सर्वोत्तम)' }
  },

  setLanguage(lang = 'en') {
    if (!this.translations[lang]) lang = 'en';
    this.currentLang = lang;
    localStorage.setItem('agriai_lang', lang);

    // Apply translations to all DOM elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[lang][key]) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.placeholder = this.translations[lang][key];
        } else {
          el.textContent = this.translations[lang][key];
        }
      }
    });

    // Update language select dropdowns
    const langSelects = document.querySelectorAll('.lang-select');
    langSelects.forEach(dd => dd.value = lang);

    // Re-render active view if recommendation or alternatives are active
    if (window.App && window.App.state) {
      if (window.App.state.currentAnalysis) {
        window.App.renderRecommendation(window.App.state.currentAnalysis);
      }
      if (window.App.populateWasteTypeDropdowns) {
        window.App.populateWasteTypeDropdowns();
      }
      if (window.App.recalculateAlternativeYields) {
        window.App.recalculateAlternativeYields();
      }
    }

    const langNames = { en: 'English', te: 'తెలుగు (Telugu)', hi: 'हिन्दी (Hindi)' };
    if (window.API && window.API.showToast) {
      window.API.showToast(`Language: ${langNames[lang]}`, 'info');
    }
  },

  getResidueName(id) {
    const item = this.residueTranslations[id];
    return item ? (item[this.currentLang] || item.en) : id;
  },

  getText(key) {
    const dict = this.translations[this.currentLang] || this.translations['en'];
    return dict[key] || this.translations['en'][key] || key;
  },

  init() {
    const saved = localStorage.getItem('agriai_lang') || 'en';
    this.setLanguage(saved);
  }
};

window.I18N = I18N;
