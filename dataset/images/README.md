# Agricultural-Waste Image Collection

This directory contains image-classification classes for AgriAI – Waste2Fuel.

## Important provenance rule

Do not treat a filename, metadata row, or generated placeholder as proof that a photograph is a real field photograph. Every real image must have a traceable source and annotation record.

For production-quality training data, collect photographs with permission and record:

- Image_ID
- Waste_Type / Label
- Crop
- District (or privacy-safe location)
- Group_ID for the physical pile/capture session
- Capture context, lighting, background and view angle
- Image quality
- Source type and source/license
- Annotation status
- SHA-256 hash

## Recommended collection target

Start with 100–200 verified photographs per class for a prototype and expand toward 500+ per class as collection capacity grows. The target is a planning goal, not a claim that these images already exist.

## Image quality

Prefer original smartphone photographs with enough resolution to show texture and structure. Include realistic variation: close-up, medium distance, bulk pile, different lighting, dry/fresh states and field/farmyard backgrounds.

## Hard negatives

Collect visually similar materials deliberately, such as rice straw vs wheat straw and groundnut shell vs coconut shell. Keep hard-negative evaluation images separate from training when appropriate.

## Privacy

Do not store unnecessary faces, phone numbers, exact home coordinates or other personal information. Obtain consent where people or identifiable private locations are visible.
