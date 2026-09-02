# AgriAI Dataset Release Status

**Release:** v0.1.0-dataset-framework  
**Production ML release:** NOT YET RELEASED

## What is complete

- 24-label production class contract (23 known + `unknown_other`)
- image metadata schema
- image naming standard
- photo collection checklist
- source-candidate tracking
- hard-negative evaluation concept
- validator with physical-image, hash, provenance, class-count, tabular-range and split-leakage checks
- group-aware train/validation/test policy
- release gates and ML dataset contract
- app-facing label vocabulary in `dataset/labels/waste_labels.csv`

## What is blocking a true 10/10 production release

1. The physical image collection is far below the required 100 images per class minimum.
2. The preferred target is 150 images per class (3,600 total).
3. Existing metadata contains provenance records that must be independently verified before being called field/public-dataset evidence.
4. The final train/validation/test image manifests must be generated from the verified image collection.
5. A complete independent test set must be held out from training decisions.
6. Final model training and evaluation must be performed only after the image release gates pass.

## Minimum production target

**24 classes x 100 verified images = 2,400 verified images.**

## Preferred strong target

**24 classes x 150 verified images = 3,600 verified images.**

## Long-term target

**500+ verified images per class** for stronger robustness across farms, devices, seasons and environments.

## Integrity rule

Do not fill missing images with AI-generated photographs, copied duplicates, fabricated metadata or invented provenance. Synthetic images can be maintained in a separate `Synthetic/Demo` pool for pipeline testing, but they must never be counted as real field/public training evidence.

## App readiness vs ML readiness

The app can be developed against the 24-label contract before the production image set is complete. The image classifier should remain explicitly marked as **prototype/development** until the release gates pass.
