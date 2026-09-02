# AgriAI Image Dataset

## Purpose

This directory contains image data for agricultural-waste identification. Images are organized by waste class and are intended for computer-vision experiments.

## Dataset quality rules

Each training image must have:

- A valid class label matching the class directory.
- A traceable source/provenance record in `dataset/metadata/image_metadata.csv`.
- A truthful `Image_Source` and `Data_Source_Type` value.
- No fabricated field location, capture date, farmer identity, or measurement.
- No duplicate or near-duplicate image across train/validation/test splits.
- A stable `Group_ID` so images from the same original capture/session/source are kept in one split.
- A SHA-256 hash for integrity and duplicate detection.

## Target image coverage

The target for the first serious training release is **at least 100 verified images per class**, with **150 images per class preferred**. The long-term expansion target is 500+ images per class.

For 24 classes, the preferred first release is therefore **3,600 verified images**.

## Image diversity requirements

Where legitimately available, each class should include variation in:

- Farm/background conditions
- Lighting and weather
- Camera/phone models
- Distance and viewing angle
- Fresh/green and dry/brown appearance where applicable
- Whole-residue and close-up views
- Different geographic locations and collection sessions

These are targets, not permission to invent or synthetically relabel data.

## Provenance policy

Images may be collected directly, obtained from a public dataset/archive with compatible licensing, or otherwise used only when the source permits the intended use. The metadata must identify the real source.

Do **not** describe an image as a field photograph, field measurement, farmer-collected image, or open-archive image unless that description is factually true and documented.

## Current status

The folder structure and metadata framework are prepared, but this directory is **not declared 100% complete** until the required number of verified images has been collected, provenance-checked, deduplicated, and split without leakage.

## Recommended split

Use a group-aware split such as:

- 70% train
- 15% validation
- 15% test

The split must be performed by `Group_ID`, not by randomly splitting individual near-identical images.

## Quality gate before model training

1. Verify every image opens correctly.
2. Verify class label.
3. Verify source/provenance.
4. Remove exact duplicates using SHA-256.
5. Detect near duplicates perceptually.
6. Check image resolution and corruption.
7. Check class balance.
8. Check Group_ID leakage.
9. Create train/validation/test manifests.
10. Record the dataset version and validation report.
