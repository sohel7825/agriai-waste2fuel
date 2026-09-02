"""Production release gate for the AgriAI image dataset.

Run from repository root:
    python dataset/scripts/ml_release_validator.py

This validator intentionally FAILS a production release when provenance is
missing/unverified or when image coverage is below the release threshold.
"""
from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "dataset"
META = DATASET / "metadata"
IMAGES = DATASET / "images"
PROCESSED = DATASET / "processed"

MIN_PER_CLASS = 100
PREFERRED_PER_CLASS = 150
MIN_W, MIN_H = 640, 480

REQUIRED = {
    "Image_ID", "Image_Path", "Label", "Source_URL", "License",
    "Data_Source_Type", "Group_ID", "SHA256_Hash", "Label_Status",
    "Provenance_Status", "QA_Status"
}
ALLOWED_SOURCE_TYPES = {"Public Dataset", "Real Field", "Synthetic/Demo", "Unknown"}
PRODUCTION_SOURCE_TYPES = {"Public Dataset", "Real Field"}


def read_csv(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    errors = []
    warnings = []

    labels_path = META / "class_index.csv"
    meta_path = META / "image_metadata.csv"
    if not labels_path.exists():
        errors.append(f"Missing {labels_path}")
        return report(errors, warnings)
    if not meta_path.exists():
        errors.append(f"Missing {meta_path}")
        return report(errors, warnings)

    labels = read_csv(labels_path)
    expected = [r["label"].strip() for r in sorted(labels, key=lambda x: int(x["class_index"]))]
    if len(expected) != 24 or expected[-1] != "unknown_other":
        errors.append("Class index must contain exactly 24 labels with unknown_other at index 23")

    rows = read_csv(meta_path)
    if rows:
        missing_cols = REQUIRED - set(rows[0])
        if missing_cols:
            errors.append("image_metadata.csv missing required production fields: " + ", ".join(sorted(missing_cols)))

    counts = Counter()
    ids = set()
    hashes = {}
    groups = {}
    physical_paths = set()

    for row in rows:
        image_id = row.get("Image_ID", "").strip()
        label = row.get("Label", "").strip()
        rel = row.get("Image_Path", "").strip()
        source_type = row.get("Data_Source_Type", "Unknown").strip()
        group = row.get("Group_ID", "").strip()

        if not image_id:
            errors.append("Blank Image_ID")
        elif image_id in ids:
            errors.append(f"Duplicate Image_ID: {image_id}")
        ids.add(image_id)

        if label not in expected:
            errors.append(f"Unregistered label '{label}' for {image_id}")
        counts[label] += 1

        if not rel:
            errors.append(f"Blank Image_Path for {image_id}")
            continue
        if rel in physical_paths:
            errors.append(f"Duplicate Image_Path: {rel}")
        physical_paths.add(rel)

        path = DATASET / rel
        if not path.exists():
            errors.append(f"Missing physical image: {rel}")
            continue

        try:
            with Image.open(path) as im:
                im.verify()
            with Image.open(path) as im:
                if im.width < MIN_W or im.height < MIN_H:
                    errors.append(f"Resolution below {MIN_W}x{MIN_H}: {image_id}")
        except Exception as exc:
            errors.append(f"Unreadable image {image_id}: {exc}")
            continue

        actual = sha256(path)
        recorded = row.get("SHA256_Hash", "").strip()
        if not recorded:
            errors.append(f"Missing SHA256_Hash: {image_id}")
        elif recorded != actual:
            errors.append(f"SHA256 mismatch: {image_id}")
        if actual in hashes:
            errors.append(f"Exact duplicate: {image_id} == {hashes[actual]}")
        else:
            hashes[actual] = image_id

        if source_type not in ALLOWED_SOURCE_TYPES:
            errors.append(f"Invalid Data_Source_Type '{source_type}': {image_id}")
        if source_type in PRODUCTION_SOURCE_TYPES:
            if not row.get("Source_URL", "").strip() or not row.get("License", "").strip():
                errors.append(f"Production source lacks URL/license: {image_id}")
        if row.get("Provenance_Status", "").strip().lower() != "verified":
            errors.append(f"Unverified provenance: {image_id}")
        if row.get("QA_Status", "").strip().lower() != "approved":
            errors.append(f"QA not approved: {image_id}")
        if row.get("Label_Status", "").strip().lower() != "verified":
            errors.append(f"Label not verified: {image_id}")
        if not group:
            errors.append(f"Missing Group_ID: {image_id}")
        else:
            groups.setdefault(group, set()).add(image_id)

    for label in expected:
        n = counts.get(label, 0)
        if n < MIN_PER_CLASS:
            errors.append(f"{label}: {n} images; minimum is {MIN_PER_CLASS}")
        elif n < PREFERRED_PER_CLASS:
            warnings.append(f"{label}: {n} images; preferred target is {PREFERRED_PER_CLASS}")

    # Check group leakage if manifests exist.
    split_groups = {}
    for split in ("train", "validation", "test"):
        p = PROCESSED / f"{split}.csv"
        if p.exists():
            split_groups[split] = {r.get("Group_ID", "").strip() for r in read_csv(p) if r.get("Group_ID", "").strip()}
    if len(split_groups) == 3:
        pairs = (("train", "validation"), ("train", "test"), ("validation", "test"))
        for a, b in pairs:
            overlap = split_groups[a] & split_groups[b]
            if overlap:
                errors.append(f"Group leakage {a}/{b}: {sorted(overlap)}")
    else:
        warnings.append("train.csv, validation.csv and test.csv are not all present; final split gate is pending")

    return report(errors, warnings, counts, len(rows))


def report(errors, warnings, counts=None, total=0) -> int:
    print("=" * 72)
    print("AgriAI ML PRODUCTION RELEASE VALIDATOR")
    print("=" * 72)
    print(f"Metadata records: {total}")
    if counts:
        for label, n in sorted(counts.items()):
            print(f"{label:30} {n:4}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")
    for e in errors[:50]:
        print("[ERROR]", e)
    for w in warnings[:50]:
        print("[WARN ]", w)
    status = "PASSED_VERIFIED" if not errors else "NOT_RELEASED"
    print("STATUS:", status)
    print("=" * 72)
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
