# 🌿 AgriAI – Waste2Fuel

> **“Agricultural Waste Is Not Waste — It Is a Resource for Future Fuel.”**

## SIH 2026 Prototype

**Problem Statement:** `SIH26203` — Student Innovation | Renewable / Sustainable Energy

AgriAI – Waste2Fuel is a mobile-responsive decision-support prototype for agricultural residue management. It helps farmers compare renewable-energy pathways, logistics, economic viability, community pooling, and on-farm alternatives.

### Important prototype note
The current residue classifier is a **deterministic metadata/sample-hint heuristic**, not a trained computer-vision model. Uploaded photos are previewed in the browser, while the backend uses the filename/sample hint to select a prototype residue. The API is deliberately designed so a trained ONNX/TensorFlow model can replace this module later.

The conversational advisor can use a local knowledge base and can optionally use OpenAI when `OPENAI_API_KEY` is configured on the server.

## Core Features

1. Agricultural residue identification workflow with farmer confirmation.
2. Indicative energy potential: MJ, electricity, ethanol-equivalent and CBG-equivalent.
3. Facility matching using location and Haversine distance.
4. Transparent indicative economic calculation.
5. Community biomass pooling for small farm lots.
6. On-farm alternatives such as compost, biochar and mushroom cultivation.
7. Farmer/admin dashboards and charts.
8. English, Telugu and Hindi UI support.
9. Browser voice input/output where Web Speech API is supported, with typed fallback.
10. SIH Guntur demonstration mode and reset-demo functionality.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Mapping:** Leaflet.js + OpenStreetMap
- **Charts:** Chart.js
- **Optional AI advisor:** OpenAI API
- **Data layer:** JSON demo datasets
- **Runtime:** Node.js 18+ / Node.js 22 recommended

## Project Structure

```text
agriai-waste2fuel/
├── package.json
├── .env.example
├── server.js
├── README.md
├── src/
│   ├── data/
│   ├── routes/
│   └── services/
├── public/
│   ├── index.html
│   ├── css/
│   └── js/
└── tests/
    └── api.test.js
```

## Run Locally

Open PowerShell in the project directory:

```powershell
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

### Run API tests

The current test suite sends requests to the running local server. Keep `npm start` running in Terminal 1, then open Terminal 2 and run:

```powershell
npm test
```

The suite checks health, residue APIs, prototype classifier, viability engine, facilities, alternatives, videos, collections, dashboard and multilingual chat.

## Optional OpenAI Advisor

Copy `.env.example` to `.env` and configure the server-side key:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4
```

Never put the API key in frontend JavaScript or commit `.env` to GitHub.

Without the key, the local advisor remains available.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server health |
| GET | `/api/waste-types` | Supported residues |
| POST | `/api/analyze` | Prototype residue classification |
| GET | `/api/ai-status` | AI advisor provider status |
| POST | `/api/chat` | English/Telugu/Hindi advisor |
| GET | `/api/facilities` | Facility matching |
| POST | `/api/calculate-viability` | Energy/economic decision support |
| GET | `/api/alternatives` | On-farm alternatives |
| GET | `/api/videos` | Educational video metadata |
| GET | `/api/farms` | Farm lots |
| POST | `/api/farms` | Register farm lot |
| GET | `/api/collections` | Community clusters |
| POST | `/api/collections` | Create cluster |
| GET | `/api/dashboard` | Dashboard metrics |
| POST | `/api/reset-demo` | Reset demo state |

## Prototype Limitations

- Farm and collection changes are stored in server memory and reset when the Node process restarts.
- Facility names, prices and logistics figures in the demo datasets are representative prototype data unless independently verified.
- Energy, emissions and fuel-equivalent values are indicative calculations, not guaranteed industrial output.
- Browser voice recognition depends on browser/device support and permissions.
- A trained computer-vision model is a future integration; the current classifier must not be presented as a trained image model.

## Future Production Roadmap

1. Replace heuristic classifier with a trained ONNX/TensorFlow model.
2. Add persistent PostgreSQL/Supabase/MongoDB storage.
3. Add authentication and farmer/admin roles.
4. Verify and maintain real facility, pricing and educational-resource data.
5. Add automated frontend/browser testing.
6. Deploy backend and frontend with environment-based configuration.
