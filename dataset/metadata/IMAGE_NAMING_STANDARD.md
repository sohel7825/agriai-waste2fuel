# Image Naming Standard

Use stable IDs rather than descriptive filenames that can change with class corrections.

## Recommended format
`IMG######.jpg`

Example:
- `IMG000001.jpg`
- `IMG000002.jpg`

The class is stored in metadata and the class directory, not encoded as the only source of truth in the filename.

## Folder structure
```text
dataset/images/
  raw/
    rice_straw/
    rice_husk/
    rice_bran/
    maize_stalk/
    maize_cob/
    ...
    unknown_other/
  cleaned/
  processed/
```

## Rules
- One primary agricultural-waste class per training image.
- Mixed-waste photographs must be marked explicitly and reviewed before training.
- Do not rename an image merely to hide an uncertain label.
- Preserve the original source filename in metadata when available.
- Keep `Image_ID` unique across the entire repository.
- Record SHA256 after the final file is stored.
- Record `Group_ID` for capture sessions so related images cannot leak across splits.
