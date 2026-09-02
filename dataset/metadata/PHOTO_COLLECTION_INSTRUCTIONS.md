# AgriAI Photo Collection Instructions

## Goal
Build a verified image dataset for the 24 classifier labels in `ALL_24_CLASS_PHOTO_MASTER_PLAN.csv`.

Preferred target: **150 verified real photographs per class (3,600 total)**.
Minimum release target: **100 verified photographs per class (2,400 total)**.

## For every photograph
1. Photograph one primary waste type.
2. Keep the waste clearly visible and in focus.
3. Capture different distances, angles, lighting conditions, backgrounds and locations.
4. Prefer real post-harvest residue for waste labels.
5. Do not intentionally stage the same object repeatedly to inflate the count.
6. Do not include unrelated waste as the primary object.
7. If the image is mixed waste, mark `Is_Mixed_Waste=Yes` and review whether it belongs in training.
8. Record the original source, license/permission, date and location when available.
9. Never guess missing provenance. Use `Unknown`/`Pending` until verified.
10. Compute SHA256 after the final image file is stored.
11. Assign a `Group_ID` to photos from the same physical sample/session so they cannot leak across train/validation/test.

## Recommended capture set per class
For each class, aim for a mixture of:
- 30+ field/background contexts
- 30+ close-up views
- 30+ medium-distance views
- 20+ different angles
- 20+ different lighting/background conditions
- 20+ different physical samples or collection sessions

These are collection targets, not permission to fabricate diversity. If a category cannot naturally provide this diversity, document the limitation.

## Label-specific rules
Use `ALL_24_CLASS_PHOTO_MASTER_PLAN.csv` as the authoritative label-scope reference. In particular:
- `rice_husk` must remain separate from rice straw and sawdust.
- `rice_bran` must be raw bran, not rice-bran oil or processed products only.
- `maize_stalk` should emphasize harvested/stover material.
- `maize_cob` should emphasize waste/used cobs rather than intact food corn.
- `sugarcane_bagasse` must be separated from sugarcane field trash.
- `groundnut_shell` must be separated from `groundnut_haulm`.
- `banana_pseudostem` must be separated from `banana_leaf`.
- `coconut_husk` must be separated from `coconut_shell`.
- `unknown_other` is a rejection/catch-all class, not a place to put uncertain known-class images.

## Release rule
A photograph is not counted toward the verified target until label QA, provenance QA, image readability, duplicate checks, SHA256 and Group_ID checks pass.

The repository must not claim that 2,400/3,600 photographs exist until the actual files and audit records are present and validated.
