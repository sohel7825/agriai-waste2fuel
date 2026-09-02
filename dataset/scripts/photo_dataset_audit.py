#!/usr/bin/env python3
"""Audit AgriAI raw image folders for ML dataset readiness.

Usage:
    python dataset/scripts/photo_dataset_audit.py
    python dataset/scripts/photo_dataset_audit.py --root dataset/images/raw --out dataset/metadata/photo_audit_report.csv

The script never invents metadata. It only inspects files that actually exist.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
from collections import defaultdict
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow is required. Install with: pip install pillow")

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MIN_W, MIN_H = 640, 480
TARGET = 150
MINIMUM = 100

CLASSES = [
    "rice_straw", "rice_husk", "rice_bran", "maize_stalk", "maize_cob",
    "sugarcane_bagasse", "sugarcane_trash", "cotton_stalk", "cotton_waste",
    "chilli_stem", "groundnut_shell", "groundnut_haulm", "banana_pseudostem",
    "banana_leaf", "tobacco_stalk", "pulse_residue", "soybean_residue",
    "sunflower_residue", "turmeric_residue", "mango_waste", "coconut_husk",
    "coconut_shell", "vegetable_residue", "unknown_other",
]


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def audit(root: Path):
    rows = []
    hash_to_paths = defaultdict(list)

    for label_dir in sorted(root.iterdir()) if root.exists() else []:
        if not label_dir.is_dir():
            continue
        label = label_dir.name
        for path in sorted(label_dir.rglob("*")):
            if not path.is_file():
                continue
            ext = path.suffix.lower()
            row = {
                "Image_Path": str(path).replace("\\", "/"),
                "Label": label,
                "Extension": ext,
                "Width": "",
                "Height": "",
                "SHA256": "",
                "Open_Status": "FAIL",
                "Resolution_Status": "FAIL",
                "Duplicate_Status": "UNKNOWN",
                "Overall_Status": "REJECT",
                "Notes": "",
            }
            if ext not in ALLOWED_EXT:
                row["Notes"] = "Unsupported image extension"
                rows.append(row)
                continue
            try:
                with Image.open(path) as im:
                    im.verify()
                with Image.open(path) as im:
                    w, h = im.size
                row["Width"], row["Height"] = w, h
                row["Open_Status"] = "PASS"
                row["Resolution_Status"] = "PASS" if w >= MIN_W and h >= MIN_H else "FAIL"
                digest = sha256(path)
                row["SHA256"] = digest
                hash_to_paths[digest].append(path)
                if row["Resolution_Status"] == "FAIL":
                    row["Notes"] = f"Below minimum {MIN_W}x{MIN_H}"
                else:
                    row["Overall_Status"] = "PASS"
            except Exception as exc:
                row["Notes"] = f"Unreadable/corrupt: {type(exc).__name__}"
            rows.append(row)

    for row in rows:
        if row["SHA256"] and len(hash_to_paths[row["SHA256"]]) > 1:
            row["Duplicate_Status"] = "DUPLICATE"
            row["Overall_Status"] = "REJECT"
            row["Notes"] = (row["Notes"] + "; " if row["Notes"] else "") + "Exact duplicate SHA256"
        elif row["SHA256"]:
            row["Duplicate_Status"] = "UNIQUE"
        else:
            row["Duplicate_Status"] = "UNKNOWN"

    return rows


def write_report(rows, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    fields = list(rows[0].keys()) if rows else [
        "Image_Path", "Label", "Extension", "Width", "Height", "SHA256",
        "Open_Status", "Resolution_Status", "Duplicate_Status", "Overall_Status", "Notes"
    ]
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def print_summary(rows):
    counts = defaultdict(int)
    for r in rows:
        counts[r["Label"]] += 1
    print("\nAgriAI Photo Dataset Audit")
    print("=" * 72)
    print(f"Images scanned: {len(rows)}")
    print(f"Minimum per class: {MINIMUM} | Preferred: {TARGET}")
    print("\nClass status:")
    for label in CLASSES:
        n = counts[label]
        status = "READY" if n >= TARGET else "MINIMUM" if n >= MINIMUM else "NEEDS PHOTOS"
        print(f"  {label:24s} {n:4d}  {status}")
    extras = sorted(set(counts) - set(CLASSES))
    if extras:
        print("\nUNREGISTERED FOLDERS:")
        for label in extras:
            print(f"  {label}: {counts[label]}")
    bad = sum(r["Overall_Status"] != "PASS" for r in rows)
    duplicates = sum(r["Duplicate_Status"] == "DUPLICATE" for r in rows)
    print(f"\nRejected/needs review: {bad}")
    print(f"Exact duplicate files: {duplicates}")
    print("\nNote: this audit does not prove provenance, licensing, label correctness, Group_ID quality, or near-duplicate leakage. Those still require metadata/QA review.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("dataset/images/raw"))
    parser.add_argument("--out", type=Path, default=Path("dataset/metadata/photo_audit_report.csv"))
    args = parser.parse_args()
    rows = audit(args.root)
    write_report(rows, args.out)
    print_summary(rows)
    print(f"\nReport written to: {args.out}")


if __name__ == "__main__":
    main()
