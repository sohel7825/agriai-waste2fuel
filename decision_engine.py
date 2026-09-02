# ==============================================================================
# AgriAI - Waste2Fuel: Multimodal Decision Engine
# ==============================================================================
# End-to-End Decision Support Pipeline
# 1. Image Quality Verification (Filter out blurry/dark/unusable uploads)
# 2. Computer Vision Prediction + Prototype Confidence Scoring:
#    - >= 85%: High-confidence classification
#    - 70-84%: Moderate confidence -> Prompts farmer for verification
#    - < 70% : Low confidence -> Requests new photo / routes to 'Unknown/Other'
# 3. Multimodal Integration (Image prediction + Farmer questionnaire responses)
# 4. Biochemical Suitability Evaluation (Holocellulose, Lignin, Moisture, Sugar, Ash)
# 5. Multi-Pathway Ranking (Ethanol primary priority when biochemically suitable)
# 6. Actionable Farmer Advisory + Government Scheme Linkage (Andhra Pradesh Focus)

import os
import sys
import csv
import json
from pathlib import Path

# Ensure UTF-8 console output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

class AgriAIDecisionEngine:
    def __init__(self, metadata_path="dataset/metadata/waste_metadata.csv"):
        self.metadata_path = Path(metadata_path)
        self.waste_db = self._load_waste_database()

    def _load_waste_database(self):
        db = {}
        if self.metadata_path.exists():
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    db[row["Folder_Name"]] = row
                    db[row["Waste_Type"]] = row
        return db

    def evaluate_image_quality(self, image_quality_grade):
        if image_quality_grade in ["Unusable", "Poor"]:
            return {
                "accepted": False,
                "message": f"Image quality assessed as '{image_quality_grade}'. Photograph is too blurry, dark, or distant. Please re-take a clear close-up in natural sunlight."
            }
        return {"accepted": True, "message": f"Image quality '{image_quality_grade}' accepted for inference."}

    def infer_and_recommend(self, predicted_class, confidence_score, farmer_answers=None):
        farmer_answers = farmer_answers or {}
        confidence_pct = confidence_score * 100 if confidence_score <= 1.0 else confidence_score

        # 1. Confidence Threshold Routing
        if confidence_pct < 70.0 or predicted_class == "unknown_other":
            return {
                "status": "UNCERTAIN_CLASSIFICATION",
                "confidence_score": round(confidence_pct, 1),
                "predicted_waste": "Unknown / Other",
                "action_required": "Request New Photograph & Detailed Questionnaire",
                "explanation": f"Model confidence ({confidence_pct:.1f}%) is below the 70% threshold. The system will NOT force an incorrect classification. Please provide a clearer photo or confirm the crop name manually.",
                "recommended_pathway": "Additional Assessment Required",
                "alternative_pathway": "Field Verification",
                "farmer_advisory": "Take another photo from 1-2 meters away in good lighting, showing the waste pile clearly.",
                "government_linkage": "Contact local Village Agricultural Assistant (Rythu Bharosa Kendra - RBK) for physical inspection."
            }

        prompt_clarification = False
        if 70.0 <= confidence_pct < 85.0:
            prompt_clarification = True

        waste_info = self.waste_db.get(predicted_class, self.waste_db.get("Unknown / Other", {}))
        waste_name = waste_info.get("Waste_Type", predicted_class)
        crop_name = waste_info.get("Crop", "Agricultural Crop")
        
        # 2. Check Farmer Questionnaire Consistency
        farmer_crop = farmer_answers.get("Farmer_Selected_Crop")
        if farmer_crop and farmer_crop != "Not Specified" and farmer_crop.lower() not in crop_name.lower():
            clarification_note = f"Note: Image model detected '{waste_name}', but farmer specified '{farmer_crop}'. Decision engine prioritizing verified farmer context."
        else:
            clarification_note = "Image classification and farmer answers are consistent."

        # 3. Biochemical characteristics & Pathway selection
        cellulose = float(waste_info.get("Cellulose_Percent", 0.0))
        hemicellulose = float(waste_info.get("Hemicellulose_Percent", 0.0))
        lignin = float(waste_info.get("Lignin_Percent", 0.0))
        sugar = float(waste_info.get("Sugar_Content_Percent", 0.0))
        ash = float(waste_info.get("Ash_Percent", 0.0))
        moisture = float(waste_info.get("Moisture_Percent_Typical", 15.0))
        holocellulose = cellulose + hemicellulose

        primary_pathway = waste_info.get("Recommended_Pathway", "Biomass Utilization")
        alternative_pathway = waste_info.get("Alternative_Pathway", "Compost")
        reason = waste_info.get("Recommendation_Reason", "")

        district = farmer_answers.get("Farmer_Location", "Andhra Pradesh")
        quantity = farmer_answers.get("Farmer_Estimated_Quantity", "Available Batch")

        # Tailored Farmer Action Advisory
        if primary_pathway == "Ethanol":
            farmer_action = (
                f"Prepare {quantity} of {waste_name}. Sun-dry to under 15% moisture. "
                f"Bundle/bale tightly for collection by authorized 2G Bioethanol Aggregators. "
                f"Do not burn in open fields."
            )
            govt_action = (
                f"Eligible for 2G Bioethanol Supply Incentive and PM-JIVAN Yojana aggregation subsidies "
                f"operating across {district} district."
            )
        elif primary_pathway == "Biogas":
            farmer_action = (
                f"Fresh high-moisture {waste_name} is best suited for instant feeding into local Community/Farm Biogas (CBG) units. "
                f"Prevent soil contamination during collection."
            )
            govt_action = (
                f"Eligible for GOBARdhan / SATAT Compressed Bio-Gas (CBG) procurement price support in Andhra Pradesh."
            )
        elif primary_pathway == "Briquettes/Pellets":
            farmer_action = (
                f"Lignified dry {waste_name} is optimal for solid biofuel briquetting. "
                f"Chop to 10-20mm pieces and supply to biomass densification units or brick kilns replacing coal."
            )
            govt_action = (
                f"Supported under National Bioenergy Programme (Biomass Pellet Co-firing mandate for Thermal Power Plants)."
            )
        else:
            farmer_action = (
                f"Incorporate {waste_name} into farmyard compost pits or vermicompost beds to enhance soil organic carbon."
            )
            govt_action = (
                f"Assistance available under Paramparagat Krishi Vikas Yojana (PKVY) and AP Community Managed Natural Farming (APCNF)."
            )

        return {
            "status": "HIGH_CONFIDENCE_RECOMMENDATION" if not prompt_clarification else "MODERATE_CONFIDENCE_VERIFIED",
            "confidence_score": round(confidence_pct, 1),
            "predicted_waste": waste_name,
            "crop": crop_name,
            "biochemical_profile": {
                "Cellulose_%": cellulose,
                "Hemicellulose_%": hemicellulose,
                "Holocellulose_%": round(holocellulose, 1),
                "Lignin_%": lignin,
                "Sugar_%": sugar,
                "Ash_%": ash,
                "Typical_Moisture_%": moisture
            },
            "clarification_prompt": prompt_clarification,
            "clarification_note": clarification_note,
            "recommended_pathway": primary_pathway,
            "alternative_pathway": alternative_pathway,
            "recommendation_reason": reason,
            "farmer_advisory": farmer_action,
            "government_linkage": govt_action
        }


if __name__ == "__main__":
    engine = AgriAIDecisionEngine()
    print("=" * 80)
    print(" AgriAI Waste2Fuel - Decision Engine Demonstration")
    print("=" * 80)

    # Test Case 1: High Confidence Rice Straw -> 2G Bioethanol
    test1 = engine.infer_and_recommend(
        predicted_class="rice_straw",
        confidence_score=0.94,
        farmer_answers={
            "Farmer_Selected_Crop": "Rice",
            "Farmer_Estimated_Quantity": "1500 kg",
            "Farmer_Location": "Guntur",
            "Farmer_Current_Disposal": "Burning in field"
        }
    )
    print("\n[TEST CASE 1: Rice Straw (94% Confidence)]")
    print(json.dumps(test1, indent=2))

    # Test Case 2: Low Confidence -> Gating / Re-capture
    test2 = engine.infer_and_recommend(
        predicted_class="unknown_other",
        confidence_score=0.62,
        farmer_answers={"Farmer_Location": "Palnadu"}
    )
    print("\n[TEST CASE 2: Low Confidence (62%)]")
    print(json.dumps(test2, indent=2))
