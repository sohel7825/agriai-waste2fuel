"""Build a conservative ML manifest from verified image metadata.

Run from repository root:
    python dataset/scripts/build_ml_manifest.py

Only rows that are label-verified, provenance-verified, QA-approved and backed
by an existing image are eligible. Splitting is deterministic and group-aware.
This script does not invent metadata or photographs.
"""
from __future__ import annotations

import csv
import hashlib
from collections import defaultdict
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "dataset"
META = DATASET / "metadata" / "image_metadata.csv"
OUT = DATASET / "processed"
MIN_W, MIN_H = 640, 480
SPLITS = (("train", 0.70), ("validation", 0.15), ("test", 0.15))


def rows(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def hash_file(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def eligible(row):
    return (
        row.get("Label_Status", "").strip().lower() == "verified"
        and row.get("Provenance_Status", "").strip().lower() == "verified"
        and row.get("QA_Status", "").strip().lower() == "approved"
        and row.get("Group_ID", "").strip()
    )


def choose_split(group_id):
    digest = int(hashlib.sha256(group_id.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
    if digest < 0.70:
        return "train"
    if digest < 0.85:
        return "validation"
    return "test"


def main():
    if not META.exists():
        raise SystemExit(f"Missing {META}")
    source = rows(META)
    candidates = []
    seen_hashes = set()
    for r in source:
        if not eligible(r):
            continue
        path = DATASET / r["Image_Path"].strip()
        if not path.exists():
            continue
        try:
            with Image.open(path) as im:
                im.verify()
            with Image.open(path) as im:
                if im.width < MIN_W or im.height < MIN_H:
                    continue
        except Exception:
            continue
        actual = hash_file(path)
        if actual in seen_hashes:
            continue
        seen_hashes.add(actual)
        r = dict(r)
        r["SHA256_Hash"] = actual
        r["Split"] = choose_split(r["Group_ID"].strip())
        candidates.append(r)

    OUT.mkdir(parents=True, exist_ok=True)
    fields = ["Image_ID", "Image_Path", "Label", "Group_ID", "SHA256_Hash", "Split"]
    for split in ("train", "validation", "test"):
        selected = [r for r in candidates if r["Split"] == split]
        with (OUT / f"{split}.csv").open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows({k: r.get(k, "") for k in fields} for r in selected)

    with (OUT / "ml_manifest.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows({k: r.get(k, "") for k in fields} for r in candidates)

    print(f"Eligible images: {len(candidates)}")
    for split, _ in SPLITS:
        print(f"{split}: {sum(r['Split'] == split for r in candidates)}")
    print("Manifest generation complete. This does not imply production release readiness.")


if __name__ == "__main__":
    main()
