# ==============================================================================
# AgriAI - Waste2Fuel: Master Dataset Validator
# ==============================================================================
import sys
import csv
import hashlib
from pathlib import Path
from PIL import Image
from collections import Counter

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

MIN_IMAGES_PER_CLASS = 100
PREFERRED_IMAGES_PER_CLASS = 150
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "JPG"}
ALLOWED_SOURCE_TYPES = {
    "Public Dataset",
    "Real Field",
    "Synthetic/Demo",
    "Unknown"
}

class DatasetValidator:
    def __init__(self, base_dir=None):
        self.base_dir = Path(__file__).resolve().parent if base_dir is None else Path(base_dir)
        self.dataset_dir = self.base_dir / "dataset"
        self.images_dir = self.dataset_dir / "images"
        self.metadata_dir = self.dataset_dir / "metadata"
        self.raw_dir = self.dataset_dir / "raw"
        self.cleaned_dir = self.dataset_dir / "cleaned"
        self.processed_dir = self.dataset_dir / "processed"
        self.labels_dir = self.dataset_dir / "labels"

    def run_full_validation(self):
        print("=" * 80)
        print("          AgriAI - Waste2Fuel Multimodal Dataset Validation Suite")
        print("=" * 80)

        results = {
            "total_images": 0, "valid_images": 0, "invalid_images": 0,
            "duplicate_hashes": 0, "total_classes": 0,
            "images_per_class": Counter(), "missing_metadata_errors": 0,
            "data_leakage_errors": 0, "numeric_range_errors": 0,
            "path_label_mismatches": 0, "provenance_errors": 0,
            "missing_class_minimums": 0, "status": "PASSED"
        }

        # 1. Registered classes
        waste_labels_file = self.labels_dir / "waste_labels.csv"
        if not waste_labels_file.exists():
            print(f"[FATAL] Missing waste labels file: {waste_labels_file}")
            results["status"] = "FAILED"
            return results

        valid_folders = set()
        with open(waste_labels_file, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                valid_folders.add(row["Folder_Name"])
        results["total_classes"] = len(valid_folders)

        # 2. Image metadata + physical assets
        image_meta_file = self.metadata_dir / "image_metadata.csv"
        if not image_meta_file.exists():
            print(f"[FATAL] Missing image metadata file: {image_meta_file}")
            results["status"] = "FAILED"
            return results

        with open(image_meta_file, "r", encoding="utf-8") as f:
            image_records = list(csv.DictReader(f))
        results["total_images"] = len(image_records)

        seen_image_ids = set()
        seen_hashes = {}
        metadata_paths = set()

        for rec in image_records:
            img_id = rec.get("Image_ID", "").strip()
            rel_path = rec.get("Image_Path", "").strip()
            label = rec.get("Label", "").strip()
            source_type = rec.get("Data_Source_Type", "Unknown").strip()
            source = rec.get("Image_Source", "").strip()

            if img_id in seen_image_ids:
                print(f"[ERROR] Duplicate Image_ID: {img_id}")
                results["invalid_images"] += 1
            seen_image_ids.add(img_id)
            metadata_paths.add(rel_path)

            if source_type not in ALLOWED_SOURCE_TYPES:
                print(f"[ERROR] Unknown Data_Source_Type '{source_type}' for {img_id}")
                results["provenance_errors"] += 1

            # Provenance must not claim field measurement/open archive without evidence.
            if "Field Measurement" in source and source_type == "Public Dataset":
                print(f"[ERROR] Contradictory provenance for {img_id}: field measurement + Public Dataset")
                results["provenance_errors"] += 1
            if source_type == "Real Field" and not source:
                print(f"[ERROR] Real Field image {img_id} has no source record")
                results["provenance_errors"] += 1

            full_img_path = self.dataset_dir / rel_path
            if not full_img_path.exists():
                print(f"[ERROR] Physical image not found: {full_img_path}")
                results["invalid_images"] += 1
                continue

            try:
                with Image.open(full_img_path) as img:
                    width, height = img.size
                    img_format = img.format
                    if width < 640 or height < 480:
                        print(f"[ERROR] Image {img_id} below recommended resolution: {width}x{height}")
                        results["invalid_images"] += 1
                        continue
                    if img_format not in ALLOWED_FORMATS:
                        print(f"[ERROR] Image {img_id} invalid format: {img_format}")
                        results["invalid_images"] += 1
                        continue
                    img.verify()
                results["valid_images"] += 1
            except Exception as exc:
                print(f"[ERROR] Corrupted/unreadable image {img_id}: {exc}")
                results["invalid_images"] += 1
                continue

            with open(full_img_path, "rb") as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
            metadata_hash = rec.get("SHA256_Hash", "").strip()
            if metadata_hash and metadata_hash != file_hash:
                print(f"[ERROR] SHA256 mismatch for {img_id}")
                results["invalid_images"] += 1
            if file_hash in seen_hashes:
                print(f"[ERROR] Exact duplicate: {img_id} == {seen_hashes[file_hash]}")
                results["duplicate_hashes"] += 1
            else:
                seen_hashes[file_hash] = img_id

            path_folder = Path(rel_path).parent.name
            if not str(rel_path).startswith("images/hard_negatives") and path_folder != label:
                print(f"[ERROR] Path-to-label mismatch: '{path_folder}' != '{label}' for {img_id}")
                results["path_label_mismatches"] += 1

            if label not in valid_folders and not str(rel_path).startswith("images/hard_negatives"):
                print(f"[ERROR] Unregistered class '{label}' for {img_id}")
                results["path_label_mismatches"] += 1

            results["images_per_class"][label] += 1

        # 3. Enforce class coverage. unknown_other is a registered class,
        # while hard negatives are treated as evaluation material rather than
        # additional classification labels.
        for class_name in sorted(valid_folders):
            count = results["images_per_class"].get(class_name, 0)
            if count < MIN_IMAGES_PER_CLASS:
                results["missing_class_minimums"] += 1
                print(f"[WARNING] {class_name}: {count} images; minimum is {MIN_IMAGES_PER_CLASS}")

        # 4. Tabular validation
        raw_file = self.raw_dir / "agriai_raw_dataset.csv"
        cleaned_file = self.cleaned_dir / "agriai_cleaned_dataset.csv"
        for file_path, name in [(raw_file, "Raw Dataset"), (cleaned_file, "Cleaned Dataset")]:
            if not file_path.exists():
                print(f"[ERROR] {name} missing: {file_path}")
                results["missing_metadata_errors"] += 1
                continue
            with open(file_path, "r", encoding="utf-8") as f:
                seen_ids = set()
                for row in csv.DictReader(f):
                    rec_id = row.get("Record_ID")
                    if rec_id in seen_ids:
                        results["missing_metadata_errors"] += 1
                    seen_ids.add(rec_id)
                    try:
                        vals = [float(row.get(k, 0)) for k in [
                            "Moisture_Percent", "Cellulose_Percent", "Hemicellulose_Percent",
                            "Lignin_Percent", "Ash_Percent"]]
                        if any(v < 0 or v > 100 for v in vals):
                            results["numeric_range_errors"] += 1
                    except (TypeError, ValueError):
                        results["numeric_range_errors"] += 1

        # 5. Group-aware split leakage
        train_file = self.processed_dir / "train.csv"
        val_file = self.processed_dir / "validation.csv"
        test_file = self.processed_dir / "test.csv"
        if train_file.exists() and val_file.exists() and test_file.exists():
            def get_groups(path):
                with open(path, "r", encoding="utf-8") as f:
                    return {r.get("Group_ID", "") for r in csv.DictReader(f) if r.get("Group_ID")}
            train_groups, val_groups, test_groups = map(get_groups, [train_file, val_file, test_file])
            overlap = (train_groups & val_groups) | (train_groups & test_groups) | (val_groups & test_groups)
            if overlap:
                print(f"[ERROR] Data leakage across splits: {sorted(overlap)}")
                results["data_leakage_errors"] = len(overlap)
        else:
            print("[WARNING] Processed train/validation/test splits are not complete yet.")

        if any(results[k] > 0 for k in [
            "invalid_images", "duplicate_hashes", "missing_metadata_errors",
            "data_leakage_errors", "numeric_range_errors", "path_label_mismatches",
            "provenance_errors"]):
            results["status"] = "FAILED_WITH_ERRORS"
        elif results["missing_class_minimums"] > 0:
            results["status"] = "INCOMPLETE_DATASET"
        else:
            results["status"] = "PASSED_VERIFIED"

        self.print_summary(results)
        return results

    def print_summary(self, results):
        print("\n" + "=" * 80)
        print("DATASET QUALITY SUMMARY")
        print("=" * 80)
        print(f"Total metadata records       : {results['total_images']}")
        print(f"Valid/openable images        : {results['valid_images']}")
        print(f"Invalid images               : {results['invalid_images']}")
        print(f"Exact duplicate images       : {results['duplicate_hashes']}")
        print(f"Provenance errors            : {results['provenance_errors']}")
        print(f"Path/label errors            : {results['path_label_mismatches']}")
        print(f"Classes below {MIN_IMAGES_PER_CLASS} images : {results['missing_class_minimums']}")
        print(f"Split leakage errors         : {results['data_leakage_errors']}")
        print(f"Numeric-range errors         : {results['numeric_range_errors']}")
        print(f"OVERALL STATUS               : {results['status']}")
        print("\nCLASS DISTRIBUTION")
        for name in sorted(results["images_per_class"]):
            count = results["images_per_class"][name]
            marker = "OK" if count >= PREFERRED_IMAGES_PER_CLASS else ("MIN" if count >= MIN_IMAGES_PER_CLASS else "NEEDS PHOTOS")
            print(f"  {name:30} {count:5}  [{marker}]")

if __name__ == "__main__":
    DatasetValidator().run_full_validation()
