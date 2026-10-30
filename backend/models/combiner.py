from typing import Dict, Any
from config import settings

def combine_scores(speech_score: float, cognitive_score: float) -> Dict[str, Any]:
    combined_risk = (speech_score * settings.SPEECH_WEIGHT) + (cognitive_score * settings.COGNITIVE_WEIGHT)
    
    if combined_risk < 0.33:
        risk_label = "Low"
    elif combined_risk < 0.66:
        risk_label = "Moderate"
    else:
        risk_label = "High"
        
    return {
        "speech_score": speech_score,
        "cognitive_score": cognitive_score,
        "combined_risk": combined_risk,
        "risk_label": risk_label,
        "confidence": 0.85
    }
