/**
 * Comprehensive Multilingual Voice Assistant & Text-to-Speech (TTS) Module
 * Specially optimized for Indian smallholder farmers.
 * Supports: Telugu (te-IN), Hindi (hi-IN), English (en-IN)
 */

const VoiceAssistant = {
  recognition: null,
  isListening: false,
  targetFieldId: null,
  synth: window.speechSynthesis || null,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateVoiceModalUI(true);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Spoken Transcript:', transcript);
        this.handleSpokenQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.stopListening();
        if (window.API && window.API.showToast) {
          const currentLang = window.I18N ? window.I18N.currentLang : 'en';
          const msg = currentLang === 'te'
            ? 'వాయిస్ ఇన్పుట్ పూర్తయింది. మీరు టైప్ చేయవచ్చు లేదా చాట్‌బాట్ ఉపయోగించవచ్చు.'
            : (currentLang === 'hi' ? 'वॉयस इनपुट समाप्त हुआ। आप चैट में भी लिख सकते हैं।' : 'Voice input ended. You can also type in the chat!');
          window.API.showToast(msg, 'info');
        }
      };

      this.recognition.onend = () => {
        this.stopListening();
      };
    }
  },

  /**
   * Start listening for voice input
   * @param {string|null} fieldId Optional specific input field to populate
   */
  startListening(fieldId = null) {
    this.targetFieldId = fieldId;
    const modal = document.getElementById('voice-assistant-modal');
    if (modal) modal.classList.add('active');

    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const langMap = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

    // Update modal language badge
    const badge = document.getElementById('voice-modal-lang-badge');
    if (badge) {
      const names = { en: 'English (India)', te: 'తెలుగు (Telugu)', hi: 'हिन्दी (Hindi)' };
      badge.textContent = names[currentLang] || 'English';
    }

    if (this.recognition) {
      try {
        this.recognition.lang = langMap[currentLang] || 'en-IN';
        this.recognition.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    } else {
      // Browser simulated fallback
      const promptMsg = currentLang === 'te' 
        ? "మీ పంట వ్యర్థం మరియు పరిమాణం చెప్పండి (ఉదా: 1000 కేజీల వరి గడ్డి గుంటూరు):"
        : (currentLang === 'hi' ? "फसल अवशेष और मात्रा बताएं (उदा: 1000 किलो पराली गुंटूर):" : "Speak or type your biomass query (e.g. 1000kg rice straw Guntur):");
      
      const fallbackQuery = prompt(promptMsg, "1000 kg rice straw Guntur");
      if (fallbackQuery) {
        this.handleSpokenQuery(fallbackQuery);
      }
      this.stopListening();
    }
  },

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    const modal = document.getElementById('voice-assistant-modal');
    if (modal) modal.classList.remove('active');
  },

  updateVoiceModalUI(listening) {
    const statusText = document.getElementById('voice-modal-status');
    const waveBox = document.getElementById('voice-wave-anim');
    if (statusText) {
      statusText.textContent = listening 
        ? (window.I18N ? window.I18N.getText('voice_listening') : 'Listening...')
        : 'Microphone Idle';
    }
    if (waveBox) {
      waveBox.style.display = listening ? 'flex' : 'none';
    }
  },

  /**
   * Parse farmer speech in Telugu, Hindi, or English and trigger actions
   */
  handleSpokenQuery(transcript) {
    this.stopListening();
    const query = transcript.toLowerCase();
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';

    if (window.API && window.API.showToast) {
      window.API.showToast(`🎤 ${transcript}`, 'info');
    }

    // If targeted for a specific input field
    if (this.targetFieldId) {
      const field = document.getElementById(this.targetFieldId);
      if (field) {
        // Extract numbers if number input
        if (field.type === 'number') {
          const match = query.match(/\d+/);
          if (match) field.value = match[0];
        } else {
          field.value = transcript;
        }
        if (window.App && window.App.recalculateAlternativeYields) {
          window.App.recalculateAlternativeYields();
        }
        this.targetFieldId = null;
        return;
      }
    }

    // Smart Intent Parser for Farmers

    // 1. Quantity detection (e.g. 1000 kg, 500 కేజీలు, 2000 किलो)
    const qtyMatch = query.match(/(\d+)\s*(kg|kgs|kilo|kilos|కేజీ|కిలో|किलो|टन|ton|tonnes)?/i);
    let extractedQty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1000;
    if (query.includes('2 tonne') || query.includes('2 టన్ను') || query.includes('2 टन')) extractedQty = 2000;

    // 2. Crop residue detection
    let detectedResidue = 'rice-straw';
    if (query.includes('bagasse') || query.includes('చెరకు') || query.includes('बगास') || query.includes('गन्ना')) {
      detectedResidue = 'sugarcane-bagasse';
    } else if (query.includes('cotton') || query.includes('పత్తి') || query.includes('कपास')) {
      detectedResidue = 'cotton-residue';
    } else if (query.includes('maize') || query.includes('corn') || query.includes('మొక్కజొన్న') || query.includes('मक्का')) {
      detectedResidue = 'maize-stalk';
    } else if (query.includes('husk') || query.includes('పొట్టు') || query.includes('तవుడు') || query.includes('भूसा')) {
      detectedResidue = 'rice-husk';
    } else if (query.includes('groundnut') || query.includes('వేరుశనగ') || query.includes('मूंगफली')) {
      detectedResidue = 'groundnut-shell';
    } else if (query.includes('coconut') || query.includes('కొబ్బరి') || query.includes('नारियल')) {
      detectedResidue = 'coconut-residue';
    }

    // 3. Command: Demo / Direct Analysis
    if (query.includes('demo') || query.includes('డెమో') || query.includes('डेमो') || query.includes('విశ్లేష') || query.includes('analyze') || query.includes('దాఖలు') || query.includes('చూపించు') || query.includes('चलाओ') || query.includes('बताओ') || qtyMatch) {
      if (window.App) {
        const qtyEl = document.getElementById('input-quantity-kg');
        const resEl = document.getElementById('input-waste-type-override');
        if (qtyEl) qtyEl.value = extractedQty;
        if (resEl) resEl.value = detectedResidue;

        window.App.simulateSampleUpload(detectedResidue, `${I18N.getResidueName(detectedResidue)} (Voice Input)`);

        setTimeout(async () => {
          try {
            const result = await API.calculateViability({
              wasteId: detectedResidue,
              quantityKg: extractedQty,
              condition: 'Dry (<15%)',
              harvestDate: new Date().toISOString().split('T')[0],
              locationName: 'Guntur Rural, Andhra Pradesh',
              latitude: 16.3067,
              longitude: 80.4365
            });

            if (result.success) {
              window.App.state.currentAnalysis = result;
              window.App.renderRecommendation(result);
              window.App.navigate('recommendation-view');

              // Automatically speak the results aloud in the farmer's language!
              this.speakCurrentRecommendation();
            }
          } catch (e) {
            console.error('Voice analysis failed:', e);
          }
        }, 300);
        return;
      }
    }

    // 4. Command: Map View
    if (query.includes('map') || query.includes('మ్యాప్') || query.includes('నక్షా') || query.includes('नक्शा')) {
      if (window.App) {
        window.App.navigate('biomass-map-view');
        this.speakText(currentLang === 'te' ? "బయోమాస్ ప్రాంతీయ మ్యాప్ తెరుస్తున్నాను." : (currentLang === 'hi' ? "बायोमास नक्शा खोला जा रहा है।" : "Opening regional biomass map."));
        return;
      }
    }

    // 5. Command: Alternatives / Composting
    if (query.includes('compost') || query.includes('biochar') || query.includes('mushroom') || query.includes('ఎరువు') || query.includes('పుట్టగొడుగు') || query.includes('खाद') || query.includes('मशरूम')) {
      if (window.App) {
        window.App.navigate('farmer-alternatives-view');
        this.speakText(currentLang === 'te' ? "పొలంలోనే ఎరువులు మరియు పుట్టగొడుగుల పెంపకం మార్గదర్శకాలు తెరుస్తున్నాను." : (currentLang === 'hi' ? "खेत पर खाद और मशरूम उत्पादन की गाइड खोली जा रही है।" : "Opening farm-level composting and mushroom guide."));
        return;
      }
    }

    // Default: Forward to Multilingual Chatbot
    if (window.ChatbotModule) {
      window.ChatbotModule.openChat();
      window.ChatbotModule.sendMessage(transcript);
    }
  },

  /**
   * Speak text aloud using SpeechSynthesis TTS in Telugu, Hindi, or English
   */
  speakText(text = '') {
    if (!this.synth) return;

    this.synth.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const langCodes = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

    utterance.lang = langCodes[currentLang] || 'en-IN';
    utterance.rate = 0.92; // Slightly slower natural pace for farmers
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const voiceMatch = voices.find(v => v.lang.startsWith(currentLang) || v.lang.includes(currentLang));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    this.synth.speak(utterance);
  },

  /**
   * Read current recommendation aloud in the farmer's active language
   */
  speakCurrentRecommendation() {
    if (!window.App || !window.App.state || !window.App.state.currentAnalysis) {
      const currentLang = window.I18N ? window.I18N.currentLang : 'en';
      const promptText = currentLang === 'te' ? "దయచేసి ముందుగా వ్యర్థాలను విశ్లేషించండి." : (currentLang === 'hi' ? "कृपया पहले अवशेष का विश्लेषण करें।" : "Please analyze a biomass lot first.");
      this.speakText(promptText);
      return;
    }

    const res = window.App.state.currentAnalysis;
    const v = res.viability;
    const econ = res.economicBreakdown;
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const residueName = I18N.getResidueName(res.inputSummary.wasteId);

    let speech = "";
    if (currentLang === 'te') {
      if (v.status === 'GOOD') {
        speech = `${res.inputSummary.quantityKg} కేజీల ${residueName} విశ్లేషణ పూర్తయింది. సిఫార్సు: పారిశ్రామిక 2G బయో-ఇథనాల్ మార్పిడి. అంచనా వేసిన నికర రైతు లాభం రూపాయలు ${econ.estimatedNetFarmerValue}. రవాణా ఖర్చు రూపాయలు ${econ.transportationCost}. సమీప కేంద్రం గుంటూరు 2G రిఫైనరీ.`;
      } else {
        speech = `${res.inputSummary.quantityKg} కేజీల ${residueName} విశ్లేషణ పూర్తయింది. దూరభారం లేదా తేమ వలన ఫ్యాక్టరీకి పంపడం లాభదాయకం కాదు. పొలంలోనే వర్మీ కంపోస్ట్ లేదా పుట్టగొడుగుల పెంపకం ద్వారా సుమారు మూడు వేల ఐదు వందల రూపాయల ఎరువుల ఖర్చు ఆదా అవుతుంది.`;
      }
    } else if (currentLang === 'hi') {
      if (v.status === 'GOOD') {
        speech = `${res.inputSummary.quantityKg} किलो ${residueName} का विश्लेषण पूरा हुआ। सिफारिश: 2G बायो-इथेनॉल उत्पादन। किसान का शुद्ध लाभ ₹${econ.estimatedNetFarmerValue} है। मालभाड़ा ₹${econ.transportationCost} है। नजदीकी प्लांट गुंटूर बायो-रिफाइनरी है।`;
      } else {
        speech = `${res.inputSummary.quantityKg} किलो ${residueName} का विश्लेषण पूरा हुआ। अधिक नमी या दूरी के कारण प्लांट भेजना नुकसानदेह है। खेत पर ही वर्मी कम्पोस्ट या बायोचार बनाकर ₹3,500 प्रति एकड़ खाद बचाएं।`;
      }
    } else {
      speech = `Analysis complete for ${res.inputSummary.quantityKg} kilograms of ${residueName}. Recommendation: ${v.recommendationTitle}. Estimated net farmer return is ₹${econ.estimatedNetFarmerValue}. Transport cost is ₹${econ.transportationCost}. Nearest processing unit is ${res.nearestFacility ? res.nearestFacility.name : 'Guntur Bio-Refinery'}.`;
    }

    this.speakText(speech);
  }
};

window.VoiceAssistant = VoiceAssistant;
