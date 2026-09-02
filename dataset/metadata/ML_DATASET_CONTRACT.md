# AgriAI ML Dataset Contract

## Purpose
This contract defines the exact dataset requirements for training and deploying the AgriAI agricultural-waste image classifier and downstream decision engine.

## Class space
The production classifier has **24 labels**:

- 23 known agricultural-waste classes
- `unknown_other` as the rejection/unknown class

Hard negatives are evaluation material and are **not** additional production labels.

## Release targets

| Gate | Required | Preferred |
|---|---:|---:|
| Images per class | 100 | 150 |
| Total images | 2,400 | 3,600 |
| Image resolution | >= 640x480 | >= 1280x720 |
| Exact duplicates | 0 | 0 |
| Group leakage across splits | 0 | 0 |
| Provenance | traceable | traceable + license |
| Label QA | reviewed | expert-reviewed |
| Unknown/rejection set | required | diverse and difficult |

## Image requirements
Each training image must:

1. contain one primary target class;
2. have a traceable source or documented field collection;
3. have a valid license when sourced externally;
4. be readable and not corrupted;
5. meet the minimum resolution;
6. have a SHA-256 hash;
7. have a stable `Image_ID`;
8. have a `Group_ID` representing the capture session/source group;
9. pass label and quality QA;
10. not be an exact or unacceptable near-duplicate of an image in another split.

## Diversity requirements
For each known class, collect examples across:

- fresh/green and dry/brown appearance where applicable;
- field, farmyard, storage and processing contexts;
- different backgrounds;
- different lighting conditions;
- different devices/cameras;
- close, medium and wider views;
- multiple angles;
- multiple farms/locations and capture sessions;
- different sizes, shapes and moisture conditions;
- visually confusing negatives.

## Split policy
Use a **group-aware 70/15/15 train/validation/test split**. Images from the same physical capture session, source group, burst sequence, or near-duplicate family must remain in the same split.

## Provenance integrity
Never invent:

- source URLs;
- licenses;
- capture dates;
- devices;
- villages/farms/farmer identities;
- expert verification;
- field measurements.

If provenance cannot be independently confirmed, use `Unknown` / `Unverified` and keep the record out of the production release until verified.

## Important current status
The repository contains the dataset framework, labels, metadata structure, validator and a small existing image set, but it must **not** be represented as a 100%-ready production image dataset until the physical image collection reaches the release gates above and the validator returns `PASSED_VERIFIED`.

A small dataset can still be used for an app prototype or pipeline smoke test, but model accuracy claims must not be treated as production performance.
