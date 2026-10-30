import json
from pathlib import Path
from typing import Dict, Any

DATA_FILE = Path(__file__).parent / "users.json"

def read_db() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        return {"users": {}}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_db(data: Dict[str, Any]):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_user(user_id: str) -> Dict[str, Any]:
    db = read_db()
    return db["users"].get(user_id)

def get_user_by_email(email: str):
    db = read_db()
    for user_id, user_data in db.get("users", {}).items():
        user_email = user_data.get("profile", {}).get("email")
        if user_email and user_email.lower() == email.lower():
            return user_id, user_data
    return None, None

def create_user(user_id: str, profile: Dict[str, Any]):
    db = read_db()
    db["users"][user_id] = {"profile": profile, "sessions": []}
    write_db(db)

def update_user_profile(user_id: str, updates: Dict[str, Any]):
    db = read_db()
    if user_id in db["users"]:
        db["users"][user_id]["profile"].update(updates)
        write_db(db)

def get_session(user_id: str, session_id: str) -> Dict[str, Any]:
    user = get_user(user_id)
    if not user:
        return None
    for session in user["sessions"]:
        if session["session_id"] == session_id:
            return session
    return None

def update_session(user_id: str, session_id: str, data: Dict[str, Any]):
    db = read_db()
    user = db["users"].get(user_id)
    if not user:
        return
    for session in user["sessions"]:
        if session["session_id"] == session_id:
            session.update(data)
            break
    write_db(db)
    
def add_session(user_id: str, session_data: Dict[str, Any]):
    db = read_db()
    if user_id in db["users"]:
        db["users"][user_id]["sessions"].append(session_data)
        write_db(db)
