# services/problem_analyzer.py

import re
import json
import os
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


def find_keywords_in_text(text: str, keywords: list) -> tuple[list, float]:
    """
    Find keywords in text with word boundaries.
    Returns (matched_keywords, confidence_score)
    """
    text_lower = text.lower()
    matched = []
    
    for keyword in keywords:
        # Use word boundaries for more accurate matching
        pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
        if re.search(pattern, text_lower):
            matched.append(keyword)
    
    # Confidence is proportion of unique keywords found
    confidence = len(matched) / len(keywords) if keywords else 0
    return matched, confidence


def detect_category(text: str) -> dict:
    """
    Detect problem category with confidence score.
    Returns {category, confidence, matched_keywords}
    """
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
        "matched_keywords": best_keywords
    }


def detect_problem_type(text: str, category: str) -> dict:
    """
    Detect specific problem type within category.
    Returns {problem_type, confidence}
    """
    categories = CONFIG.get("categories", {})
    category_config = categories.get(category, {})
    subtypes = category_config.get("subtypes", {})
    
    best_type = "General Public Issue"
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


def analyze_problem(text: str, language: str = "Unknown"):
    """
    Analyze a citizen complaint.

    This is the initial FREE/local rule-based version.
    Later, we can replace the analysis engine with a local
    multilingual Transformer model without changing the API structure.
    """

    text_lower = text.lower()

    # ---------------------------------------------------------
    # 1. CATEGORY DETECTION
    # ---------------------------------------------------------

    category_result = detect_category(text)


    # ---------------------------------------------------------
    # 2. PROBLEM TYPE
    # ---------------------------------------------------------

    problem_type_result = detect_problem_type(text, category_result["category"])


    # ---------------------------------------------------------
    # 3. SEVERITY
    # ---------------------------------------------------------

    def detect_severity(text: str) -> dict:
        """Detect severity level with confidence."""
        severity_keywords = CONFIG.get("severity_keywords", {})
        best_severity = "LOW"
        best_confidence = 0
        
        for severity, keywords in severity_keywords.items():
            matched, confidence = find_keywords_in_text(text, keywords)
            if confidence > best_confidence:
                best_confidence = confidence
                best_severity = severity
        
        return {"severity": best_severity, "confidence": best_confidence}

    severity_result = detect_severity(text)
    severity = severity_result["severity"]


    # ---------------------------------------------------------
    # 4. AFFECTED GROUP
    # ---------------------------------------------------------

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

    affected_group_result = detect_affected_group(text)
    affected_group = affected_group_result["affected_group"]


    # ---------------------------------------------------------
    # 5. REQUIRED SKILLS
    # ---------------------------------------------------------

    categories = CONFIG.get("categories", {})
    category_config = categories.get(category_result["category"], {})
    required_skills = category_config.get("skills", ["Problem Solving", "Technology"])


    # ---------------------------------------------------------
    # 6. IMPACT LEVEL
    # ---------------------------------------------------------

    impact_level_map = {
        "CRITICAL": "CRITICAL",
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW"
    }
    impact_level = impact_level_map.get(severity, "LOW")


    # ---------------------------------------------------------
    # 7. SUMMARY
    # ---------------------------------------------------------

    summary = create_summary(
        category_result["category"],
        problem_type_result["problem_type"],
        affected_group
    )


    # ---------------------------------------------------------
    # 8. CONFIDENCE SCORES
    # ---------------------------------------------------------

    overall_confidence = (
        category_result["confidence"] * 0.4 +
        problem_type_result["confidence"] * 0.2 +
        severity_result["confidence"] * 0.2 +
        affected_group_result["confidence"] * 0.2
    )


    # ---------------------------------------------------------
    # 9. FINAL RESPONSE
    # ---------------------------------------------------------

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
        "overall_confidence": round(overall_confidence, 2)
    }


def create_summary(category, problem_type, affected_group):

    return (
        f"This is a {problem_type.lower()} under the "
        f"{category} category affecting {affected_group.lower()}."
    )