# AgriAI – Waste2Fuel Multimodal Dataset Suite

## Status

The repository now contains a structured multimodal dataset framework: 24 registered image classes (23 agricultural-waste classes + `unknown_other`), hard-negative folders, image metadata, pathway labels, a data dictionary, validation/splitting scripts, and decision-engine integration.

**Important:** the folder structure and metadata templates are ready, but the project must not claim that a large collection of real farmer photographs exists unless the image files and their provenance have actually been collected and verified. Generated/demo images are not substitutes for training evidence.

## What the AI must do

```text
Farmer photo
    ↓
Image quality check
    ↓
Waste classifier
    ↓
Waste type + confidence
    ↓
Basic farmer questions
    ↓
Waste / logistics characteristics
    ↓
Decision engine
    ↓
Primary pathway + alternative + explanation
    ↓
Farmer advisory + aggregated government signal
```

Ethanol/biofuel is the primary project focus, but the decision engine must not force ethanol for every residue. It can recommend biogas, briquettes/pellets, compost, vermicompost, mushroom cultivation, animal feed, industrial biomass use, or additional assessment where those are more appropriate.

## Registered image classes

1. rice_straw
2. rice_husk
3. rice_bran
4. maize_stalk
5. maize_cob
6. sugarcane_bagasse
7. sugarcane_trash
8. cotton_stalk
9. cotton_waste
10. chilli_stem
11. groundnut_shell
12. groundnut_haulm
13. banana_pseudostem
14. banana_leaf
15. tobacco_stalk
16. pulse_residue
17. soybean_residue
18. sunflower_residue
19. turmeric_residue
20. mango_waste
21. coconut_husk
22. coconut_shell
23. vegetable_residue
24. unknown_other

Hard-negative comparison folders are maintained separately for visually similar materials.

## Dataset layers

- `images/` – image assets, organized by class.
- `metadata/image_metadata.csv` – per-image provenance and annotation metadata.
- `metadata/image_metadata_template.csv` – safe template for adding new images.
- `metadata/waste_metadata.csv` – waste characteristics where supported.
- `metadata/data_dictionary.csv` – field definitions, units and allowed values.
- `labels/waste_labels.csv` – registered image classes and pathway defaults.
- `labels/pathway_labels.csv` – utilization pathway registry.
- `raw/` – source records before cleaning.
- `cleaned/` – validated/standardized records.
- `processed/` – train/validation/test records.

## Image collection standard

For a useful prototype, aim for 100–200 verified photographs per class first, then expand toward 500+ per class. These are collection targets, not existing-image claims.

Each real image should vary naturally across:

- lighting and time of day;
- camera/device;
- distance and angle;
- fresh/dry/partially decomposed condition;
- field, farmyard, storage and processing backgrounds;
- clean and realistic mixed/dirty conditions.

Photos from the same physical pile/session must share a `Group_ID` and remain in the same data split.

## Provenance and scientific integrity

`Data_Source_Type` must distinguish Government, Research Paper, Farmer Survey, Field Measurement, Industry, Public Dataset and Synthetic/Demo.

Do not fabricate farmer survey responses, laboratory composition values, fuel yields, government statistics, citations or field locations. If a value is not traceable, use `Unknown`/missing rather than inventing it.

Cellulose percentage is **not** ethanol yield. Lignocellulosic ethanol requires process steps such as pretreatment, hydrolysis and fermentation, and actual yield depends on feedstock and process conditions. The prototype therefore uses qualitative suitability unless verified experimental yield data is available.

## Image model

Recommended progression:

1. Start with transfer learning using a lightweight image classifier.
2. Train only on verified, correctly labeled images.
3. Keep validation/test images separate from the original capture group.
4. Measure per-class precision, recall, F1 and confusion matrix.
5. Add an `Unknown/Other` outcome and an abstention path for low confidence.
6. Test hard negatives separately.

Prototype confidence thresholds can be tuned experimentally; they must not be described as clinically/scientifically validated thresholds.

## Privacy

Obtain consent for identifiable farmer photographs. Avoid storing faces, phone numbers and exact household coordinates unless genuinely required. Prefer district/mandal-level aggregation for demonstrations.

## Commands

```bash
python image_dataset_builder.py
python dataset_validator.py
python dataset_splitter.py
python decision_engine.py
```

Run the validator after adding or replacing image assets. Do not mark an image `Expert_Verified` until a person has actually reviewed it.

## Definition of a 10/10 dataset

A 10/10 implementation is not simply a large CSV. It has:

- real, traceable image assets;
- accurate class labels;
- balanced and diverse images;
- hard negatives and an unknown class;
- complete metadata and provenance;
- scientifically defensible reference values;
- leakage-free Group_ID splits;
- automated validation and duplicate detection;
- transparent recommendation logic;
- privacy/consent controls;
- reproducible training and evaluation.
