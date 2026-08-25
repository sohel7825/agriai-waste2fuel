# 🌿 AgriAI – Waste2Fuel

> **“Agricultural Waste Is Not Waste — It Is a Resource for Future Fuel.”**

### 🏆 Smart India Hackathon (SIH 2026) Prototype
- **Problem Statement ID:** `SIH26203` – Student Innovation
- **Theme:** Renewable / Sustainable Energy
- **Category:** Software Prototype / Decision-Support Platform

---

## 📌 1. Project Overview

**AgriAI – Waste2Fuel** is a mobile-responsive web platform designed to solve one of India's most urgent environmental and agricultural challenges: **crop residue burning and biomass underutilization**.

Instead of treating farm residues as waste to be burned in open fields, AgriAI serves as an intelligent **decision support system** that:
1. Identifies agricultural residues using a modular computer-vision classifier.
2. Calculates estimated energy potential (MJ, kWh electricity, 2G Bio-Ethanol liters equivalent, CBG m³).
3. Matches the biomass with compatible regional processing bio-refineries (2G Ethanol, CBG, Briquetting, Cogeneration).
4. Conducts transparent economic viability analysis ($\text{Net Value} = \text{Biomass Value} - \text{Logistics} - \text{Handling}$).
5. Enables **Community Biomass Pooling** so smallholder farmers (e.g. 500kg, 800kg) can aggregate into 3,000+ kg bulk clusters and slash transport costs by ~38%.
6. Seamlessly recommends on-farm regenerative alternatives (**Compost, Vermicompost, Flame-Cap Biochar, Oyster Mushroom cultivation**) when industrial logistics are uneconomical or residue is wet.

---

## 🎯 2. Unique Value Proposition (UVP) & Strategic Impact

> **“AgriAI does not simply identify agricultural waste. It decides what the most practical next step is.”**

### 🇮🇳 Distributed National Energy Security
In major fuel supply disruptions or geopolitical emergencies, dependence on imported crude oil creates a critical vulnerability. AgriAI transforms rural agricultural residues into a **distributed domestic clean fuel reserve**, keeping emergency transport, tractors, and rural backup electricity operational.

```
                    🌾 Agricultural Waste (Residue)
                                ↓
                        AI Vision Analysis
                                ↓
                    ┌───────────┼───────────┐
                    ↓           ↓           ↓
               2G Ethanol   CBG / BioCNG   Bio-Oil/Pellets
                    ↓           ↓           ↓
                   🚗          🚛          🚚
             Automotive    Commercial    Industrial
                Fuel          Fuel          Fuel
                    │           │           │
                    └───────────┼───────────┘
                                ↓
                        ⚡ Clean Electricity
                     (Rural Microgrid Backup)
```

AgriAI provides **3 distinct outcomes** based on empirical feasibility:

```
                          ┌───────────────────────────┐
                          │   Farmer Agricultural     │
                          │     Residue Input         │
                          └─────────────┬─────────────┘
                                        │
                         [ AI Vision Identification ]
                         [ Quantity & Moisture Check ]
                         [ Logistics & Distance Math ]
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
          ▼                             ▼                             ▼
   [ OUTCOME 1 ]                 [ OUTCOME 2 ]                 [ OUTCOME 3 ]
  CAN BECOME FUEL           CAN BE POOLED ECONOMICALLY   INDUSTRIAL ROUTE NOT VIABLE
  Connect to nearest        Group neighboring farms      Recommend on-farm compost,
  2G Ethanol / CBG plant    into 3000+ kg cluster to     vermicompost, biochar, or
  with positive net payout  cut transport costs by 38%   mushroom cultivation
```

---

## 💻 3. Tech Stack & Architecture

- **Frontend:** HTML5, Modern CSS3 (Custom properties, glassmorphism, responsive grid), Vanilla JavaScript (Modular ES6 architecture).
- **Backend:** Node.js, Express.js (REST APIs, JSON data layer, CORS, error handling).
- **Mapping:** [Leaflet.js](https://leafletjs.com/) + OpenStreetMap (100% free, zero paid API keys).
- **Analytics:** [Chart.js](https://www.chartjs.org/) for regional biomass breakdowns, crop distributions, and logistics savings.
- **AI Classification Core:** Pluggable vision inference interface with simulated confidence scoring, feature extraction, and support for future ONNX / TensorFlow.js models.
- **Runtime:** No Python required; 100% pure JavaScript/Node.js stack.

---

## 🗂️ 4. Project Directory Structure

```
agriai-waste2fuel/
├── package.json               # Node.js dependencies and scripts
├── .env.example               # Environment template
├── .env                       # Environment configuration
├── server.js                  # Express server & static asset serving
├── README.md                  # Comprehensive documentation
├── src/
│   ├── data/
│   │   ├── wasteTypes.json    # 8 agricultural residues with chemical/energy parameters
│   │   ├── facilities.json    # Realistic demo bio-energy facilities (Andhra Pradesh/Telangana)
│   │   ├── alternatives.json  # Comprehensive on-farm alternative manuals (Compost, Biochar, etc.)
│   │   ├── farms.json         # Demo farm lots including Guntur Farmer A, B, C, D
│   │   └── collections.json   # Community biomass pooling clusters
│   ├── routes/
│   │   └── api.js             # Express router implementing all REST API endpoints
│   └── services/
│       ├── aiClassifier.js    # Pluggable modular AI residue identification service
│       ├── viabilityEngine.js # Transparent economic viability & energy yield engine
│       └── aggregationEngine.js # Community pooling logistics & cost optimizer
├── public/
│   ├── index.html             # Single-Page Application interface with 10 interactive views
│   ├── css/
│   │   └── style.css          # Modern eco-clean responsive design
│   └── js/
│       ├── api.js             # Client API wrapper
│       ├── map.js             # Interactive Leaflet map controller
│       ├── charts.js          # Chart.js dashboards for Farmer & Admin insights
│       └── app.js             # Application controller & 1-click Demo mode
└── tests/
    └── api.test.js            # Automated verification test suite for all REST APIs
```

---

## 🔬 5. Supported Residues & Biological/Energy Attributes

| Residue | Category | Calorific Value (MJ/kg) | 2G Ethanol Yield (L/tonne) | CBG Yield (m³/kg) | Base Value (₹/kg) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Rice straw** | Cereal Crop Residue | 14.5 | 220 | 0.25 | ₹2.20 |
| **Rice husk** | Mill Agro-Industrial | 15.2 | 180 | 0.30 | ₹3.00 |
| **Maize stalk** | Coarse Grain Residue | 16.0 | 240 | 0.28 | ₹2.40 |
| **Maize cob** | High-Density Core | 17.1 | 210 | 0.32 | ₹2.80 |
| **Sugarcane bagasse** | Sugar Mill Byproduct | 17.5 | 280 | 0.35 | ₹2.60 |
| **Cotton residue** | Woody Fiber Stalks | 16.8 | 190 | 0.24 | ₹2.50 |
| **Groundnut shell** | Oilseed Processing | 18.5 | 170 | 0.33 | ₹3.20 |
| **Coconut residue** | Plantation Byproduct | 19.2 | 150 | 0.30 | ₹3.50 |

---

## 📐 6. Transparent Mathematical Viability Formula

The economic decision engine evaluates the net return to the farmer without hidden assumptions:

$$\text{Estimated Net Value} = \text{Gross Biomass Value} - \text{Transportation Cost} - \text{Collection/Handling Cost}$$

### Where:
1. $\text{Gross Biomass Value} = \text{Quantity (kg)} \times \text{Factory Gate Purchase Price (₹/kg)}$
2. $\text{Transportation Cost} = \text{Base Fee (₹250)} + (\text{Distance (km)} \times ₹14/\text{km} \times \lceil\text{Quantity}/1500\rceil) - \text{Facility Transport Rebate}$
3. $\text{Collection \& Handling Cost} = \text{Quantity (kg)} \times ₹0.30/\text{kg}$ (Baling, labor, loading)

### Viability Thresholds:
- **`GOOD`**: Net Return $\ge ₹1.40/\text{kg}$, Dry condition, quantity meets facility minimum. Primary recommendation: **Industrial Biofuel Conversion (2G Ethanol / CBG)**.
- **`MODERATE`**: Net Return $₹0.45 - ₹1.40/\text{kg}$, or lot is below facility minimum solo threshold. Primary recommendation: **Community Biomass Pooling Hub**.
- **`NOT ECONOMICALLY VIABLE`**: Net Return $< ₹0.45/\text{kg}$, or wet condition ($>30\%$), or excessive distance ($>65\text{ km}$). Primary recommendation: **On-Farm Regenerative Alternatives (Compost, Biochar, Mushroom)**.

---

## 🚀 7. Installation & How to Run

### Prerequisites
- Node.js (v18+ or v22+ recommended)
- npm (v9+ or v10+)

### Step-by-Step Execution Commands:

```bash
# 1. Navigate to project directory
cd C:\Users\sohel\.gemini\antigravity\scratch\agriai-waste2fuel

# 2. Install dependencies (express, cors, dotenv)
npm install

# 3. Run automated test suite to verify all APIs
npm test

# 4. Start the application
npm start
```

### Accessing the Web Application:
Open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

## ⚡ 8. Demo Mode Walkthrough (Guntur, Andhra Pradesh)

The prototype comes with built-in 1-Click test data:
1. Click the **⚡ 1-Click Demo Mode (Guntur, AP)** button in the top banner or hero card.
2. The system automatically populates:
   - **Residue:** Rice straw (Paddy)
   - **Quantity:** 1,000 kg
   - **Condition:** Dry (<15%)
   - **Harvest:** 10 days ago
   - **Location:** Guntur Rural, Andhra Pradesh (Lat: 16.3067, Lon: 80.4365)
3. AgriAI immediately runs AI vision classification (94.5% confidence), matches with **Demo 2G Bio-Ethanol Refinery – Guntur** (12 km away), calculates:
   - **Total Energy:** 14,500 MJ
   - **2G Ethanol Yield:** 220 Liters equivalent
   - **Gross Value:** ₹2,200
   - **Estimated Net Farmer Return:** ₹1,482 (GOOD Viability)
4. Navigate to **Community Pooling** to see the 4-farmer cluster in Guntur (Farmer A 500kg + Farmer B 800kg + Farmer C 700kg + Farmer D 1000kg = 3000kg) saving ₹1,470 (~38%) in consolidated logistics!

---

## 📡 9. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and uptime |
| `GET` | `/api/waste-types` | Returns all 8 supported agricultural residues with properties |
| `POST` | `/api/analyze` | AI image classification and feature extraction simulation |
| `GET` | `/api/facilities` | Matches regional facilities with distance and logistics cost |
| `POST` | `/api/calculate-viability` | Computes transparent energy and net economic viability |
| `GET` | `/api/alternatives` | Farm-level alternative manuals (Compost, Biochar, Mushroom) |
| `GET` | `/api/farms` | List of registered farm biomass lots |
| `POST` | `/api/farms` | Register a new farm lot to the central registry |
| `GET` | `/api/collections` | Active community aggregation clusters |
| `POST` | `/api/collections` | Pool multi-farmer lots into an aggregation cluster |
| `GET` | `/api/dashboard` | Aggregated metrics and Chart.js datasets |
| `POST` | `/api/reset-demo` | Resets datasets to default Guntur demo baseline |

---

## 🔌 10. Future AI Model Integration Roadmap

The AI Vision module (`src/services/aiClassifier.js`) is architected with a decoupled, modular design:

```javascript
// src/services/aiClassifier.js
// To connect a real computer-vision model:
async function classifyBiomassImage(imageBuffer) {
  // Option A: Client-side TensorFlow.js MobileNetV3 model
  // Option B: Server-side ONNX Runtime model trained on ICAR biomass dataset
  // Option C: Cloud Vision API / Custom HuggingFace Endpoint
  const model = await loadTrainedModel();
  const predictions = await model.predict(imageBuffer);
  return {
    identifiedWaste: predictions.topMatch,
    confidenceScore: predictions.confidence
  };
}
```

No changes to the UI, forms, or decision-support algorithms are required when replacing the classifier core.

---

## ⚠️ 11. Disclaimers & Limitations

- **Prototype & Demonstration Data:** Facility names, locations, and pricing benchmarks are representative demo models for hackathon evaluation.
- **Indicative Yields:** Energy equivalents (MJ, kWh, 2G ethanol liters) are calculated using standardized dry-basis conversion factors and are not guaranteed chemical manufacturing warranties.
- **Assistive Tool:** The software acts as an assistive decision-support platform for farmers and aggregators.

---

## 👥 12. Team & Acknowledgements
- **Competition:** Smart India Hackathon (SIH 2026)
- **Built for:** Indian Smallholder Farmers & Renewable Bio-Energy Sector
