# ==============================================================================
# AgriAI - Waste2Fuel: Leakage-Free Dataset Splitter
# ==============================================================================
"""
Dataset Splitter for AgriAI - Waste2Fuel.
Ensures zero data leakage by grouping records strictly on 'Group_ID'.
Allocates:
- 70% Training Split
- 15% Validation Split
- 15% Testing Split

Generates:
- dataset/processed/train.csv
- dataset/processed/validation.csv
- dataset/processed/test.csv
"""

import os
import sys
import csv
import random
from pathlib import Path
from collections import defaultdict

class DatasetSplitter:
    def __init__(self, dataset_path="dataset/cleaned/agriai_cleaned_dataset.csv", output_dir="dataset/processed"):
        self.dataset_path = Path(dataset_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def split_dataset(self, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42):
        assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Split ratios must sum to 1.0"
        
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            records = list(reader)
            fieldnames = reader.fieldnames

        grouped_records = defaultdict(list)
        for r in records:
            group_id = r.get("Group_ID", r.get("Image_ID"))
            grouped_records[group_id].append(r)

        groups = list(grouped_records.keys())
        random.seed(seed)
        random.shuffle(groups)

        total_groups = len(groups)
        n_train = max(1, int(round(total_groups * train_ratio)))
        n_val = max(1, int(round(total_groups * val_ratio)))
        
        train_groups = set(groups[:n_train])
        val_groups = set(groups[n_train:n_train + n_val])
        test_groups = set(groups[n_train + n_val:])

        if not test_groups and len(val_groups) > 1:
            popped = list(val_groups)[-1]
            val_groups.remove(popped)
            test_groups.add(popped)

        train_records = [r for g in train_groups for r in grouped_records[g]]
        val_records = [r for g in val_groups for r in grouped_records[g]]
        test_records = [r for g in test_groups for r in grouped_records[g]]

        for split_name, split_data in [("train", train_records), ("validation", val_records), ("test", test_records)]:
            split_file = self.output_dir / f"{split_name}.csv"
            with open(split_file, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(split_data)

        print(f"[SUCCESS] Dataset Splitting Complete (Seed={seed}):")
        print(f"  - Total Records: {len(records)} across {total_groups} physical groups")
        print(f"  - Train Split : {len(train_records)} records ({len(train_groups)} groups, {len(train_records)/len(records)*100:.1f}%) -> {self.output_dir / 'train.csv'}")
        print(f"  - Val Split   : {len(val_records)} records ({len(val_groups)} groups, {len(val_records)/len(records)*100:.1f}%) -> {self.output_dir / 'validation.csv'}")
        print(f"  - Test Split  : {len(test_records)} records ({len(test_groups)} groups, {len(test_records)/len(records)*100:.1f}%) -> {self.output_dir / 'test.csv'}")

        overlap = train_groups.intersection(val_groups) | train_groups.intersection(test_groups) | val_groups.intersection(test_groups)
        if overlap:
            print(f"[ERROR] Critical leakage detected in groups: {overlap}")
            return False
        else:
            print(f"[VERIFIED] Zero data leakage: No Group_ID spans multiple splits.")
            return True


if __name__ == "__main__":
    splitter = DatasetSplitter()
    splitter.split_dataset()
