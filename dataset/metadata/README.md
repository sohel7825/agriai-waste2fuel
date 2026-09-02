# Dataset Metadata Governance

Metadata is part of the dataset, not an afterthought.

## Provenance categories

Use exactly one `Data_Source_Type` value:

- Government
- Research Paper
- Farmer Survey
- Field Measurement
- Industry
- Public Dataset
- Synthetic/Demo

Never label generated, simulated, or unverified records as real field measurements.

## Verification states

- `Unannotated`: not yet labeled by a reviewer.
- `Template_Annotated`: labeled by the ingestion/template pipeline; not expert verified.
- `Expert_Verified`: independently reviewed against the image and available source information.

## Image identity

`Image_ID` identifies the asset. `SHA256_Hash` detects exact duplicate files. `Group_ID` identifies photos from the same physical pile/session so that related photos cannot leak across train/validation/test splits.

## Scientific values

Cellulose, hemicellulose, lignin, sugar and ash values must come from a traceable reference, measurement, or be left unavailable. Do not infer laboratory measurements from an image. Do not treat qualitative pathway suitability as measured fuel yield.

## Location privacy

Prefer district/mandal-level location for demonstrations. Store exact GPS only when genuinely required, consented, and protected; never expose unnecessary farmer personal information.
