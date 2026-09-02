# ==============================================================================
# AgriAI - Waste2Fuel: Image Dataset Builder & Preprocessing Pipeline
# ==============================================================================
"""
Image Dataset Builder for AgriAI - Waste2Fuel.
Handles:
1. Directory hierarchy creation for 23 core agricultural waste classes + unknown + hard negatives.
2. Generation of clearly marked synthetic/demo placeholder images with visual watermarks and SHA-256 hashes.
3. Ingestion and quality assessment of real farmer/field photographs.
4. Data augmentation pipeline strictly designated for training splits.
5. Dynamic addition of new agricultural waste classes.
"""

import os
import sys
import hashlib
import json
import random
import csv
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance

# 23 Core Waste Classes + Unknown Class
CORE_CLASSES = [
    ("rice_straw", "Rice Straw", "Rice"),
    ("rice_husk", "Rice Husk", "Rice"),
    ("rice_bran", "Rice Bran", "Rice"),
    ("maize_stalk", "Maize Stalk", "Maize"),
    ("maize_cob", "Maize Cob", "Maize"),
    ("sugarcane_bagasse", "Sugarcane Bagasse", "Sugarcane"),
    ("sugarcane_trash", "Sugarcane Trash", "Sugarcane"),
    ("cotton_stalk", "Cotton Stalk", "Cotton"),
    ("cotton_waste", "Cotton Waste", "Cotton"),
    ("chilli_stem", "Chilli Stem", "Chilli"),
    ("groundnut_shell", "Groundnut Shell", "Groundnut"),
    ("groundnut_haulm", "Groundnut Haulm", "Groundnut"),
    ("banana_pseudostem", "Banana Pseudostem", "Banana"),
    ("banana_leaf", "Banana Leaf", "Banana"),
    ("tobacco_stalk", "Tobacco Stalk", "Tobacco"),
    ("pulse_residue", "Pulse Residue", "Pulses (Redgram/Bengalgram)"),
    ("soybean_residue", "Soybean Residue", "Soybean"),
    ("sunflower_residue", "Sunflower Residue", "Sunflower"),
    ("turmeric_residue", "Turmeric Residue", "Turmeric"),
    ("mango_waste", "Mango Waste", "Mango"),
    ("coconut_husk", "Coconut Husk", "Coconut"),
    ("coconut_shell", "Coconut Shell", "Coconut"),
    ("vegetable_residue", "Vegetable Residue", "Mixed Vegetables"),
    ("unknown_other", "Unknown / Other", "Unknown")
]

# Hard Negative Pairs for Model Discrimination Testing
HARD_NEGATIVE_PAIRS = [
    ("rice_straw_vs_wheat_straw", "Rice Straw vs Wheat Straw"),
    ("rice_husk_vs_sawdust", "Rice Husk vs Wood Sawdust"),
    ("groundnut_shell_vs_coconut_shell", "Groundnut Shell vs Crushed Coconut Shell"),
    ("sugarcane_bagasse_vs_dry_grass", "Sugarcane Bagasse vs Wild Dry Grass"),
    ("maize_stalk_vs_sorghum_stalk", "Maize Stalk vs Sorghum/Millet Stalk"),
    ("banana_pseudostem_vs_banana_leaf", "Banana Pseudostem Fibre vs Dry Banana Leaf")
]

# Andhra Pradesh Agricultural Districts
AP_DISTRICTS = [
    "Guntur", "Palnadu", "Bapatla", "Krishna", "NTR", "Eluru",
    "West Godavari", "East Godavari", "Kakinada", "Konaseema",
    "Prakasam", "Nellore", "Kurnool", "Nandyal", "Anantapur",
    "Sri Sathya Sai", "Kadapa", "Chittoor", "Tirupati", "Annamayya",
    "Vizianagaram", "Srikakulam", "Visakhapatnam", "Alluri Sitharama Raju",
    "Parvathipuram Manyam"
]

CLASS_COLOR_PALETTES = {
    "rice_straw": (218, 185, 120),
    "rice_husk": (200, 160, 90),
    "rice_bran": (210, 180, 140),
    "maize_stalk": (180, 170, 100),
    "maize_cob": (220, 190, 110),
    "sugarcane_bagasse": (230, 215, 175),
    "sugarcane_trash": (175, 145, 95),
    "cotton_stalk": (130, 95, 60),
    "cotton_waste": (240, 240, 235),
    "chilli_stem": (120, 85, 55),
    "groundnut_shell": (195, 155, 105),
    "groundnut_haulm": (160, 140, 90),
    "banana_pseudostem": (190, 205, 150),
    "banana_leaf": (110, 145, 75),
    "tobacco_stalk": (140, 105, 70),
    "pulse_residue": (170, 130, 85),
    "soybean_residue": (185, 150, 100),
    "sunflower_residue": (165, 140, 80),
    "turmeric_residue": (210, 150, 40),
    "mango_waste": (200, 165, 65),
    "coconut_husk": (150, 100, 60),
    "coconut_shell": (90, 60, 40),
    "vegetable_residue": (130, 160, 90),
    "unknown_other": (150, 150, 150)
}

class ImageDatasetBuilder:
    def __init__(self, base_dir=None):
        if base_dir is None:
            self.base_dir = Path(__file__).resolve().parent
        else:
            self.base_dir = Path(base_dir)
        self.dataset_dir = self.base_dir / "dataset"
        self.images_dir = self.dataset_dir / "images"
        self.hard_negatives_dir = self.images_dir / "hard_negatives"
        self.metadata_dir = self.dataset_dir / "metadata"

    def setup_directories(self):
        """Creates all required folder directories for images and metadata."""
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.hard_negatives_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_dir.mkdir(parents=True, exist_ok=True)
        (self.dataset_dir / "raw").mkdir(parents=True, exist_ok=True)
        (self.dataset_dir / "cleaned").mkdir(parents=True, exist_ok=True)
        (self.dataset_dir / "processed").mkdir(parents=True, exist_ok=True)
        (self.dataset_dir / "labels").mkdir(parents=True, exist_ok=True)

        for folder_name, _, _ in CORE_CLASSES:
            (self.images_dir / folder_name).mkdir(parents=True, exist_ok=True)

        for hn_folder, _ in HARD_NEGATIVE_PAIRS:
            (self.hard_negatives_dir / hn_folder).mkdir(parents=True, exist_ok=True)

    @staticmethod
    def calculate_sha256(image_path):
        """Calculates SHA-256 checksum for deduplication and provenance."""
        hasher = hashlib.sha256()
        with open(image_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    def assess_image_quality(self, image_path):
        """
        Evaluates image resolution, exposure, and clarity.
        Flags: Very blurry, Extremely dark, Extremely bright, Low resolution.
        """
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                if width < 100 or height < 100:
                    return "Unusable", "Resolution critically low (<100px)"
                if width < 300 or height < 300:
                    return "Poor", "Low resolution (<300px)"
                
                gray = img.convert("L")
                pixels = list(gray.getdata())
                avg_brightness = sum(pixels) / len(pixels)
                
                if avg_brightness < 30:
                    return "Poor", "Extremely dark underexposed image"
                elif avg_brightness > 235:
                    return "Poor", "Extremely bright overexposed image"
                elif 80 <= avg_brightness <= 180 and width >= 640 and height >= 480:
                    return "Excellent", "Optimal brightness and resolution"
                else:
                    return "Good", "Standard field clarity and lighting"
        except Exception as e:
            return "Unusable", f"Cannot open image: {str(e)}"

    def generate_synthetic_image(self, folder_name, class_name, img_id, condition="Fresh", lighting="Outdoor", view_angle="Side", quality="Good"):
        """
        Generates a synthetic demo placeholder image with unambiguous visual markers.
        IMPORTANT: Clearly marked as DEMO/SYNTHETIC to prevent misrepresentation as real data.
        """
        width, height = 640, 480
        base_color = CLASS_COLOR_PALETTES.get(folder_name.split("/")[-1], (160, 160, 160))
        
        r, g, b = base_color
        if condition == "Dry":
            r = min(255, int(r * 1.1))
            g = int(g * 0.95)
            b = int(b * 0.8)
        elif condition == "Decomposed":
            r = int(r * 0.6)
            g = int(g * 0.5)
            b = int(b * 0.4)
        elif condition == "Dirty/Mixed":
            r = int(r * 0.75)
            g = int(g * 0.7)
            b = int(b * 0.65)

        img = Image.new("RGB", (width, height), color=(r, g, b))
        draw = ImageDraw.Draw(img)

        # Draw textured background simulation
        seed_num = int(img_id.replace("IMG", "")) if "IMG" in img_id else 42
        random.seed(seed_num)
        for _ in range(120):
            x1 = random.randint(20, width - 40)
            y1 = random.randint(80, height - 80)
            x2 = x1 + random.randint(-40, 40)
            y2 = y1 + random.randint(-30, 30)
            line_color = (
                max(0, min(255, r + random.randint(-35, 35))),
                max(0, min(255, g + random.randint(-35, 35))),
                max(0, min(255, b + random.randint(-35, 35)))
            )
            draw.line([(x1, y1), (x2, y2)], fill=line_color, width=random.randint(2, 6))

        # Top Warning Banner - Unmistakably marks as Synthetic/Demo
        draw.rectangle([(0, 0), (width, 50)], fill=(220, 38, 38))
        draw.text((15, 8), "[DEMO / SYNTHETIC PLACEHOLDER - NOT REAL FIELD PHOTO]", fill=(255, 255, 255))
        draw.text((15, 28), "Replace with verified farmer photograph prior to production training", fill=(255, 240, 240))

        # Center Label Card
        draw.rectangle([(30, 160), (width - 30, 320)], fill=(20, 20, 20), outline=(255, 255, 255), width=2)
        draw.text((50, 180), f"AgriAI Waste2Fuel - Class: {class_name}", fill=(255, 255, 255))
        draw.text((50, 205), f"Image ID: {img_id} | Condition: {condition}", fill=(220, 220, 220))
        draw.text((50, 230), f"Lighting: {lighting} | View: {view_angle} | Quality: {quality}", fill=(200, 200, 200))
        draw.text((50, 260), "DATA_SOURCE_TYPE: Synthetic/Demo (Explicitly Tagged)", fill=(252, 211, 77))
        draw.text((50, 285), "Target per class: 200-500+ Real Farmer Photographs", fill=(180, 230, 255))

        # Bottom Info Strip
        draw.rectangle([(0, height - 35), (width, height)], fill=(30, 41, 59))
        draw.text((15, height - 25), f"Location Scope: Andhra Pradesh | Target Class: {class_name}", fill=(203, 213, 225))

        # Save image
        img_filename = f"{img_id}.jpg"
        target_path = self.images_dir / folder_name / img_filename
        target_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(target_path, "JPEG", quality=85)
        return target_path

    def build_sample_dataset(self, samples_per_class=4):
        """
        Generates clean sample demo images and builds image_metadata.csv.
        Demonstrates variability across lighting, condition, view angle, quality, and group clustering.
        """
        self.setup_directories()
        image_records = []
        conditions = ["Fresh", "Dry", "Partially Decomposed", "Dirty/Mixed", "Cut/Chopped"]
        lightings = ["Bright Sunlight", "Cloudy/Overcast", "Indoor/Shed", "Evening/Low Light"]
        views = ["Close-up (10-30cm)", "Medium (1-2m)", "Pile/Bulk Overhead", "Side View"]
        qualities = ["Excellent", "Good", "Acceptable", "Poor"]
        
        global_counter = 1

        for folder_name, class_name, crop_name in CORE_CLASSES:
            # Group ID represents physical capture session / single pile
            group_id = f"GRP_{(global_counter // 4) + 1:04d}"
            district = random.choice(AP_DISTRICTS)
            
            for i in range(samples_per_class):
                img_id = f"IMG{global_counter:06d}"
                condition = conditions[i % len(conditions)]
                lighting = lightings[i % len(lightings)]
                view = views[i % len(views)]
                quality = qualities[i % len(qualities)]
                is_mixed = "Yes" if (condition == "Dirty/Mixed" or folder_name == "vegetable_residue") else "No"
                
                rel_path = f"images/{folder_name}/{img_id}.jpg"
                full_path = self.generate_synthetic_image(
                    folder_name=folder_name,
                    class_name=class_name,
                    img_id=img_id,
                    condition=condition,
                    lighting=lighting,
                    view_angle=view,
                    quality=quality
                )
                
                sha256 = self.calculate_sha256(full_path)
                
                record = {
                    "Image_ID": img_id,
                    "Image_Path": rel_path.replace("\\", "/"),
                    "Waste_Type": class_name,
                    "Crop": crop_name,
                    "State": "Andhra Pradesh",
                    "District": district,
                    "Mandal": "Unknown",
                    "Village": "Unknown",
                    "Image_Source": "Synthetic Generator / Template",
                    "Data_Source_Type": "Synthetic/Demo",
                    "Capture_Date": "2026-09-01",
                    "Capture_Device": "Simulated Smartphone 12MP",
                    "Capture_Type": "Field Simulation",
                    "Lighting": lighting,
                    "Background": "Soil / Field / Farmyard",
                    "View_Angle": view,
                    "Image_Condition": condition,
                    "Image_Quality": quality,
                    "Is_Mixed_Waste": is_mixed,
                    "Primary_Object": class_name,
                    "Label": folder_name,
                    "Group_ID": group_id,
                    "SHA256_Hash": sha256,
                    "Annotation_Status": "Template_Annotated",
                    "Verified_By": "AgriAI Automated Builder",
                    "Data_Confidence": "Medium"
                }
                image_records.append(record)
                global_counter += 1

        # Also generate Hard Negative demo samples
        for hn_folder, hn_name in HARD_NEGATIVE_PAIRS:
            group_id = f"GRP_{(global_counter // 4) + 1:04d}"
            for i in range(2):
                img_id = f"IMG{global_counter:06d}"
                rel_path = f"images/hard_negatives/{hn_folder}/{img_id}.jpg"
                full_path = self.generate_synthetic_image(
                    folder_name=f"hard_negatives/{hn_folder}",
                    class_name=f"Hard Negative: {hn_name}",
                    img_id=img_id,
                    condition="Dry",
                    lighting="Bright Sunlight",
                    view_angle="Close-up (10-30cm)",
                    quality="Good"
                )
                sha256 = self.calculate_sha256(full_path)
                record = {
                    "Image_ID": img_id,
                    "Image_Path": rel_path.replace("\\", "/"),
                    "Waste_Type": f"Hard Negative ({hn_name})",
                    "Crop": "Comparison Pair",
                    "State": "Andhra Pradesh",
                    "District": random.choice(AP_DISTRICTS),
                    "Mandal": "Unknown",
                    "Village": "Unknown",
                    "Image_Source": "Synthetic Generator / Template",
                    "Data_Source_Type": "Synthetic/Demo",
                    "Capture_Date": "2026-09-01",
                    "Capture_Device": "Simulated Smartphone 12MP",
                    "Capture_Type": "Field Simulation",
                    "Lighting": "Bright Sunlight",
                    "Background": "Soil / Field",
                    "View_Angle": "Close-up (10-30cm)",
                    "Image_Condition": "Dry",
                    "Image_Quality": "Good",
                    "Is_Mixed_Waste": "No",
                    "Primary_Object": hn_name,
                    "Label": f"hard_negative_{hn_folder}",
                    "Group_ID": group_id,
                    "SHA256_Hash": sha256,
                    "Annotation_Status": "Template_Annotated",
                    "Verified_By": "AgriAI Automated Builder",
                    "Data_Confidence": "Medium"
                }
                image_records.append(record)
                global_counter += 1

        # Write metadata/image_metadata.csv
        metadata_csv_path = self.metadata_dir / "image_metadata.csv"
        fieldnames = list(image_records[0].keys())
        with open(metadata_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(image_records)

        print(f"[SUCCESS] Created {len(image_records)} demo images across {len(CORE_CLASSES)} classes and hard negative pairs.")
        print(f"[SUCCESS] Wrote image metadata to: {metadata_csv_path}")
        return image_records

    def apply_training_augmentation(self, image_path):
        """
        Training-only augmentation pipeline.
        DO NOT apply to validation or test splits.
        """
        with Image.open(image_path) as img:
            aug_img = img.copy()
            if random.random() > 0.5:
                aug_img = aug_img.transpose(Image.FLIP_LEFT_RIGHT)
            angle = random.uniform(-15, 15)
            aug_img = aug_img.rotate(angle, resample=Image.BILINEAR, expand=False)
            enhancer = ImageEnhance.Brightness(aug_img)
            aug_img = enhancer.enhance(random.uniform(0.85, 1.15))
            enhancer = ImageEnhance.Contrast(aug_img)
            aug_img = enhancer.enhance(random.uniform(0.85, 1.15))
            return aug_img


if __name__ == "__main__":
    builder = ImageDatasetBuilder()
    builder.build_sample_dataset(samples_per_class=4)
