# ?? AgriAI ? Waste2Fuel

> **?Agricultural Waste Is Not Waste ? It Is a Resource for Future Fuel.?**

## SIH 2026 & Multimodal Agricultural Waste-to-Biofuel AI Platform

**Problem Statement:** `SIH26203` ? Student Innovation | Renewable / Sustainable Energy

AgriAI ? Waste2Fuel is an end-to-end multimodal decision-support platform for agricultural residue management. It helps farmers identify agricultural waste from mobile phone photographs, evaluates biochemical and economic viability, and recommends optimal valorization pathways with **second-generation (2G) bioethanol / biofuels as the primary pathway**, alongside biogas (CBG), solid fuel briquettes/pellets, composting, vermicomposting, mushroom cultivation, and animal feed.

---

## 1. System Architecture & Multimodal Pipeline

```
                     FARMER
                       ?
                       ?
                 TAKE PHOTO (Smartphone)
                       ?
                       ?
             IMAGE QUALITY ASSESSMENT (Filter blurry / dark / distant)
                       ?
                       ?
               AI IMAGE CLASSIFIER (ResNet / EfficientNet / Vision Transformer)
                       ?
                       ?
              PREDICTED WASTE TYPE + CONFIDENCE SCORE
                       ?
     ????????????????????????????????????????????
     ?                                          ?
Confidence >= 85%                       Confidence 70-84%             Confidence < 70% or Unknown
     ?                                          ?                                 ?
     ?                                          ?                                 ?
High-Confidence Detection              Prompt Clarification Questions     Request Re-capture / RBK Inspection
     ?                                          ?                                 ?
     ????????????????????????????????????????????                                 ?
                       ?                                                          ?
                       ?                                                          ?
             BASIC FARMER QUESTIONS                                               ?
             - Crop Type Confirmation                                             ?
             - Estimated Quantity (kg/trolleys)                                   ?
             - Moisture State (Dry/Wet)                                           ?
             - Storage Duration & Current Disposal                                ?
                       ?                                                          ?
                       ?                                                          ?
          BIOCHEMICAL & WASTE CHARACTERISTICS                                     ?
          - Cellulose, Hemicellulose, Lignin %                                    ?
          - Soluble Sugar % & Ash %                                               ?
          - Environmental & Stubble Burning Risk                                  ?
                       ?                                                          ?
                       ?                                                          ?
                DECISION ENGINE                                                   ?
                       ?                                                          ?
     ??????????????????????????????????????????????????????????                   ?
     ?                                                        ?                   ?
???????????????????????????????????????????????? ??????????????????????????????????????????????????????????
? RECOMMENDED UTILIZATION PATHWAYS             ? ? ACTIONABLE ADVISORY                                    ?
? 1. Ethanol (2G Bioethanol / Fermentation)    ? ? - Specific Farmer Moisture/Storage Guidance            ?
? 2. Biogas (CBG - Compressed Biogas / SATAT)  ? ? - Government Scheme Linkages (PM-JIVAN, GOBARdhan,     ?
? 3. Briquettes / Pellets (Thermal Co-firing)  ? ?   AP Biofuel Mission, PKVY, APCNF)                     ?
? 4. Compost / Vermicompost                    ? ??????????????????????????????????????????????????????????
? 5. Mushroom Cultivation                      ?
? 6. Animal Feed / Livestock Fodder            ?
????????????????????????????????????????????????
```

---

## 2. Complete Multimodal Dataset Suite

The project includes a multimodal agricultural waste dataset structured for computer vision and decision support:

```text
dataset/
??? images/
?   ??? rice_straw/
?   ??? rice_husk/
?   ??? rice_bran/
?   ??? maize_stalk/
?   ??? maize_cob/
?   ??? sugarcane_bagasse/
?   ??? sugarcane_trash/
?   ??? cotton_stalk/
?   ??? cotton_waste/
?   ??? chilli_stem/
?   ??? groundnut_shell/
?   ??? groundnut_haulm/
?   ??? banana_pseudostem/
?   ??? banana_leaf/
?   ??? tobacco_stalk/
?   ??? pulse_residue/
?   ??? soybean_residue/
?   ??? sunflower_residue/
?   ??? turmeric_residue/
?   ??? mango_waste/
?   ??? coconut_husk/
?   ??? coconut_shell/
?   ??? vegetable_residue/
?   ??? unknown_other/
?   ??? hard_negatives/
?       ??? rice_straw_vs_wheat_straw/
?       ??? rice_husk_vs_sawdust/
?       ??? groundnut_shell_vs_coconut_shell/
?       ??? sugarcane_bagasse_vs_dry_grass/
?       ??? maize_stalk_vs_sorghum_stalk/
?       ??? banana_pseudostem_vs_banana_leaf/
?
??? metadata/
?   ??? image_metadata.csv     (Per-image camera, lighting, condition, quality, hash, and provenance)
?   ??? waste_metadata.csv     (Biochemical metrics: cellulose, hemicellulose, lignin, ash, pathways)
?   ??? data_dictionary.csv    (Complete 69-field data dictionary)
?
??? raw/
?   ??? agriai_raw_dataset.csv (Full multimodal records combining imagery, survey, and chemistry)
?
??? cleaned/
?   ??? agriai_cleaned_dataset.csv (Validated and standardized multimodal dataset)
?
??? processed/
?   ??? train.csv              (70% Leakage-free training split)
?   ??? validation.csv         (15% Leakage-free validation split)
?   ??? test.csv               (15% Leakage-free testing split)
?
??? labels/
?   ??? waste_labels.csv       (24 registered classification classes)
?   ??? pathway_labels.csv     (9 utilization pathways and techno-economic criteria)
?
??? README.md
```

### Dataset Validation & Integrity Status
Run `python dataset_validator.py` to verify integrity across all files:
* **Total Image Assets**: 108 openable, validated images.
* **Provenance**: Explicitly marked with `Data_Source_Type = Synthetic/Demo` with visual warning banners (Rule 19 compliant).
* **Data Leakage**: Zero data leakage; physical `Group_ID` clustering guarantees related images do not span multiple splits.
* **Target Real-World Scope**: 200?500+ photographs per class ($pprox 11,500+$ images for 23 classes) across Andhra Pradesh districts.

---

## 3. Python ML & Dataset Tooling

```bash
# Set up Python virtual environment
uv venv
.venv\Scripts\activate
pip install -r requirements.txt

# Run dataset validation suite
python dataset_validator.py

# Re-split dataset into 70% Train, 15% Val, 15% Test
python dataset_splitter.py

# Test end-to-end multimodal decision engine
python decision_engine.py

# Ingest new photographs or run training augmentation
python image_dataset_builder.py
```

---

## 4. Web Application Prototype

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (English, Telugu, Hindi UI)
- **Backend:** Node.js + Express
- **Mapping:** Leaflet.js + OpenStreetMap (Haversine logistics matching)
- **Charts:** Chart.js (Biomass energy and economic viability)
- **Optional AI advisor:** OpenAI API integration (with offline local fallback)

### Run Web App Locally

```powershell
npm install
npm start
```

Then open:
```text
http://localhost:3000
```

### Run API Tests
```powershell
npm test
```

---

## 5. API Endpoints

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

---

## 6. Real vs. Synthetic Data Provenance (Rule 19 Compliant)

* All demo images and records are tagged as `Data_Source_Type = Synthetic/Demo`.
* Demo images contain visible red watermarks: `[DEMO / SYNTHETIC PLACEHOLDER - NOT REAL FIELD PHOTO]`.
* No fabricated scientific measurements, government statistics, or farmer survey results are presented as real-world data.
* Guidelines and scripts are provided in `image_dataset_builder.py` to ingest real farmer photographs as field collection progresses.

---

## 7. License & Credits

Developed for SIH 2026 by Team AgriAI. Focus regions include all 26 districts of Andhra Pradesh, India.
