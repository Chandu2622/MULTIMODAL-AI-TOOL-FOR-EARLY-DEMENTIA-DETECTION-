from fastapi import APIRouter, HTTPException, Depends
from schemas import CognitiveSubmit
from data import db
from utils.auth import get_current_user

router = APIRouter(prefix="/submit", tags=["Submit"])

@router.post("/cognitive")
def submit_cognitive(data: CognitiveSubmit, current_user: str = Depends(get_current_user)):
    database = db.read_db()
    found_user = None
    user_data = database.get("users", {}).get(current_user, {})
    session_data = None
    for s in user_data.get("sessions", []):
        if s["session_id"] == data.session_id:
            found_user = current_user
            session_data = s
            break
            
    if not found_user:
        raise HTTPException(status_code=404, detail="Session not found or not authorized")
        
    mmse_score = 0
    cdrsb_score = 0.0
    total13_score = 0
    
    # Calculate real scores based on embedded score_mapping in test_flow
    for step in session_data.get("test_flow", []):
        sid = step["id"]
        tname = step["test_name"]
        
        if tname == "MMSE":
            ans = data.mmse_answers.get(sid)
            if "score_mapping" in step:
                mapping = step["score_mapping"]
                # JSON serialization might convert boolean keys to strings, check both
                if ans in mapping:
                    mmse_score += mapping[ans]
                elif str(ans) in mapping:
                    mmse_score += mapping[str(ans)]
                elif str(ans).lower() in [str(k).lower() for k in mapping.keys()]:
                    # brute force match
                    for k, v in mapping.items():
                        if str(k).lower() == str(ans).lower():
                            mmse_score += v
                            break
                    
        elif tname == "TOTAL13":
            ans = data.total13_answers.get(sid)
            if "score_mapping" in step:
                total13_score += step["score_mapping"].get(ans, 0)
                
        elif tname == "CDRSB":
            ans = data.cdrsb_answers.get(sid)
            if "score_mapping" in step:
                cdrsb_score += step["score_mapping"].get(ans, 0.0)
    
    # Enforce maximum / minimum bounds just to be safe
    mmse_score = min(30, max(0, mmse_score))
    cdrsb_score = min(18.0, max(0.0, float(cdrsb_score)))
    total13_score = min(85, max(0, total13_score))
    
    raw_scores = {
        "mmse": mmse_score,
        "cdrsb": cdrsb_score,
        "total13": total13_score
    }
    
    db.update_session(found_user, data.session_id, {
        "cognitive_answers": {
            "mmse": data.mmse_answers,
            "cdrsb": data.cdrsb_answers,
            "total13": data.total13_answers
        },
        "cognitive_raw_scores": raw_scores
    })
    
    return {
        "received": True,
        "raw_scores": raw_scores
    }
