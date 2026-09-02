# AgriAI - Waste2Fuel: Multimodal Agricultural Waste & Biofuel Dataset Suite

## 1. Project Overview
AgriAI - Waste2Fuel is an end-to-end multimodal AI decision-support system designed to identify agricultural crop residues from farmer-uploaded photographs and basic farmer questions, recommending optimal utilization pathways with ethanol/biofuel as the primary pathway, while also supporting biogas, briquettes/pellets, compost, vermicompost, mushroom cultivation, and animal feed.

The system focuses on Andhra Pradesh across districts including Guntur, Palnadu, Bapatla, Krishna, NTR, Eluru, West Godavari, East Godavari, Kakinada, Konaseema, Prakasam, Nellore, Kurnool, Nandyal, Anantapur, Sri Sathya Sai, Kadapa, Chittoor, Tirupati, Annamayya, Vizianagaram, Srikakulam, Visakhapatnam, Alluri Sitharama Raju, and Parvathipuram Manyam.

---

## 2. System Architecture Pipeline

```
                     FARMER
                       |
                       v
                 TAKE PHOTO (Smartphone)
                       |
                       v
             IMAGE QUALITY ASSESSMENT (Filter blurry / dark / distant)
                       |
                       v
               AI IMAGE CLASSIFIER (ResNet / EfficientNet / Vision Transformer)
                       |
                       v
              PREDICTED WASTE TYPE + CONFIDENCE SCORE
                       |
     +-----------------+------------------------+
     |                                          |
Confidence >= 85%                       Confidence 70-84%             Confidence < 70% or Unknown
     |                                          |                                 |
     v                                          v                                 v
High-Confidence Detection              Prompt Clarification Questions     Request Re-capture / RBK Inspection
     |                                          |                                 |
     +-----------------+------------------------+                                 |
                       |                                                          |
                       v                                                          |
             BASIC FARMER QUESTIONS                                               |
             - Crop Type Confirmation                                             |
             - Estimated Quantity (kg/trolleys)                                   |
             - Moisture State (Dry/Wet)                                           |
             - Storage Duration & Current Disposal                                |
                       |                                                          |
                       v                                                          |
          BIOCHEMICAL & WASTE CHARACTERISTICS                                     |
          - Cellulose, Hemicellulose, Lignin %                                    |
          - Soluble Sugar % & Ash %                                               |
          - Environmental & Stubble Burning Risk                                  |
                       |                                                          |
                       v                                                          |
                DECISION ENGINE                                                   |
                       |                                                          |
     +-----------------+--------------------------------------+                   |
     v                                                        v                   v
+----------------------------------------------+ +--------------------------------------------------------+
| RECOMMENDED UTILIZATION PATHWAYS             | | ACTIONABLE ADVISORY                                    |
| 1. Ethanol (2G Bioethanol / Fermentation)    | | - Specific Farmer Moisture/Storage Guidance            |
| 2. Biogas (CBG - Compressed Biogas / SATAT)  | | - Government Scheme Linkages (PM-JIVAN, GOBARdhan,     |
| 3. Briquettes / Pellets (Thermal Co-firing)  | |   AP Biofuel Mission, PKVY, APCNF)                     |
| 4. Compost / Vermicompost                    | +--------------------------------------------------------+
| 5. Mushroom Cultivation                      |
| 6. Animal Feed / Livestock Fodder            |
+----------------------------------------------+
```

---

## 3. Complete Dataset Structure

```
dataset/
|
|-- images/
|   |-- rice_straw/
|   |-- rice_husk/
|   |-- rice_bran/
|   |-- maize_stalk/
|   |-- maize_cob/
|   |-- sugarcane_bagasse/
|   |-- sugarcane_trash/
|   |-- cotton_stalk/
|   |-- cotton_waste/
|   |-- chilli_stem/
|   |-- groundnut_shell/
|   |-- groundnut_haulm/
|   |-- banana_pseudostem/
|   |-- banana_leaf/
|   |-- tobacco_stalk/
|   |-- pulse_residue/
|   |-- soybean_residue/
|   |-- sunflower_residue/
|   |-- turmeric_residue/
|   |-- mango_waste/
|   |-- coconut_husk/
|   |-- coconut_shell/
|   |-- vegetable_residue/
|   |-- unknown_other/
|   `-- hard_negatives/
|       |-- rice_straw_vs_wheat_straw/
|       |-- rice_husk_vs_sawdust/
|       |-- groundnut_shell_vs_coconut_shell/
|       |-- sugarcane_bagasse_vs_dry_grass/
|       |-- maize_stalk_vs_sorghum_stalk/
|       `-- banana_pseudostem_vs_banana_leaf/
|
|-- metadata/
|   |-- image_metadata.csv     (Per-image camera, lighting, quality, hash, and provenance metadata)
|   |-- waste_metadata.csv     (Biochemical parameters: cellulose, hemicellulose, lignin, ash, pathways)
|   `-- data_dictionary.csv    (Exhaustive 69-field data dictionary)
|
|-- raw/
|   `-- agriai_raw_dataset.csv (Full multimodal records combining imagery, survey, and chemistry)
|
|-- cleaned/
|   `-- agriai_cleaned_dataset.csv (Validated and standardized multimodal records)
|
|-- processed/
|   |-- train.csv              (70% Leakage-free training split)
|   |-- validation.csv         (15% Leakage-free validation split)
|   `-- test.csv               (15% Leakage-free testing split)
|
|-- labels/
|   |-- waste_labels.csv       (24 registered classification classes)
|   `-- pathway_labels.csv     (9 utilization pathways and techno-economic criteria)
|
`-- README.md

Also includes root scripts:
- image_dataset_builder.py
- dataset_validator.py
- dataset_splitter.py
- decision_engine.py
- requirements.txt
- README.md
```

---

## 4. Agricultural Waste Classes & Biochemical Characterization

The dataset defines 23 primary agricultural waste categories, 1 unknown/other category, and 6 hard negative comparison pairs:

| Class ID | Folder / Label | Crop Source | Typical Cellulose (%) | Typical Hemicellulose (%) | Typical Lignin (%) | Primary Pathway | Alternative Pathway |
|---|---|---|---|---|---|---|---|
| 1 | rice_straw | Rice | 36.5 | 24.0 | 14.5 | Ethanol (2G) | Mushroom Cultivation |
| 2 | rice_husk | Rice | 34.0 | 21.0 | 19.5 | Briquettes/Pellets | Ethanol |
| 3 | rice_bran | Rice | 12.0 | 18.0 | 8.0 | Animal Feed | Biogas |
| 4 | maize_stalk | Maize | 41.0 | 27.5 | 17.0 | Ethanol (2G) | Biogas |
| 5 | maize_cob | Maize | 38.5 | 34.0 | 15.0 | Ethanol (2G) | Briquettes/Pellets |
| 6 | sugarcane_bagasse | Sugarcane | 43.0 | 25.0 | 20.0 | Ethanol (2G) | Briquettes/Pellets |
| 7 | sugarcane_trash | Sugarcane | 37.0 | 26.0 | 21.0 | Ethanol (2G) | Briquettes/Pellets |
| 8 | cotton_stalk | Cotton | 39.5 | 19.5 | 24.5 | Briquettes/Pellets | Ethanol (2G) |
| 9 | cotton_waste | Cotton | 78.0 | 8.0 | 4.0 | Ethanol (2G) | Mushroom Cultivation |
| 10 | chilli_stem | Chilli | 32.0 | 20.0 | 22.0 | Briquettes/Pellets | Compost |
| 11 | groundnut_shell | Groundnut | 36.0 | 17.5 | 29.0 | Briquettes/Pellets | Ethanol |
| 12 | groundnut_haulm | Groundnut | 28.0 | 21.0 | 13.0 | Animal Feed | Biogas |
| 13 | banana_pseudostem | Banana | 35.0 | 22.0 | 11.0 | Biogas (CBG) | Ethanol |
| 14 | banana_leaf | Banana | 26.0 | 20.0 | 16.0 | Vermicompost | Biogas |
| 15 | tobacco_stalk | Tobacco | 36.0 | 18.0 | 23.0 | Briquettes/Pellets | Ethanol |
| 16 | pulse_residue | Pulses | 34.0 | 19.0 | 20.0 | Briquettes/Pellets | Compost |
| 17 | soybean_residue | Soybean | 37.0 | 21.0 | 16.5 | Ethanol (2G) | Mushroom Cultivation |
| 18 | sunflower_residue | Sunflower | 35.0 | 20.0 | 18.0 | Briquettes/Pellets | Ethanol |
| 19 | turmeric_residue | Turmeric | 30.0 | 18.0 | 17.0 | Compost | Biogas |
| 20 | mango_waste | Mango | 22.0 | 15.0 | 10.0 | Ethanol (1G/1.5G) | Biogas |
| 21 | coconut_husk | Coconut | 35.0 | 14.0 | 38.0 | Briquettes/Pellets | Industrial Biomass |
| 22 | coconut_shell | Coconut | 34.0 | 12.0 | 48.0 | Briquettes/Pellets | Industrial Biomass |
| 23 | vegetable_residue | Mixed Veg | 14.0 | 11.0 | 5.0 | Biogas (CBG) | Compost |
| 24 | unknown_other | Unknown | 0.0 | 0.0 | 0.0 | Assessment Req. | Field Verification |

---

## 5. Ethanol Decision Logic & Scientific Gating

The decision engine applies scientific, biochemical, and economic rules before recommending bioethanol:
1. Holocellulose Fraction (Cellulose + Hemicellulose): Lignocellulosic feedstocks require holocellulose > 55% dry basis (e.g. Cotton Waste, Sugarcane Bagasse, Maize Stalk/Cob, Rice Straw) to justify enzymatic hydrolysis into hexose and pentose sugars.
2. Lignin Recalcitrance: Feedstocks with extreme lignin (>25%, e.g., Coconut Shell, Groundnut Shell, Cotton Stalk) are prioritized for high-temperature densified briquetting or pyrolysis, as intensive delignification increases 2G ethanol production costs.
3. Moisture Content: Feedstocks exceeding 70% moisture (e.g. Banana Pseudostem, Vegetable Waste) require excessive energy for drying; they are routed directly to anaerobic digestion (Biogas / CBG) unless mechanical sap extraction yields high soluble fermentable sugars.
4. Soluble Fermentable Sugars: Wastes with high free sugars (e.g. Mango peel/pulp waste) bypass lignocellulose pretreatment and undergo direct yeast fermentation.
5. No False Yield Claims: Cellulose percentage is not equated directly to ethanol yield. Biochemical suitability is rated as Low, Medium, High, or Very High based on proven hydrolysis recovery metrics.

---

## 6. Real vs. Synthetic Data Provenance (Rule 19 Compliant)

To ensure strict scientific integrity and transparency:
- All current template images and demo records are explicitly marked with Data_Source_Type = Synthetic/Demo.
- Demo images contain conspicuous visual red banners: [DEMO / SYNTHETIC PLACEHOLDER - NOT REAL FIELD PHOTO].
- Zero fabricated data: No fake scientific measurements, fabricated government statistics, or simulated farmer surveys are presented as real-world field evidence.
- Replacement Protocol: Field teams and extension officers collect real photographs using the guidelines below to replace demo placeholders.

---

## 7. Guidelines for Collecting Real Farmer Photographs

Target collection scope:
- Minimum: 200 images per class.
- Production Target: 500+ images per class (Total target ~ 11,500+ photographs across 23 classes).

Capture variation requirements:
- Lighting: Bright sunlight, morning/evening light, cloudy/overcast, indoor sheds.
- Distances: Close-up macro (10-30 cm showing texture/fibres), Medium distance (1-2 m showing crop context), Bulk pile/overhead view.
- Physical Conditions: Freshly harvested, sun-dried, partially decomposed, chopped/baled, dirty/soil-mixed.
- Devices: Multi-brand Android smartphone cameras (8MP to 64MP) simulating real field uploads.
- Hard Negatives: Pairwise captures distinguishing visually similar residues (e.g. rice straw vs. wheat straw, groundnut shell vs. coconut shell).

---

## 8. Preventing Data Leakage (Group_ID Protocol)

Randomly splitting individual photographs leads to severe data leakage when multiple photos of the same physical waste pile appear in both training and test sets.
- Every photo capture session or physical pile is assigned a persistent Group_ID (e.g., GRP_0001).
- dataset_splitter.py groups records strictly by Group_ID before performing the 70% Train / 15% Val / 15% Test partition.
- dataset_validator.py enforces mathematical proof of zero group overlap across splits.

---

## 9. Quickstart & Command Execution

```bash
# 1. Validate the entire dataset suite
python dataset_validator.py

# 2. Re-generate splits (70% Train, 15% Val, 15% Test)
python dataset_splitter.py

# 3. Test multimodal decision engine
python decision_engine.py

# 4. Generate demo images or ingest new photos
python image_dataset_builder.py
```

---

## 10. Ethical & Privacy Considerations
1. Farmer Data Privacy: Village-level or GPS coordinates must be fuzzed or aggregated to mandal/district boundaries to protect farmer privacy.
2. Informed Consent: Photographs must be collected with farmer consent under state digital agriculture frameworks (Rythu Bharosa Kendras).
3. No Biased Recommendations: Biofuel refinery procurement pricing and logistics distance must be transparently communicated to ensure farmers achieve fair compensation above standard local usage values.
