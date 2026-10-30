import os
import pickle
import pandas as pd
from typing import Dict, Any

# Load model globally so it's loaded once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "weights", "cognitive_model.pkl")
try:
    with open(MODEL_PATH, "rb") as f:
        cog_model = pickle.load(f)
except Exception as e:
    print(f"Warning: Could not load cognitive model: {e}")
    cog_model = None

COG_FEATURES = [
    'TOTAL13','MMSE','CDRSB','AGE',
    'CDRSB_MMSE_ratio','TOTAL13_MMSE_ratio','CDRSB_TOTAL13_ratio',
    'CDRSB_x_TOTAL13','MMSE_x_TOTAL13',
    'AGE_bin','severity','CDRSB_sq','TOTAL13_sq'
]

def engineer_cognitive_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create interaction + ratio features that improve separability."""
    d = df.copy()
    # Ratios
    d['CDRSB_MMSE_ratio']   = d['CDRSB'] / (d['MMSE'] + 1e-5)
    d['TOTAL13_MMSE_ratio'] = d['TOTAL13'] / (d['MMSE'] + 1e-5)
    d['CDRSB_TOTAL13_ratio']= d['CDRSB'] / (d['TOTAL13'] + 1e-5)
    # Products
    d['CDRSB_x_TOTAL13']    = d['CDRSB'] * d['TOTAL13']
    d['MMSE_x_TOTAL13']     = d['MMSE'] * d['TOTAL13']
    # Age buckets
    d['AGE_bin'] = pd.cut(d['AGE'], bins=[0,65,70,75,80,120], labels=[0,1,2,3,4]).astype(float)
    # Compound severity score
    d['severity'] = d['CDRSB'] * 2 + (30 - d['MMSE']) + (85 - d['TOTAL13']) / 10
    # Squared terms
    d['CDRSB_sq']   = d['CDRSB'] ** 2
    d['TOTAL13_sq'] = d['TOTAL13'] ** 2
    return d

def analyze_cognitive(mmse_total: int, cdrsb_total: float, total13_total: int, age: int) -> Dict[str, Any]:
    if not cog_model:
        # Fallback to mock if model didn't load
        # MMSE: 0-30 (lower is worse risk)
        mmse_risk = max(0.0, (30.0 - mmse_total) / 30.0)
        # CDRSB: 0-18 (higher is worse risk)
        cdrsb_risk = min(1.0, cdrsb_total / 18.0)
        # TOTAL13: 0-85 (higher is worse risk)
        total13_risk = min(1.0, total13_total / 85.0)
        
        score = (mmse_risk + cdrsb_risk + total13_risk) / 3.0
        h = 1.0 - score
        return {
            "score": score,
            "domain_scores": {
                "memory": max(0.0, min(1.0, h)),
                "attention": max(0.0, min(1.0, h * 1.2)),
                "language": max(0.0, min(1.0, h * 1.1)),
                "orientation": max(0.0, min(1.0, h * 1.3)),
                "executive": max(0.0, min(1.0, h * 0.9))
            }
        }

    # Prepare DataFrame
    df = pd.DataFrame([{
        "TOTAL13": float(total13_total),
        "MMSE": float(mmse_total),
        "CDRSB": float(cdrsb_total),
        "AGE": float(age)
    }])
    
    # Engineer features
    df_eng = engineer_cognitive_features(df)
    X = df_eng[COG_FEATURES]
    
    # In case the pickled model is a pipeline, it will handle scaling.
    # If it's a raw tree model, RobustScaler might not be needed for predictions.
    
    try:
        model_obj = cog_model.get("model", cog_model) if isinstance(cog_model, dict) else cog_model
        scaler_obj = cog_model.get("scaler") if isinstance(cog_model, dict) else None
        
        if scaler_obj:
            # Scaler might return a numpy array, which we pass to model
            X_input = scaler_obj.transform(X)
        else:
            X_input = X

        if hasattr(model_obj, "predict_proba"):
            probs = model_obj.predict_proba(X_input)[0]
            # Prob[1] is the probability of being healthy. Invert it so 'score' represents RISK.
            raw_prob = float(probs[1] if len(probs) > 1 else probs[0])
            score = 1.0 - raw_prob
        else:
            # If no predict_proba, fallback to predict
            pred = model_obj.predict(X_input)[0]
            score = 1.0 - float(pred)
    except Exception as e:
        print(f"Error during prediction: {e}")
        score = 0.5 # fallback

    # Bound it just in case
    score = min(1.0, max(0.0, score))

    h = 1.0 - score
    return {
        "score": score,
        "domain_scores": {
            "memory": max(0.0, min(1.0, h)),
            "attention": max(0.0, min(1.0, h * 1.2)),
            "language": max(0.0, min(1.0, h * 1.1)),
            "orientation": max(0.0, min(1.0, h * 1.3)),
            "executive": max(0.0, min(1.0, h * 0.9))
        }
    }
