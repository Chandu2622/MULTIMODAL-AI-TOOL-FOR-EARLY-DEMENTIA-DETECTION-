from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Depends
from schemas import SpeechSubmit
from data import db
from models import speech_model
from utils.auth import get_current_user

router = APIRouter(prefix="/submit", tags=["Submit"])

@router.post("/speech")
async def submit_speech(
    session_id: str = Form(...),
    transcript: str = Form(""),
    duration_seconds: int = Form(60),
    audio_file: UploadFile = File(None),
    current_user: str = Depends(get_current_user)
):
    database = db.read_db()
    found_user = None
    user_data = database.get("users", {}).get(current_user, {})
    for s in user_data.get("sessions", []):
        if s["session_id"] == session_id:
            found_user = current_user
            break
            
    if not found_user:
        raise HTTPException(status_code=404, detail="Session not found or not authorized")
        
    word_count = len(transcript.split())
    
    # Read audio bytes if uploaded
    audio_bytes = None
    if audio_file:
        audio_bytes = await audio_file.read()

    analysis = speech_model.analyze_speech(transcript, duration_seconds, word_count, audio_bytes=audio_bytes)
    
    db.update_session(found_user, session_id, {
        "speech_input": {
            "transcript": transcript,
            "duration": duration_seconds,
            "word_count": word_count
        },
        "speech_analysis": analysis
    })
    
    return {
        "received": True,
        "word_count": word_count,
        "speech_features_mock": analysis.get("features", {})
    }
