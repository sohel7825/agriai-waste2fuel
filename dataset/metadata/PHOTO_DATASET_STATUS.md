# AgriAI Photo Dataset Status

## Scope
24 classifier labels = 23 known agricultural-waste classes + `unknown_other`.

## Targets
- Minimum release: 100 verified images per class = 2,400 images.
- Preferred release: 150 verified images per class = 3,600 images.
- Long-term target: 500+ verified images per class.

## Release gate
An image counts only when all required checks pass:
1. Correct class label.
2. Source and license/provenance are traceable.
3. File opens successfully.
4. Minimum recommended resolution is 640x480.
5. SHA256 hash is recorded and matches the file.
6. No exact duplicate.
7. No unacceptable near-duplicate leakage across splits.
8. Group_ID prevents the same capture/session from crossing train/validation/test.
9. Metadata does not contain guessed dates, devices, locations, or farmer information.
10. QA status is approved.

## Critical integrity rule
Do not manufacture photographs, provenance, capture dates, devices, locations, or farmer details to reach the target count. Missing information must be marked unknown/unverified until independently confirmed.

## Dataset composition
Recommended group-aware split: 70% train / 15% validation / 15% test.

## Current state
The repository contains the dataset framework and collection manifests, but the photo dataset must not be described as complete until the actual images pass the release gate.

## Class order
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

Hard negatives are evaluation material and are not additional classifier labels.
