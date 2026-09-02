# AgriAI ML Dataset

## Production objective
AgriAI classifies agricultural waste from a farmer-uploaded photograph and passes the predicted class to the downstream advisory/decision engine.

## Canonical classes
The production classifier uses exactly 24 labels: 23 known agricultural-waste classes plus `unknown_other`. The canonical vocabulary is maintained in `dataset/labels/waste_labels.csv`.

## Dataset targets
- Minimum: 100 verified images/class = 2,400 images.
- Preferred first production release: 150 verified images/class = 3,600 images.
- Long-term robustness target: 500+ verified images/class.

## Quality gates
Production images must be readable, correctly labeled, provenance/license verified, QA approved, >=640x480, SHA-256 checked, deduplicated and assigned a Group_ID. Same capture session or near-duplicate family must never cross train/validation/test.

## Split
Use the deterministic group-aware manifest builder:

```bash
python dataset/scripts/build_ml_manifest.py
```

The intended split is approximately 70% train / 15% validation / 15% test. Split assignment is based on Group_ID, not individual image randomness.

## Release validation

```bash
python dataset/scripts/ml_release_validator.py
```

A production release is valid only when the validator returns `PASSED_VERIFIED` with zero critical errors.

## Important integrity rule
Do not fabricate photographs, dates, devices, locations, farmer information, source URLs, licenses or expert verification. Synthetic/demo images may be used for pipeline testing only and must remain separate from real training evidence.

## Recommended model pipeline
1. Image upload/capture.
2. Image validation and preprocessing.
3. Transfer-learning image classifier.
4. Confidence/rejection threshold.
5. `unknown_other` fallback for uncertain/non-target material.
6. Predicted waste label.
7. Decision engine maps the label plus user-provided context to practical pathways.
8. Farmer advisory, videos and facility/logistics information are shown by the application.

The classifier should not make unsupported claims about chemical composition, ethanol yield, fuel quality, market price or safety from an image alone. Those values belong to the structured advisory/decision layer and should be sourced or field-verified separately.

## Current release status
This repository contains the ML contract, metadata framework and validation tooling. It is **not** a production image release until the physical image collection satisfies the required gates.
