# services/problem_analyzer.py

import re
import json
import os
import joblib
from pathlib import Path


# Load configuration from file
def load_config():
    """Load category and keyword configuration from JSON file."""
    config_path = Path(__file__).parent / "config.json"
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: config.json not found at {config_path}")
        return {"categories": {}, "severity_keywords": {}, "affected_groups": {}}


CONFIG = load_config()

# ---------------------------------------------------------
# LOAD TRAINED MACHINE LEARNING MODELS
# ---------------------------------------------------------
MODELS_DIR = Path(__file__).parent.parent / "models"
CAT_MODEL_PATH = MODELS_DIR / "category_model.joblib"
SEV_MODEL_PATH = MODELS_DIR / "severity_model.joblib"

ml_category_model = None
ml_severity_model = None

try:
    if CAT_MODEL_PATH.exists():
        ml_category_model = joblib.load(CAT_MODEL_PATH)
        print("Loaded ML Category Classifier!")
    if SEV_MODEL_PATH.exists():
        ml_severity_model = joblib.load(SEV_MODEL_PATH)
        print("Loaded ML Severity Classifier!")
except Exception as e:
    print("Notice: ML models not loaded, falling back to rule-based analyzer:", e)


def find_keywords_in_text(text: str, keywords: list) -> tuple[list, float]:
    """
    Find keywords in text with word boundaries.
    Returns (matched_keywords, confidence_score)
    """
    text_lower = text.lower()
    matched = []
    
    for keyword in keywords:
        pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
        if re.search(pattern, text_lower):
            matched.append(keyword)
    
    confidence = len(matched) / len(keywords) if keywords else 0
    return matched, confidence


def detect_category_ml(text: str) -> dict:
    """
    Detect category using trained ML model with fallback to keyword heuristics.
    """
    if ml_category_model is not None:
        try:
            pred_category = ml_category_model.predict([text])[0]
            probs = ml_category_model.predict_proba([text])[0]
            confidence = float(max(probs))
            
            # Also extract any matched keywords for explanation UI
            categories = CONFIG.get("categories", {})
            cat_keywords = categories.get(pred_category, {}).get("keywords", [])
            matched, _ = find_keywords_in_text(text, cat_keywords)
            
            return {
                "category": pred_category,
                "confidence": confidence,
                "matched_keywords": matched,
                "method": "ml"
            }
        except Exception as e:
            print("ML category inference error, using heuristics:", e)

    # Fallback to rule-based keywords
    categories = CONFIG.get("categories", {})
    best_category = None
    best_confidence = 0
    best_keywords = []
    
    for category, config in categories.items():
        keywords = config.get("keywords", [])
        matched, confidence = find_keywords_in_text(text, keywords)
        if confidence > best_confidence:
            best_confidence = confidence
            best_category = category
            best_keywords = matched
    
    return {
        "category": best_category or "Other",
        "confidence": best_confidence,
        "matched_keywords": best_keywords,
        "method": "rules"
    }


def detect_severity_ml(text: str) -> dict:
    """
    Detect severity level using trained ML model with fallback to keyword heuristics.
    """
    if ml_severity_model is not None:
        try:
            pred_severity = ml_severity_model.predict([text])[0]
            probs = ml_severity_model.predict_proba([text])[0]
            confidence = float(max(probs))
            return {
                "severity": pred_severity,
                "confidence": confidence,
                "method": "ml"
            }
        except Exception as e:
            print("ML severity inference error, using heuristics:", e)

    # Fallback to rules
    severity_keywords = CONFIG.get("severity_keywords", {})
    best_severity = "LOW"
    best_confidence = 0
    
    for severity, keywords in severity_keywords.items():
        matched, confidence = find_keywords_in_text(text, keywords)
        if confidence > best_confidence:
            best_confidence = confidence
            best_severity = severity
    
    return {
        "severity": best_severity,
        "confidence": best_confidence,
        "method": "rules"
    }


def detect_problem_type(text: str, category: str) -> dict:
    """
    Detect specific problem type within category.
    """
    categories = CONFIG.get("categories", {})
    category_config = categories.get(category, {})
    subtypes = category_config.get("subtypes", {})
    
    best_type = f"General {category} Issue"
    best_confidence = 0
    
    for problem_type, keywords in subtypes.items():
        matched, confidence = find_keywords_in_text(text, keywords)
        if confidence > best_confidence:
            best_confidence = confidence
            best_type = problem_type
    
    return {
        "problem_type": best_type,
        "confidence": best_confidence
    }


def detect_affected_group(text: str) -> dict:
    """Detect which group is affected."""
    affected_groups = CONFIG.get("affected_groups", {})
    best_group = "General Public"
    best_confidence = 0
    
    for group, keywords in affected_groups.items():
        matched, confidence = find_keywords_in_text(text, keywords)
        if confidence > best_confidence:
            best_confidence = confidence
            best_group = group
    
    return {"affected_group": best_group, "confidence": best_confidence}


def create_summary(category, problem_type, affected_group):
    return (
        f"This is a {problem_type.lower()} under the "
        f"{category} category affecting {affected_group.lower()}."
    )


def analyze_problem(text: str, language: str = "Unknown"):
    """
    Analyze citizen complaint using trained Machine Learning models
    for Category and Severity classification, complemented with NLP entity extraction.
    """
    # 1. CATEGORY DETECTION (ML)
    category_result = detect_category_ml(text)

    # 2. PROBLEM TYPE DETECTION
    problem_type_result = detect_problem_type(text, category_result["category"])

    # 3. SEVERITY DETECTION (ML)
    severity_result = detect_severity_ml(text)
    severity = severity_result["severity"]

    # 4. AFFECTED GROUP DETECTION
    affected_group_result = detect_affected_group(text)
    affected_group = affected_group_result["affected_group"]

    # 5. REQUIRED SKILLS
    categories = CONFIG.get("categories", {})
    category_config = categories.get(category_result["category"], {})
    required_skills = category_config.get("skills", ["Problem Solving", "Civic Technology"])

    # 6. IMPACT LEVEL
    impact_level_map = {
        "CRITICAL": "CRITICAL",
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW"
    }
    impact_level = impact_level_map.get(severity, "LOW")

    # 7. SUMMARY
    summary = create_summary(
        category_result["category"],
        problem_type_result["problem_type"],
        affected_group
    )

    # 8. OVERALL CONFIDENCE SCORE
    overall_confidence = (
        category_result["confidence"] * 0.5 +
        severity_result["confidence"] * 0.3 +
        affected_group_result["confidence"] * 0.2
    )

    # 9. RESPONSE
    return {
        "language": language,
        "category": category_result["category"],
        "category_confidence": round(category_result["confidence"], 2),
        "matched_category_keywords": category_result["matched_keywords"],
        "problem_type": problem_type_result["problem_type"],
        "problem_type_confidence": round(problem_type_result["confidence"], 2),
        "severity": severity,
        "severity_confidence": round(severity_result["confidence"], 2),
        "affected_group": affected_group,
        "affected_group_confidence": round(affected_group_result["confidence"], 2),
        "impact_level": impact_level,
        "required_skills": required_skills,
        "summary": summary,
        "overall_confidence": round(overall_confidence, 2),
        "model_pipeline": "Machine Learning (TF-IDF + Calibrated Linear-SVM / Logistic-Regression)"
    }