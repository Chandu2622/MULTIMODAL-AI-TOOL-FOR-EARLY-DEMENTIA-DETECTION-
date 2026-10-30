from fastapi import APIRouter, HTTPException, Depends
from schemas import PredictRequest
from data import db
from models import cognitive_model, combiner
from utils.auth import get_current_user

router = APIRouter(prefix="/predict", tags=["Predict"])

def calculate_true_domains(test_flow, answers):
    domain_mapping = {
        "mmse_registration": "memory", "mmse_recall": "memory", "cdrsb_memory": "memory", "t13_word_recall": "memory", "t13_word_recog": "memory", "t13_delayed": "memory",
        "mmse_attention": "attention", "t13_cancellation": "attention",
        "mmse_language": "language", "t13_naming": "language", "t13_spoken": "language", "t13_finding": "language", "t13_comprehension": "language",
        "mmse_orientation": "orientation", "cdrsb_orientation": "orientation", "t13_orientation": "orientation",
        "mmse_visuospatial": "executive", "cdrsb_judgment": "executive", "cdrsb_community": "executive", "cdrsb_home": "executive", "cdrsb_personal": "executive", "t13_commands": "executive", "t13_praxis": "executive", "t13_ideational": "executive", "t13_instructions": "executive"
    }
    
    domain_points = {d: {"mmse_earned": 0, "mmse_max": 0, "risk_earned": 0, "risk_max": 0} for d in ["memory", "attention", "language", "orientation", "executive"]}
    
    for step in test_flow:
        sid = step.get("id")
        tname = step.get("test_name")
        if sid not in domain_mapping or "score_mapping" not in step: continue
        domain = domain_mapping[sid]
        mapping = step["score_mapping"]
        if not mapping: continue
        
        max_pts = max(mapping.values())
        ans = answers.get(tname.lower(), {}).get(sid)
        
        earned = 0
        if ans is not None:
            if ans in mapping: earned = mapping[ans]
            elif str(ans) in mapping: earned = mapping[str(ans)]
            else:
                for k, v in mapping.items():
                    if str(k).lower() == str(ans).lower():
                        earned = v
                        break
                        
        if tname == "MMSE":
            domain_points[domain]["mmse_earned"] += earned
            domain_points[domain]["mmse_max"] += max_pts
        else:
            domain_points[domain]["risk_earned"] += earned
            domain_points[domain]["risk_max"] += max_pts
            
    final_domains = {}
    for d, pts in domain_points.items():
        total_max_health = pts["mmse_max"] + pts["risk_max"]
        if total_max_health == 0:
            final_domains[d] = 0.0
            continue
        total_health = pts["mmse_earned"] + (pts["risk_max"] - pts["risk_earned"])
        final_domains[d] = total_health / total_max_health
        
    return final_domains


@router.post("/")
def predict(request: PredictRequest, current_user: str = Depends(get_current_user)):
    database = db.read_db()
    found_user = None
    session_data = None
    
    user_data = database.get("users", {}).get(current_user, {})
    for s in user_data.get("sessions", []):
        if s["session_id"] == request.session_id:
            found_user = current_user
            session_data = s
            break
            
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found or not authorized")
        
    speech_analysis = session_data.get("speech_analysis")
    cognitive_raw = session_data.get("cognitive_raw_scores")
    
    if not speech_analysis or not cognitive_raw:
        raise HTTPException(status_code=400, detail="Missing submission data for prediction")
        
    cog_analysis = cognitive_model.analyze_cognitive(
        cognitive_raw["mmse"],
        cognitive_raw["cdrsb"],
        cognitive_raw["total13"],
        session_data.get("age", 70) # default to 70 if missing
    )
    
    final_result = combiner.combine_scores(
        speech_analysis["score"],
        cog_analysis["score"]
    )
    
    # Calculate true domains based on actual answers instead of ML risk
    true_domain_scores = calculate_true_domains(
        session_data.get("test_flow", []), 
        session_data.get("cognitive_answers", {})
    )
    
    # Add domain breakdown
    final_result["domain_breakdown"] = true_domain_scores
    final_result["speech_domain_breakdown"] = speech_analysis.get("domain_scores", {})
    
    db.update_session(found_user, request.session_id, {
        "scores": final_result
    })
    
    return final_result
