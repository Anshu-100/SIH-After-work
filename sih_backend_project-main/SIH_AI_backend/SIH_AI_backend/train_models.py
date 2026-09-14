"""
Trainer for Civic Problem Classifier & Severity Detection
Uses MultinomialNB / LogisticRegression / LinearSVC optimized for text classification
with calibrated probability scoring.
"""

import os
import joblib
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "civic_complaints.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def train_and_evaluate():
    print("Loading dataset from:", DATA_PATH)
    df = pd.read_csv(DATA_PATH)
    
    X = df["text"]
    y_cat = df["category"]
    y_sev = df["severity"]
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # -------------------------------------------------------------
    # 1. TRAIN CATEGORY CLASSIFIER (Multinomial Logistic Regression with Balanced Weights)
    # -------------------------------------------------------------
    print("\n" + "="*50)
    print("1. TRAINING CATEGORY CLASSIFIER")
    print("="*50)
    
    cat_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
            strip_accents='unicode',
            lowercase=True
        )),
        ('clf', LogisticRegression(
            C=5.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ))
    ])
    
    cat_scores = cross_val_score(cat_pipeline, X, y_cat, cv=cv, scoring='f1_macro')
    print(f"Category 5-Fold Stratified CV Macro F1: {cat_scores.mean():.4f} (±{cat_scores.std():.4f})")
    
    cat_pipeline.fit(X, y_cat)
    y_cat_pred = cat_pipeline.predict(X)
    print("\nCategory Metrics (Full Set):")
    print(classification_report(y_cat, y_cat_pred, zero_division=0))
    
    # -------------------------------------------------------------
    # 2. TRAIN SEVERITY CLASSIFIER
    # -------------------------------------------------------------
    print("\n" + "="*50)
    print("2. TRAINING SEVERITY CLASSIFIER")
    print("="*50)
    
    sev_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
            strip_accents='unicode',
            lowercase=True
        )),
        ('clf', LogisticRegression(
            C=3.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ))
    ])
    
    sev_scores = cross_val_score(sev_pipeline, X, y_sev, cv=cv, scoring='f1_macro')
    print(f"Severity 5-Fold Stratified CV Macro F1: {sev_scores.mean():.4f} (±{sev_scores.std():.4f})")
    
    sev_pipeline.fit(X, y_sev)
    y_sev_pred = sev_pipeline.predict(X)
    print("\nSeverity Metrics (Full Set):")
    print(classification_report(y_sev, y_sev_pred, zero_division=0))
    
    # -------------------------------------------------------------
    # 3. EXPORT MODEL ARTIFACTS
    # -------------------------------------------------------------
    os.makedirs(MODELS_DIR, exist_ok=True)
    cat_path = os.path.join(MODELS_DIR, "category_model.joblib")
    sev_path = os.path.join(MODELS_DIR, "severity_model.joblib")
    
    joblib.dump(cat_pipeline, cat_path)
    joblib.dump(sev_pipeline, sev_path)
    
    print("\n" + "="*50)
    print("Models saved successfully!")
    print(f"  Category Model -> {cat_path}")
    print(f"  Severity Model -> {sev_path}")
    print("="*50)
    
    # -------------------------------------------------------------
    # 4. TEST SAMPLE PREDICTIONS
    # -------------------------------------------------------------
    sample_tests = [
        "Live high voltage wire fallen across the street near school gate",
        "Water supply has stopped completely for 4 days in our residential block",
        "Hospital ICU has run out of oxygen and emergency ventilators",
        "Deep pothole on highway caused motorcycle accident",
        "Locust swarm destroying wheat crop in our farm fields",
        "Piles of stinking rotten garbage dumped in open field behind houses"
    ]
    
    print("\nTesting Sample Complaints with Probabilities:")
    for sample in sample_tests:
        cat_pred = cat_pipeline.predict([sample])[0]
        cat_prob = cat_pipeline.predict_proba([sample]).max()
        
        sev_pred = sev_pipeline.predict([sample])[0]
        sev_prob = sev_pipeline.predict_proba([sample]).max()
        
        print(f"\nText: \"{sample}\"")
        print(f"  -> Predicted Category: {cat_pred} ({cat_prob*100:.1f}% confidence)")
        print(f"  -> Predicted Severity: {sev_pred} ({sev_prob*100:.1f}% confidence)")

if __name__ == "__main__":
    train_and_evaluate()

