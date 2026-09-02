# AgriAI – Waste2Fuel: Provenance Audit Gate

## Audit date
2026-09-02

## Why this file exists
The repository contains image metadata records that describe some assets as public-dataset, field-measurement, real-photograph, or expert-verified. Those labels are only valid when the corresponding image file, original source, licence/permission, and verification evidence can be independently traced.

A CSV row is **not evidence that an image exists**.

## Current audit result
**STATUS: COLLECTION / SOURCE VERIFICATION REQUIRED**

The repository structure is ready, but the GitHub directory listing currently shows the `dataset/images/` directory without image assets. Therefore the metadata catalogue must not be treated as proof that the listed photographs are physically present or verified.

## Rules before an image becomes training data

1. The image file must exist at `Image_Path`.
2. The image must open successfully and meet the minimum resolution standard.
3. `SHA256_Hash` must be generated from the actual file.
4. `Image_Source` must identify the real source.
5. Public images require a traceable URL/source record and compatible licence.
6. Farmer photographs require consent when a person is identifiable.
7. `Annotation_Status=Expert_Verified` only after an actual qualified reviewer checks the image.
8. `Data_Confidence=High` only when provenance and label evidence support it.
9. `Group_ID` must identify the physical pile/capture session to prevent train/test leakage.
10. Synthetic/demo images must remain explicitly tagged and must never be presented as real field photographs.

## Recommended evidence record

For every external/public image, maintain:

- source URL or DOI;
- licence;
- original creator/owner when available;
- download/access date;
- local filename;
- SHA-256 hash;
- class label;
- reviewer;
- verification date;
- notes about cropping or preprocessing.

For every farmer photograph, maintain:

- consent status;
- broad location only unless exact coordinates are genuinely required;
- capture date;
- device type;
- class label;
- reviewer;
- SHA-256 hash.

## Recommended first collection target

Start with **100 verified photographs per class** for the 23 core classes plus a meaningful `unknown_other` set. That gives a target of at least 2,400 images including unknown material. Expand toward 200–500+ images per class only after the first collection is clean and balanced.

This is a target, not a claim that these images already exist.

## External reference note

Public agricultural-residue datasets can support contextual biomass/resource analysis, but they should not automatically be treated as image-classification training data. For example, the World Bank's Pakistan biomass feedstock dataset provides crop-residue information and is licensed CC BY 4.0, while a separate Roboflow crop-residue classifier contains image classes such as maize stover, paddy residue, sugarcane trash and wheat stubble. These resources require their own licence/source review before reuse.

## Final gate

Do not train or report model accuracy from metadata-only rows. The dataset becomes training-ready only after physical image existence, provenance, licensing/consent, labels, hashes, and leakage-free splits have been verified.
