# AgriAI Photo Dataset Release Rules

## Objective
Build a defensible 24-label agricultural-waste image dataset for computer-vision experiments.

## Counts
- 23 known agricultural-waste classes + `unknown_other` = 24 classifier labels.
- Minimum release gate: 100 verified images per class.
- Preferred first release: 150 verified images per class = 3,600 verified images.
- Long-term target: 500+ images per class where legitimate data collection permits.

## What counts as verified
An image can enter `cleaned`/training data only when:
1. The image is readable and technically valid.
2. The label matches the actual primary material.
3. The source and license/permission are recorded.
4. Provenance fields are truthful. Never invent capture date, device, district, village, farmer, GPS, or field-session information.
5. SHA256 is calculated from the exact stored file.
6. Exact duplicates are removed.
7. Near-duplicates are reviewed and grouped by capture session.
8. Group_ID prevents the same physical material/session from leaking across train/validation/test.
9. Resolution is at least 640x480 where possible; higher is preferred.
10. Human QA confirms the label.

## Source priority
1. Original field photographs collected by the project team with truthful metadata.
2. Publicly licensed photographs with a compatible license and complete attribution/provenance.
3. Other sources only after explicit permission and documented terms.
4. Synthetic/generated images must never be presented as real field evidence. If used for experiments, keep them in a separate synthetic dataset.

## Diversity target per class
Aim for a mixture of:
- field/farm and processing environments
- close, medium and wider views
- multiple camera devices
- different lighting/weather
- fresh/green and dry/brown conditions where biologically applicable
- different orientations and pile/bundle arrangements
- clean single-material examples and realistic background clutter
- multiple geographic locations and collection sessions

## Hard-negative protection
Keep visually similar materials as explicit evaluation/hard-negative data where appropriate. Examples include:
- rice straw vs wheat straw
- rice husk vs sawdust
- groundnut shell vs coconut shell
- sugarcane bagasse vs dry grass
- maize stalk vs sorghum stalk
- banana pseudostem vs banana leaf

Hard negatives are not additional classifier labels unless intentionally registered as labels.

## Folder rule
The folder name must match the canonical label. A file in `rice_husk/` must actually depict rice husk. Do not rename an image merely to make it pass validation.

## Metadata rule
Never replace unknown values with plausible values. Use `Unknown` or an empty approved field and mark provenance as unverified until the original source is checked.

## Release stages
- `raw`: original collected/downloaded files, untouched.
- `cleaned`: validated, deduplicated, provenance checked, label checked.
- `processed`: model-ready resized/normalized derivatives generated from cleaned data.
- `train/val/test`: group-aware splits generated only from cleaned data.

Recommended split: 70/15/15 by Group_ID, not random individual-image splitting.

## Final 100% release gate
The dataset is not called 100% complete until every class meets the minimum, every training image has verified provenance, duplicates/leakage are checked, metadata and hashes match the files, and the validator passes without critical errors.
