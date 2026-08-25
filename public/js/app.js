/**
 * AgriAI – Waste2Fuel Main Application Controller (SIH 2026 Enhanced Prototype)
 * Farmer-centric, Multilingual, 6-Step Stepper, Video Library, Ranked Decisions, Automated Demo
 */

const App = {
  state: {
    currentView: 'landing-view',
    currentStepperStep: 1,
    wasteTypes: [],
    facilities: [],
    alternatives: [],
    videos: [],
    farms: [],
    collections: [],
    currentAnalysis: null,
    selectedImagePayload: null,
    activeAlternativeDetail: null
  },

  async init() {
    console.log('🌱 Initializing AgriAI – Waste2Fuel Farmer Assistant...');
    this.setupEventListeners();
    await this.loadInitialData();
    this.handleRouting();
  },

  async loadInitialData() {
    try {
      const [wasteRes, altRes, facRes, vidRes] = await Promise.all([
        API.getWasteTypes(),
        API.getAlternatives(),
        API.getFacilities(),
        API.getVideos()
      ]);

      this.state.wasteTypes = wasteRes.data || [];
      this.state.alternatives = altRes.data || [];
      this.state.facilities = facRes.data || [];
      this.state.videos = vidRes.data || [];

      this.populateWasteTypeDropdowns();
      this.renderAlternativesList(this.state.alternatives);
      this.renderFacilitiesList(this.state.facilities);
      this.renderVideoLibrary();
    } catch (err) {
      console.error('Failed to load initial metadata:', err);
    }
  },

  setupEventListeners() {
    // Navigation Links
    document.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-target-view');
        this.navigate(target);
      });
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    }

    // SIH Interactive Demo Trigger
    document.querySelectorAll('.trigger-sih-demo').forEach(btn => {
      btn.addEventListener('click', () => this.startSIHInteractiveDemo());
    });

    // 1-Click Demo Scenario (Guntur)
    document.querySelectorAll('.trigger-demo-mode').forEach(btn => {
      btn.addEventListener('click', () => this.runGunturDemoScenario());
    });

    // Stepper Form Submit
    const analysisForm = document.getElementById('waste-analysis-form');
    if (analysisForm) {
      analysisForm.addEventListener('submit', (e) => this.handleAnalysisSubmit(e));
    }

    // Dropzone & Camera Setup
    this.setupDropzone();

    // Sample Image Presets
    document.querySelectorAll('.btn-sample-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const wasteKey = btn.getAttribute('data-waste-key');
        const wasteName = btn.textContent.trim();
        this.simulateSampleUpload(wasteKey, wasteName);
      });
    });

    // Camera Simulator Button
    const btnCamera = document.getElementById('btn-open-camera');
    if (btnCamera) {
      btnCamera.addEventListener('click', () => this.openCameraSimulator());
    }

    // Facility Filter
    const facFilter = document.getElementById('facility-waste-filter');
    if (facFilter) {
      facFilter.addEventListener('change', () => this.filterFacilities());
    }

    // Alternative Yield Calculator Input
    const calcInput = document.getElementById('calc-biomass-input');
    if (calcInput) {
      calcInput.addEventListener('input', () => this.recalculateAlternativeYields());
    }

    // Farm Registration Form
    const farmForm = document.getElementById('farm-register-form');
    if (farmForm) {
      farmForm.addEventListener('submit', (e) => this.handleFarmRegister(e));
    }

    // Reset Demo Data Button
    const btnReset = document.getElementById('btn-reset-demo-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetDemoState());
    }
  },

  navigate(viewId) {
    if (!document.getElementById(viewId)) return;

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-target-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const targetSection = document.getElementById(viewId);
    if (targetSection) {
      targetSection.classList.add('active');
      this.state.currentView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (viewId === 'biomass-map-view') {
        setTimeout(() => MapModule.init('biomass-map'), 100);
      } else if (viewId === 'admin-dashboard-view' || viewId === 'farmer-dashboard-view') {
        this.loadDashboardView();
      } else if (viewId === 'farmer-alternatives-view') {
        this.recalculateAlternativeYields();
        this.renderVideoLibrary();
      } else if (viewId === 'biomass-collection-view') {
        this.loadCollectionsView();
        setTimeout(() => {
          if (window.ChartsModule) window.ChartsModule.renderLogisticsSavings();
        }, 50);
      }
    }

    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.remove('open');
  },

  handleRouting() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      this.navigate(hash);
    } else {
      this.navigate('landing-view');
    }
  },

  // 6-Step Stepper Management
  goToStepperStep(stepNumber) {
    this.state.currentStepperStep = stepNumber;

    // Update Header indicators
    for (let i = 1; i <= 6; i++) {
      const dot = document.getElementById(`step-dot-${i}`);
      const container = document.getElementById(`step-card-${i}`);
      if (dot) {
        dot.classList.remove('active', 'completed');
        if (i === stepNumber) dot.classList.add('active');
        else if (i < stepNumber) dot.classList.add('completed');
      }
      if (container) {
        container.classList.remove('active');
        if (i === stepNumber) container.classList.add('active');
      }
    }
  },

  nextStepperStep() {
    if (this.state.currentStepperStep < 6) {
      this.goToStepperStep(this.state.currentStepperStep + 1);
    }
  },

  prevStepperStep() {
    if (this.state.currentStepperStep > 1) {
      this.goToStepperStep(this.state.currentStepperStep - 1);
    }
  },

  selectResidueChoice(residueId, element) {
    document.querySelectorAll('.choice-residue').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const dd = document.getElementById('input-waste-type-override');
    if (dd) dd.value = residueId;

    this.simulateSampleUpload(residueId, I18N.getResidueName(residueId));
  },

  selectQuantityPreset(qty, element) {
    document.querySelectorAll('.choice-qty').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const input = document.getElementById('input-quantity-kg');
    if (input) input.value = qty;
  },

  selectConditionPreset(cond, element) {
    document.querySelectorAll('.choice-cond').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const dd = document.getElementById('input-condition');
    if (dd) dd.value = cond;
  },

  selectHarvestPreset(daysAgo, element) {
    document.querySelectorAll('.choice-harvest').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const dateInput = document.getElementById('input-harvest-date');
    if (dateInput) {
      const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      dateInput.value = d.toISOString().split('T')[0];
    }
  },

  selectLocationPreset(name, lat, lon, element) {
    document.querySelectorAll('.choice-loc').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');

    const locInput = document.getElementById('input-location-name');
    const latInput = document.getElementById('input-latitude');
    const lonInput = document.getElementById('input-longitude');

    if (locInput) locInput.value = name;
    if (latInput) latInput.value = lat;
    if (lonInput) lonInput.value = lon;
  },

  populateWasteTypeDropdowns() {
    const dropdowns = [
      document.getElementById('input-waste-type-override'),
      document.getElementById('facility-waste-filter'),
      document.getElementById('reg-farm-waste-type')
    ];

    dropdowns.forEach(dd => {
      if (!dd) return;
      const currentVal = dd.value;
      const firstOpt = dd.querySelector('option');
      dd.innerHTML = '';
      if (firstOpt) dd.appendChild(firstOpt);

      this.state.wasteTypes.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        const localizedName = window.I18N ? window.I18N.getResidueName(w.id) : w.name;
        opt.textContent = `${localizedName} (${w.category})`;
        dd.appendChild(opt);
      });

      if (currentVal) dd.value = currentVal;
    });
  },

  setupDropzone() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('waste-file-input');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processSelectedFile(file);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) this.processSelectedFile(file);
    });
  },

  async processSelectedFile(file) {
    const previewContainer = document.getElementById('ai-preview-box');
    const previewImg = document.getElementById('ai-preview-img');
    const detectedNameEl = document.getElementById('ai-detected-name');
    const confidenceEl = document.getElementById('ai-confidence-val');
    const confidenceFill = document.getElementById('ai-confidence-fill');
    const traitsEl = document.getElementById('ai-traits-text');
    const overrideDd = document.getElementById('input-waste-type-override');

    if (previewContainer) previewContainer.style.display = 'block';
    if (detectedNameEl) detectedNameEl.textContent = 'AI is analyzing photo...';

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (previewImg) previewImg.src = e.target.result;

      try {
        const aiRes = await API.analyzeBiomassImage({
          filename: file.name,
          mimeType: file.type
        });

        if (aiRes.success) {
          const waste = aiRes.identifiedWaste;
          const locName = I18N.getResidueName(waste.id);
          if (detectedNameEl) detectedNameEl.innerHTML = `<strong>${locName}</strong> <span class="proto-badge">Confidence: ${aiRes.confidenceScore}%</span>`;
          if (confidenceEl) confidenceEl.textContent = `${aiRes.confidenceScore}%`;
          if (confidenceFill) confidenceFill.style.width = `${aiRes.confidenceScore}%`;
          if (traitsEl) traitsEl.textContent = waste.simple_desc || aiRes.extractedFeatures.colorProfile;
          if (overrideDd) overrideDd.value = waste.id;

          API.showToast(`AI Identified: ${locName} (${aiRes.confidenceScore}%)`, 'success');
        }
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    };
    reader.readAsDataURL(file);
  },

  simulateSampleUpload(wasteKey, wasteName) {
    const previewContainer = document.getElementById('ai-preview-box');
    const previewImg = document.getElementById('ai-preview-img');
    const detectedNameEl = document.getElementById('ai-detected-name');
    const confidenceEl = document.getElementById('ai-confidence-val');
    const confidenceFill = document.getElementById('ai-confidence-fill');
    const traitsEl = document.getElementById('ai-traits-text');
    const overrideDd = document.getElementById('input-waste-type-override');

    if (previewContainer) previewContainer.style.display = 'block';

    const matchedWaste = this.state.wasteTypes.find(w => w.id === wasteKey) || this.state.wasteTypes[0];
    const conf = (94.0 + Math.random() * 4.0).toFixed(1);
    const locName = I18N.getResidueName(matchedWaste.id);

    if (previewImg) {
      previewImg.src = `https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=60`;
    }

    if (detectedNameEl) detectedNameEl.innerHTML = `<strong>${locName}</strong> <span class="proto-badge">Confidence: ${conf}%</span>`;
    if (confidenceEl) confidenceEl.textContent = `${conf}%`;
    if (confidenceFill) confidenceFill.style.width = `${conf}%`;
    if (traitsEl) traitsEl.textContent = matchedWaste.simple_desc || matchedWaste.visualCharacteristics;
    if (overrideDd) overrideDd.value = matchedWaste.id;

    API.showToast(`Selected: ${locName}`, 'info');
  },

  openCameraSimulator() {
    const modal = document.getElementById('camera-modal');
    if (!modal) return;
    modal.classList.add('active');

    const btnSnap = document.getElementById('btn-snap-photo');
    if (btnSnap) {
      btnSnap.onclick = () => {
        modal.classList.remove('active');
        this.simulateSampleUpload('rice-straw', 'Rice straw (Camera Snapshot)');
        API.showToast('Photo captured! AI analysis ready.', 'success');
      };
    }
  },

  async handleAnalysisSubmit(e) {
    if (e) e.preventDefault();

    const overrideDd = document.getElementById('input-waste-type-override');
    const wasteId = overrideDd ? overrideDd.value : 'rice-straw';
    const quantityKg = parseFloat(document.getElementById('input-quantity-kg').value) || 1000;
    const condition = document.getElementById('input-condition').value;
    const harvestDate = document.getElementById('input-harvest-date').value;
    const locationName = document.getElementById('input-location-name').value;
    const lat = parseFloat(document.getElementById('input-latitude').value) || 16.3067;
    const lon = parseFloat(document.getElementById('input-longitude').value) || 80.4365;

    const payload = {
      wasteId,
      quantityKg,
      condition,
      harvestDate,
      locationName,
      latitude: lat,
      longitude: lon
    };

    try {
      const result = await API.calculateViability(payload);
      if (result.success) {
        this.state.currentAnalysis = result;
        this.renderRecommendation(result);
        this.navigate('recommendation-view');
        API.showToast('Decision calculated successfully!', 'success');
      }
    } catch (err) {
      console.error('Viability calculation failed:', err);
    }
  },

  renderRecommendation(data) {
    const d = data.decision;
    const econ = data.economicBreakdown;
    const energy = data.energyPotential;
    const input = data.inputSummary;
    const fac = data.nearestFacility;

    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const localizedResidue = window.I18N ? window.I18N.getResidueName(input.wasteId) : input.wasteName;

    // Status Banner Styling
    const bannerEl = document.getElementById('rec-status-banner');
    const statusPill = document.getElementById('rec-status-pill');
    const titleEl = document.getElementById('rec-title');
    const explanationEl = document.getElementById('rec-explanation');

    if (bannerEl) {
      bannerEl.className = 'viability-banner';
      if (d.status === 'GOOD') bannerEl.classList.add('status-good');
      else if (d.status === 'POSSIBLE') bannerEl.classList.add('status-moderate');
      else bannerEl.classList.add('status-not-viable');
    }

    if (statusPill) statusPill.textContent = d.statusBadge || d.status;
    if (titleEl) titleEl.textContent = d.bestOptionTitle;
    if (explanationEl) explanationEl.textContent = d.bestOptionWhy;

    // Summary Lot Details
    const lotDetailsEl = document.getElementById('rec-lot-details');
    if (lotDetailsEl) {
      const labels = currentLang === 'te' 
        ? { res: 'వ్యర్థ రకం', qty: 'పరిమాణం', cond: 'పరిస్థితి', loc: 'స్థలం' }
        : (currentLang === 'hi' ? { res: 'अवशेष', qty: 'मात्रा', cond: 'स्थिति', loc: 'स्थान' } : { res: 'Residue', qty: 'Quantity', cond: 'Condition', loc: 'Location' });

      lotDetailsEl.innerHTML = `
        <div style="font-size: 0.95rem;">
          <p><strong>${labels.res}:</strong> ${localizedResidue} (${input.category})</p>
          <p><strong>${labels.qty}:</strong> ${input.quantityKg.toLocaleString()} kg</p>
          <p><strong>${labels.cond}:</strong> ${input.condition}</p>
          <p><strong>${labels.loc}:</strong> 📍 ${input.location}</p>
        </div>
      `;
    }

    // Ranked Options (🥇, 🥈, 🥉)
    const rankedBox = document.getElementById('rec-ranked-options-box');
    if (rankedBox && d.rankedOptions) {
      rankedBox.innerHTML = '';
      d.rankedOptions.forEach((opt, idx) => {
        const card = document.createElement('div');
        card.className = `ranked-card ${idx === 0 ? 'best-rank' : ''}`;
        card.innerHTML = `
          <div class="rank-badge">${opt.rank}</div>
          <div style="flex: 1;">
            <h4 style="font-size: 1.05rem; margin: 0 0 4px 0; color: #0f172a;">${opt.title}</h4>
            <p style="font-size: 0.88rem; color: #475569; margin: 0 0 6px 0;">${opt.why}</p>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary);">➔ Action: ${opt.action}</span>
          </div>
        `;
        rankedBox.appendChild(card);
      });
    }

    // Energy Outputs
    const energyEl = document.getElementById('rec-energy-outputs');
    if (energyEl) {
      energyEl.innerHTML = `
        <div class="energy-card">
          <div class="energy-card-val">${energy.totalEnergyMJ.toLocaleString()}</div>
          <div class="energy-card-unit">Indicative Energy (MJ)</div>
        </div>
        <div class="energy-card">
          <div class="energy-card-val">${energy.ethanolEquivalentLiters.toLocaleString()} L</div>
          <div class="energy-card-unit">2G Ethanol Equiv.</div>
        </div>
        <div class="energy-card">
          <div class="energy-card-val">${energy.cbgEquivalentM3.toLocaleString()} m³</div>
          <div class="energy-card-unit">Biogas / CBG</div>
        </div>
        <div class="energy-card">
          <div class="energy-card-val">${energy.electricityPotentialKwh.toLocaleString()} kWh</div>
          <div class="energy-card-unit">Clean Electricity</div>
        </div>
      `;
    }

    // Environmental Impact
    const envEl = document.getElementById('rec-environmental-impact');
    if (envEl && data.environmentalImpact) {
      const env = data.environmentalImpact;
      envEl.innerHTML = `
        <div class="energy-grid" style="margin-top: 0.5rem;">
          <div class="energy-card">
            <div class="energy-card-val" style="color: #16a34a;">${env.co2AvoidedKg.toLocaleString()} kg</div>
            <div class="energy-card-unit">CO₂ Avoided (No Burn)</div>
          </div>
          <div class="energy-card">
            <div class="energy-card-val" style="color: #0284c7;">${env.pm25SavedGrams.toLocaleString()} g</div>
            <div class="energy-card-unit">PM2.5 Smog Prevented</div>
          </div>
          <div class="energy-card">
            <div class="energy-card-val" style="color: #d97706;">${env.crudeOilOffsetLiters.toLocaleString()} L</div>
            <div class="energy-card-unit">Crude Oil Replaced</div>
          </div>
          <div class="energy-card">
            <div class="energy-card-val" style="color: #15803d;">🌳 ${env.treesEquivalentAnnual}</div>
            <div class="energy-card-unit">Trees Annual Equiv.</div>
          </div>
        </div>
      `;
    }

    // Transparent Economic Math Breakdown
    const mathEl = document.getElementById('rec-math-breakdown');
    if (mathEl) {
      const rowLabels = currentLang === 'te' ? {
        gross: `స్థూల వ్యర్థాల విలువ (${input.quantityKg} kg @ ₹${econ.unitPricePerKg}/kg)`,
        trans: `అంచనా వేసిన రవాణా ఖర్చు (${econ.distanceToFacilityKm} km)`,
        hand: `బేలింగ్, లోడింగ్ మరియు నిర్వహణ రుసుము`,
        net: `అంచనా వేసిన నికర రైతు లాభం:`
      } : (currentLang === 'hi' ? {
        gross: `बायोमास का कुल मूल्य (${input.quantityKg} kg @ ₹${econ.unitPricePerKg}/kg)`,
        trans: `अनुमानित मालभाड़ा एवं परिवहन लागत (${econ.distanceToFacilityKm} km)`,
        hand: `लोडिंग, बेलिंग और हैंडलिंग शुल्क`,
        net: `अनुमानित शुद्ध किसान लाभ:`
      } : {
        gross: `Gross Biomass Value (${input.quantityKg} kg @ ₹${econ.unitPricePerKg}/kg)`,
        trans: `Estimated Logistics & Transport (${econ.distanceToFacilityKm} km)`,
        hand: `Baling, Loading & Handling Fee`,
        net: `Estimated Net Farmer Return:`
      });

      mathEl.innerHTML = `
        <div class="math-row">
          <span>${rowLabels.gross}</span>
          <span style="font-weight: 700; color: #15803d;">+ ₹${econ.grossBiomassValue.toLocaleString()}</span>
        </div>
        <div class="math-row">
          <span>${rowLabels.trans}</span>
          <span style="font-weight: 700; color: #dc2626;">- ₹${econ.transportationCost.toLocaleString()}</span>
        </div>
        <div class="math-row">
          <span>${rowLabels.hand}</span>
          <span style="font-weight: 700; color: #dc2626;">- ₹${econ.collectionHandlingCost.toLocaleString()}</span>
        </div>
        <div class="math-row total-row">
          <span>${rowLabels.net}</span>
          <span>₹${econ.estimatedNetFarmerValue.toLocaleString()} (₹${econ.netValuePerKg}/kg)</span>
        </div>
        <p class="form-help" style="margin-top: 8px; font-style: italic;">
          * ${econ.disclaimer}
        </p>
      `;
    }

    // Nearest Facility Box
    const facBoxEl = document.getElementById('rec-nearest-facility-box');
    if (facBoxEl) {
      if (fac) {
        facBoxEl.innerHTML = `
          <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-light);">
            <span class="proto-badge" style="background:#fef3c7; color:#92400e; margin-bottom:4px;">DEMO FACILITY DATA</span>
            <h4 style="font-size: 1.1rem; margin: 6px 0 2px 0;">${fac.name}</h4>
            <p style="color: #64748b; font-size: 0.88rem;">📍 ${fac.location} (${fac.distanceKm} km away)</p>
            <p style="font-size: 0.88rem; margin: 4px 0;"><strong>Min Required Lot:</strong> ${fac.minimumQuantity} kg</p>
            <p style="font-size: 0.88rem;"><strong>Contact Desk:</strong> ${fac.phone}</p>
          </div>
        `;
      } else {
        facBoxEl.innerHTML = `<p style="color: #64748b;">No suitable facility was found in the current demo database within radius. On-farm alternatives recommended below.</p>`;
      }
    }

    // Fallback Alternatives Cards
    this.renderFallbackAlternatives(data.onFarmAlternatives || []);
  },

  renderFallbackAlternatives(altList) {
    const container = document.getElementById('rec-fallback-cards');
    if (!container) return;

    container.innerHTML = '';
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';

    altList.forEach(alt => {
      const name = currentLang === 'te' ? (alt.name_te || alt.name_en) : (currentLang === 'hi' ? (alt.name_hi || alt.name_en) : alt.name_en);
      const tagline = currentLang === 'te' ? (alt.tagline_te || alt.tagline_en) : (currentLang === 'hi' ? (alt.tagline_hi || alt.tagline_en) : alt.tagline_en);

      const card = document.createElement('div');
      card.className = 'uvp-card outcome-alt';
      card.innerHTML = `
        <span class="uvp-badge">${alt.icon || '🌱'} ${alt.approxTime}</span>
        <h3>${name}</h3>
        <p>${tagline}</p>
        <div style="font-size: 0.85rem; color: #15803d; margin-bottom: 1rem; font-weight:700;">
          💰 ${alt.possibleBenefit}
        </div>
        <button class="btn btn-outline-primary btn-sm" onclick="App.openAlternativeDetail('${alt.id}')">
          📖 View Step-by-Step Guide →
        </button>
      `;
      container.appendChild(card);
    });
  },

  openAlternativeDetail(altId) {
    const alt = this.state.alternatives.find(a => a.id === altId) || this.state.alternatives[0];
    this.state.activeAlternativeDetail = alt;

    const modal = document.getElementById('alternative-detail-modal');
    if (!modal) return;

    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const name = currentLang === 'te' ? (alt.name_te || alt.name_en) : (currentLang === 'hi' ? (alt.name_hi || alt.name_en) : alt.name_en);
    const why = currentLang === 'te' ? (alt.whyShouldIDoThis_te || alt.whyShouldIDoThis_en) : (currentLang === 'hi' ? (alt.whyShouldIDoThis_hi || alt.whyShouldIDoThis_en) : alt.whyShouldIDoThis_en);
    const who = currentLang === 'te' ? (alt.whoCanDoIt_te || alt.whoCanDoIt_en) : (currentLang === 'hi' ? (alt.whoCanDoIt_hi || alt.whoCanDoIt_en) : alt.whoCanDoIt_en);

    const materials = currentLang === 'te' ? (alt.materialsRequired_te || alt.materialsRequired_en) : (currentLang === 'hi' ? (alt.materialsRequired_hi || alt.materialsRequired_en) : alt.materialsRequired_en);
    const steps = currentLang === 'te' ? (alt.steps_te || alt.steps_en) : (currentLang === 'hi' ? (alt.steps_hi || alt.steps_en) : alt.steps_en);

    document.getElementById('alt-modal-title').textContent = `${alt.icon || '🌱'} ${name}`;
    document.getElementById('alt-modal-why').textContent = why;
    document.getElementById('alt-modal-time').textContent = alt.approxTime;
    document.getElementById('alt-modal-benefit').textContent = alt.possibleBenefit;
    document.getElementById('alt-modal-who').textContent = who;
    document.getElementById('alt-modal-safety').textContent = alt.safety;
    document.getElementById('alt-modal-source').textContent = `${alt.sourceOrg} (Verified Source)`;

    const matList = document.getElementById('alt-modal-materials');
    if (matList) {
      matList.innerHTML = materials.map(m => `<li>• ${m}</li>`).join('');
    }

    const stepList = document.getElementById('alt-modal-steps');
    if (stepList) {
      stepList.innerHTML = steps.map(s => `
        <li class="step-guide-item">
          <div class="step-guide-num">${s.step}</div>
          <div>
            <strong>${s.title}:</strong>
            <span style="color: #475569;"> ${s.desc}</span>
          </div>
        </li>
      `).join('');
    }

    modal.classList.add('active');
  },

  renderAlternativesList(alts) {
    const container = document.getElementById('alternatives-cards-grid');
    if (!container) return;

    container.innerHTML = '';
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';

    alts.forEach(alt => {
      const name = currentLang === 'te' ? (alt.name_te || alt.name_en) : (currentLang === 'hi' ? (alt.name_hi || alt.name_en) : alt.name_en);
      const tagline = currentLang === 'te' ? (alt.tagline_te || alt.tagline_en) : (currentLang === 'hi' ? (alt.tagline_hi || alt.tagline_en) : alt.tagline_en);

      const card = document.createElement('div');
      card.className = 'uvp-card outcome-alt';
      card.innerHTML = `
        <span class="uvp-badge">${alt.icon || '🌱'} ${alt.approxTime}</span>
        <h3>${name}</h3>
        <p>${tagline}</p>
        <div style="font-size: 0.85rem; color: #15803d; margin-bottom: 1rem; font-weight:700;">
          💰 ${alt.possibleBenefit}
        </div>
        <button class="btn btn-outline-primary btn-sm" onclick="App.openAlternativeDetail('${alt.id}')">
          📖 Step-by-Step Guide →
        </button>
      `;
      container.appendChild(card);
    });
  },

  renderVideoLibrary() {
    const container = document.getElementById('video-cards-container');
    const alertBox = document.getElementById('video-language-alert');
    if (!container) return;

    container.innerHTML = '';
    const currentLang = window.I18N ? window.I18N.currentLang : 'en';

    // Check language availability
    let videos = this.state.videos.filter(v => v.language === currentLang);
    if (videos.length === 0) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <span>⚠️ <strong>${currentLang === 'te' ? 'తెలుగు వీడియోలు త్వరలో జోడించబడతాయి.' : 'हिंदी वीडियो जल्द जोड़े जाएंगे।'}</strong> Showing verified ICAR tutorials in available languages:</span>
          <div style="margin-top:6px; display:flex; gap:6px;">
            <button class="btn btn-primary btn-sm" onclick="App.filterVideosByLang('te')">Watch Telugu</button>
            <button class="btn btn-secondary btn-sm" onclick="App.filterVideosByLang('hi')">Watch Hindi</button>
            <button class="btn btn-outline-primary btn-sm" onclick="App.filterVideosByLang('en')">Watch English</button>
          </div>
        `;
      }
      videos = this.state.videos;
    } else {
      if (alertBox) alertBox.style.display = 'none';
    }

    videos.forEach(v => {
      const title = currentLang === 'te' ? v.title_te : (currentLang === 'hi' ? v.title_hi : v.title_en);
      const desc = currentLang === 'te' ? v.description_te : (currentLang === 'hi' ? v.description_hi : v.description_en);

      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb-wrap" onclick="App.playVideoModal('${v.id}')">
          <img src="${v.thumbnail}" class="video-thumb-img" alt="${title}">
          <div class="video-play-btn">▶</div>
          <div class="video-duration">${v.duration}</div>
        </div>
        <div class="video-body">
          <span class="video-source-tag">✅ ${v.source}</span>
          <h4 style="font-size: 1.05rem; margin: 4px 0 6px 0; color: #0f172a;">${title}</h4>
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; flex:1;">${desc}</p>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="App.playVideoModal('${v.id}')">▶ Watch Video</button>
            <button class="btn btn-outline-primary btn-sm" onclick="App.openAlternativeDetail('${v.alternative}')">📋 Guide</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  filterVideosByLang(lang) {
    const container = document.getElementById('video-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const filtered = this.state.videos.filter(v => v.language === lang);
    const videosToRender = filtered.length > 0 ? filtered : this.state.videos;

    videosToRender.forEach(v => {
      const title = lang === 'te' ? v.title_te : (lang === 'hi' ? v.title_hi : v.title_en);
      const desc = lang === 'te' ? v.description_te : (lang === 'hi' ? v.description_hi : v.description_en);

      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb-wrap" onclick="App.playVideoModal('${v.id}')">
          <img src="${v.thumbnail}" class="video-thumb-img" alt="${title}">
          <div class="video-play-btn">▶</div>
          <div class="video-duration">${v.duration}</div>
        </div>
        <div class="video-body">
          <span class="video-source-tag">✅ ${v.source}</span>
          <h4 style="font-size: 1.05rem; margin: 4px 0 6px 0;">${title}</h4>
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">${desc}</p>
          <button class="btn btn-primary btn-sm" onclick="App.playVideoModal('${v.id}')">▶ Watch Video</button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  playVideoModal(videoId) {
    const video = this.state.videos.find(v => v.id === videoId) || this.state.videos[0];
    const modal = document.getElementById('video-player-modal');
    if (!modal) return;

    const currentLang = window.I18N ? window.I18N.currentLang : 'en';
    const title = currentLang === 'te' ? video.title_te : (currentLang === 'hi' ? video.title_hi : video.title_en);

    document.getElementById('video-modal-title').textContent = title;
    document.getElementById('video-modal-source').textContent = `Organization: ${video.organization}`;
    document.getElementById('video-modal-iframe').src = video.url;
    document.getElementById('video-modal-ext-link').href = video.videoLink;

    modal.classList.add('active');
  },

  closeVideoModal() {
    const modal = document.getElementById('video-player-modal');
    if (modal) {
      modal.classList.remove('active');
      document.getElementById('video-modal-iframe').src = '';
    }
  },

  recalculateAlternativeYields() {
  const inputElement = document.getElementById('calc-biomass-input');

  if (!inputElement) {
    console.warn('Alternative yield calculator elements are not available on this view.');
    return;
  }

  const input = parseFloat(inputElement.value) || 1000;

  const updateText = (id, value) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  };

  updateText(
    'calc-compost-yield',
    `${Math.round(input * 0.55)} kg Compost`
  );

  updateText(
    'calc-vermi-yield',
    `${Math.round(input * 0.70)} kg Vermicompost`
  );

  updateText(
    'calc-biochar-yield',
    `${Math.round(input * 0.30)} kg Biochar`
  );

  updateText(
    'calc-mushroom-yield',
    `${Math.round(input * 0.75)} kg Oyster Mushrooms`
  );

  updateText(
    'calc-briquette-yield',
    `${Math.round(input * 0.95)} kg Fuel Briquettes`
  );

  const fertSaving = Math.round((input / 1000) * 3500);

  updateText(
    'calc-fert-savings',
    `₹${fertSaving.toLocaleString()}`
  );
},
  // 🎬 SIH Interactive Judge Demonstration Walkthrough
  async startSIHInteractiveDemo() {
    API.showToast('🎬 Starting SIH 2026 Interactive Demonstration...', 'info');

    // Step 1: Navigate to Analyze and populate Guntur profile
    this.navigate('waste-analysis-view');
    this.goToStepperStep(1);

    this.simulateSampleUpload('rice-straw', 'Rice straw (Guntur Field Sample)');

    // Stepper progression simulation
    setTimeout(() => this.goToStepperStep(2), 600);
    setTimeout(() => {
      this.selectQuantityPreset(1000, document.querySelector('.choice-qty[data-val="1000"]'));
      this.goToStepperStep(3);
    }, 1200);
    setTimeout(() => this.goToStepperStep(4), 1800);
    setTimeout(() => this.goToStepperStep(5), 2400);
    setTimeout(() => {
      this.goToStepperStep(6);
      this.handleAnalysisSubmit();
      API.showToast('SIH Demo: Guntur Rice Straw -> 2G Bio-Ethanol Matched!', 'success');
    }, 3000);
  },

  runGunturDemoScenario() {
    this.startSIHInteractiveDemo();
  },

  renderFacilitiesList(facilities) {
    const container = document.getElementById('facility-cards-container');
    if (!container) return;

    container.innerHTML = '';
    facilities.forEach(fac => {
      const card = document.createElement('div');
      card.className = 'facility-card';

      const acceptedBadges = fac.acceptedWaste.map(w => `<span class="waste-pill">${I18N.getResidueName(w)}</span>`).join(' ');

      card.innerHTML = `
        <div>
          <span class="proto-badge" style="background:#fef3c7; color:#92400e; margin-bottom:4px;">DEMO FACILITY DATA</span>
          <div class="facility-type-badge">${fac.type}</div>
          <h3 style="font-size: 1.15rem; margin: 4px 0;">${fac.name}</h3>
          <p style="color: #64748b; font-size: 0.88rem;">📍 ${fac.location}</p>
        </div>
        <div style="margin: 1rem 0; flex-grow: 1;">
          <p style="font-size: 0.85rem; margin-bottom: 6px;"><strong>Accepted Feedstock:</strong></p>
          <div style="margin-bottom: 8px;">${acceptedBadges}</div>
          <p style="font-size: 0.85rem;"><strong>Min Batch:</strong> ${fac.minimumQuantity} kg</p>
          <p style="font-size: 0.85rem;"><strong>Daily Capacity:</strong> ${fac.capacityTpd} TPD</p>
          <p style="font-size: 0.85rem;"><strong>Distance:</strong> ~${fac.distanceKm || 18} km</p>
        </div>
        <div style="border-top: 1px solid var(--border-light); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: #15803d; font-weight: 700;">● Operational</span>
          <button class="btn btn-primary btn-sm" onclick="App.contactFacility('${fac.name}', '${fac.phone}')">
            Connect Facility
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  filterFacilities() {
    const filterVal = document.getElementById('facility-waste-filter').value;
    let filtered = this.state.facilities;
    if (filterVal) {
      filtered = this.state.facilities.filter(f => f.acceptedWaste.includes(filterVal));
    }
    this.renderFacilitiesList(filtered);
  },

  async loadDashboardView() {
    try {
      const data = await API.getDashboardData();
      if (!data.success) return;

      const sum = data.summary;

      document.querySelectorAll('.stat-total-biomass').forEach(el => {
        el.textContent = `${sum.totalBiomassRegisteredKg.toLocaleString()} kg`;
      });
      document.querySelectorAll('.stat-total-energy').forEach(el => {
        el.textContent = `${sum.totalPotentialEnergyMJ.toLocaleString()} MJ`;
      });
      document.querySelectorAll('.stat-total-value').forEach(el => {
        el.textContent = `₹${sum.totalEstimatedValueInr.toLocaleString()}`;
      });
      document.querySelectorAll('.stat-total-farmers').forEach(el => {
        el.textContent = `${sum.totalRegisteredFarmers}`;
      });
      document.querySelectorAll('.stat-total-facilities').forEach(el => {
        el.textContent = `${sum.activeFacilitiesCount}`;
      });
      document.querySelectorAll('.stat-total-clusters').forEach(el => {
        el.textContent = `${sum.activeCollectionClusters}`;
      });

      ChartsModule.init(data);
      this.renderMasterFarmTable(data.recentFarms || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  },

  renderMasterFarmTable(farms) {
    const tbody = document.getElementById('admin-farms-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    farms.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${f.farmerName}</strong></td>
        <td>${f.location}</td>
        <td><span class="waste-pill">${I18N.getResidueName(f.wasteType)}</span></td>
        <td><strong>${f.quantity} kg</strong></td>
        <td>${f.condition}</td>
        <td>${f.harvestDate}</td>
        <td><span class="proto-badge" style="background:#dcfce7; color:#15803d;">${f.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  },

  async loadCollectionsView() {
    try {
      const res = await API.getCollections();
      if (res.data) {
        this.renderCollectionsList(res.data);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  },

  renderCollectionsList(clusters) {
    const container = document.getElementById('collections-list-container');
    if (!container) return;

    container.innerHTML = '';
    clusters.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cluster-container';

      const farmsHtml = c.farms.map(f => `
        <div class="farmer-pool-item">
          <strong>${f.farmerName}</strong>
          <div style="color: #15803d; font-weight: 700; font-size: 1.1rem; margin: 4px 0;">${f.quantity} kg</div>
          <div style="font-size: 0.75rem; color: #64748b;">📍 ${f.location}</div>
        </div>
      `).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <span class="proto-badge" style="background: #f3e8ff; color: #7e22ce;">COMMUNITY POOL</span>
            <h3 style="font-size: 1.3rem; margin-top: 4px;">${c.name}</h3>
            <p style="color: #64748b; font-size: 0.88rem;">District: ${c.district} | Waste: ${I18N.getResidueName(c.wasteType)}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.6rem; font-weight: 800; color: #15803d;">${c.totalBiomassKg.toLocaleString()} kg</div>
            <div style="font-size: 0.75rem; color: #64748b;">Aggregated Volume (${c.farmerCount} Farmers)</div>
          </div>
        </div>

        <h4 style="font-size: 0.92rem; color: #334155; margin-bottom: 0.5rem;">👨‍🌾 Pooled Farmer Lots:</h4>
        <div class="farmer-pool-list">${farmsHtml}</div>

        <div style="background: white; border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid #bbf7d0; margin-top: 1rem;">
          <div class="form-grid-2col">
            <div>
              <p style="font-size: 0.88rem;"><strong>Destination Facility:</strong> ${c.destinationFacilityName}</p>
              <p style="font-size: 0.88rem;"><strong>Scheduled Pickup:</strong> 📅 ${c.scheduledPickupDate}</p>
              <p style="font-size: 0.88rem;"><strong>Vehicle Assigned:</strong> 🚛 ${c.suggestedTruckType}</p>
            </div>
            <div>
              <div style="background: #f0fdf4; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid #86efac;">
                <p style="font-size: 0.88rem; color: #15803d;"><strong>Logistics Cost Savings:</strong> ₹${c.logisticsSavings} (${c.savingsPercent || 38}% Saved!)</p>
                <p style="font-size: 0.88rem;"><strong>Indicative Group Payout:</strong> ₹${c.indicativeTotalPayout.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  async handleFarmRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-farmer-name').value;
    const phone = document.getElementById('reg-farmer-phone').value;
    const location = document.getElementById('reg-farmer-location').value;
    const district = document.getElementById('reg-farmer-district').value;
    const wasteType = document.getElementById('reg-farm-waste-type').value;
    const quantity = document.getElementById('reg-farm-quantity').value;
    const condition = document.getElementById('reg-farm-condition').value;

    try {
      const res = await API.registerFarm({
        farmerName: name,
        phone,
        location,
        district,
        wasteType,
        quantity,
        condition
      });

      if (res.success) {
        API.showToast('Farm biomass registered successfully!', 'success');
        document.getElementById('farm-register-form').reset();
        await this.loadDashboardView();
        MapModule.loadMapData();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  },

  async resetDemoState() {
    if (confirm('Reset demo dataset to baseline Guntur, Andhra Pradesh data?')) {
      try {
        const res = await API.resetDemoData();
        if (res.success) {
          API.showToast(res.message, 'success');
          await this.loadInitialData();
          await this.loadDashboardView();
          MapModule.loadMapData();
        }
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  },

  contactFacility(facName, phone) {
    alert(`[Demo Facility Contact]\n\nFacility: ${facName}\nDesk: ${phone}\n\nIn production, this initiates a digital dispatch request to the plant logistics desk.`);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
