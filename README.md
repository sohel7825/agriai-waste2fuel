# AgriAI — Agricultural Material Intelligence System

> **From Agricultural Loss & Waste to the Best Possible Action.**

AgriAI is an AI-powered Agricultural Material Intelligence System designed to help farmers understand agricultural materials, crop losses, damaged produce, and residues, then decide what to do next.

## What AgriAI solves

Farmers may have crop residue, wet or spoiled material, disaster-damaged crops, or usable agricultural by-products but may not know the safest, most practical, or most valuable next step.

AgriAI brings these decisions into one workflow:

**PHOTO / VOICE → IDENTIFY → ASSESS CONDITION → ASK REQUIRED QUESTIONS → CHECK INSURANCE PATHWAY → BUILD LOSS EVIDENCE → COMPARE RECOVERY & UTILIZATION OPTIONS → RECOMMEND ACTION → TRACK OUTCOME**

## Core capabilities

- **Material identification** from a farmer's photograph or selected material.
- **Condition assessment** such as dry, wet, damaged, spoiled, or uncertain.
- **Context-aware questions** for quantity, crop, location, season, urgency, storage, and farmer objective.
- **Insurance intelligence** that guides farmers toward applicable official crop-insurance processes and organizes information needed for reporting.
- **Loss Evidence Builder** for crop-loss and disaster-damage cases.
- **Recovery Intelligence** for rain-damaged, wet, spoiled, or partially usable agricultural material.
- **On-farm utilization** including composting, vermicomposting, mulching, biochar, mushroom-related uses, and other suitable pathways.
- **Off-farm utilization** including biomass processing and verified industrial pathways.
- **Biofuel pathways** including 2G ethanol, biogas/CBG, briquetting/pelletization, and other suitable bioenergy options where technically and economically appropriate.
- **Facility and aggregation intelligence** for suitable processors, collectors, and community pooling.
- **Pathway comparison** using quantity, condition, transport distance, cost, time, availability, safety, and farmer objective.
- **Explainable recommendations** showing why an option was suggested.
- **Confidence and safety handling** so the system asks for more information instead of guessing.
- **Voice-first multilingual assistance** in English, Telugu, and Hindi.
- **Case tracking and outcome feedback** to improve future recommendations.

## Important design principle

AgriAI does **not** force every agricultural residue into fuel.

The system first understands the material and its condition, then compares practical pathways. Depending on the case, the result may be an on-farm action, storage/drying, aggregation, composting, mushroom-related use, biomass processing, biofuel production, or another suitable utilization route.

## Insurance role

AgriAI is an **assistance and decision-support system**, not an insurer.

It can:
1. collect crop, location, season, and damage information;
2. identify potentially relevant official insurance pathways;
3. help organize photographs, dates, location, crop, and damage evidence;
4. guide the farmer toward authorized reporting/enrollment channels;
5. store a case reference for follow-up.

Final eligibility, loss assessment, claim approval, and compensation remain with authorized government and insurance authorities.

## Current prototype stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js + Express
- AI advisor: optional OpenAI integration with local fallback
- Computer-vision prototype: existing agricultural material classifier
- Maps: Leaflet + OpenStreetMap
- Charts: Chart.js
- Data: JSON prototype store with clear demo/prototype labeling
- Languages: English, Telugu, Hindi

## Run locally

```powershell
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Run tests:

```powershell
npm test
```

## Data integrity

The repository contains prototype/demo data. Demo facilities, farmer records, estimates, and sample outputs must not be presented as verified real-world facts.

Real-world deployment should use verified government information, verified facility data, expert-reviewed agricultural pathways, and field-collected farmer cases.

## Developer

**Sohel Hussain**  
GitHub: **sohel7825**

## License

MIT
