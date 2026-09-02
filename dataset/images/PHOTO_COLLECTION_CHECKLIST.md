# AgriAI Photo Collection Checklist

## Goal
Build a trustworthy agricultural-waste image dataset for computer-vision experiments.

### First release target
- 24 classifier labels total: 23 known waste classes + `unknown_other`
- Minimum: **100 verified images per label**
- Preferred: **150 verified images per label**
- Long-term: **500+ images per label**
- 150 × 24 = **3,600 verified images** for the preferred first release

## 1. What counts as a valid training image?
A photograph can enter the verified training set only when:

- The image is readable and not corrupted.
- The primary waste material is actually visible.
- The class label is supported by visual evidence.
- The source is traceable.
- The reuse license/permission is recorded when the image is not our own field photograph.
- The original source URL is recorded for public-source images.
- The image has a SHA-256 hash.
- The image is not an exact duplicate.
- Near-duplicate images from the same capture session are kept in the same group and never split across train/validation/test.
- Metadata does not contain invented dates, locations, devices, farmers, or capture information.

## 2. Preferred photo diversity
For each class, collect a mixture of:

- Field/farm background
- Storage/yard background
- Close-up views
- Medium-distance views
- Whole-material views
- Different camera angles
- Different lighting conditions
- Different phones/cameras
- Fresh/green and dry/brown states where the material naturally occurs in both forms
- Clean material and realistic mixed-background conditions

Do not manufacture diversity with image-generation tools and then describe those images as real field photographs.

## 3. Recommended 150-image class composition
Use this as a guide, not a rigid rule:

- 50 field/farm context images
- 30 close-up/detail images
- 20 different angles/distances
- 20 lighting/background variations
- 15 fresh/wet or naturally variable-condition images where applicable
- 15 dry/processed/aged-condition images where applicable

A single physical pile or capture session should not produce 150 near-identical training examples.

## 4. Source policy
### A. Own field photographs
Record:
- Collection date
- State
- District
- Mandal/village when appropriate
- Device only if actually known
- Capture type
- Group/session ID
- Photographer/collector ID where appropriate

### B. Public datasets / public repositories
Record:
- Original source URL
- Author/uploader when available
- License
- Original publication/capture date when available
- Download date
- Any required attribution
- Whether modifications were made

Do not copy an image into the dataset simply because a search engine displays it.

### C. Unknown provenance
Keep it out of the verified training set until provenance is resolved.

## 5. Metadata required before verification
Recommended fields:

`Image_ID, Image_Path, Label, Source_URL, License, Data_Source_Type, Original_Capture_Date, Collection_Date, State, District, Mandal, Village, Device, Capture_Type, Lighting, Background, View_Angle, Image_Condition, Image_Quality, Is_Mixed_Waste, Primary_Object, Group_ID, SHA256_Hash, Perceptual_Hash, Label_Status, Provenance_Status, QA_Status, Reviewer, Notes`

Unknown information must be recorded as `Unknown` rather than guessed.

## 6. Duplicate and leakage rules
- Exact duplicate SHA-256 hashes are rejected.
- Visually near-identical photos should be grouped using a perceptual hash or manual review.
- Photos from the same physical capture session should share a `Group_ID`.
- Never place photos from one capture session in both training and validation/test sets.
- Split only after grouping.
- Recommended initial split: 70% train / 15% validation / 15% test by Group_ID.

## 7. Quality gate
An image becomes `VERIFIED` only after all applicable checks pass:

- [ ] Opens successfully
- [ ] Correct class
- [ ] Sufficient resolution
- [ ] Traceable provenance
- [ ] License/permission recorded
- [ ] No exact duplicate
- [ ] No unacceptable near duplicate
- [ ] Group_ID assigned
- [ ] Metadata complete or explicitly marked Unknown
- [ ] Reviewer/QA status recorded

## 8. Important rule for AgriAI
The repository must never claim that a photograph is a real farmer/field photograph when its origin is unknown or synthetic.

**Truthful metadata is more important than reaching 3,600 images quickly.**

## 9. Current collection order
1. `rice_straw`
2. `rice_husk`
3. `rice_bran`
4. `maize_stalk`
5. `maize_cob`
6. `sugarcane_bagasse`
7. `sugarcane_trash`
8. `cotton_stalk`
9. `cotton_waste`
10. `chilli_stem`
11. `groundnut_shell`
12. `groundnut_haulm`
13. `banana_pseudostem`
14. `banana_leaf`
15. `tobacco_stalk`
16. `pulse_residue`
17. `soybean_residue`
18. `sunflower_residue`
19. `turmeric_residue`
20. `mango_waste`
21. `coconut_husk`
22. `coconut_shell`
23. `vegetable_residue`
24. `unknown_other`

Hard-negative categories are evaluation material and should not automatically become additional classifier labels.
