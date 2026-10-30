from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import uuid
import datetime
from schemas import UserCreate, UserLogin, UserProfileUpdate, Token, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
from data import db
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from utils.email import send_otp_email
import random

router = APIRouter(prefix="/users", tags=["Users"])

# In-memory store for OTPs
# Format: {email: {"otp": str, "expires": datetime, "attempts": int}}
OTP_STORE = {}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    user_id, _ = db.get_user_by_email(req.email)
    if not user_id:
        # Don't reveal if email exists, just return success
        return {"message": "If the email is registered, an OTP has been sent."}
    
    otp = str(random.randint(100000, 999999))
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    OTP_STORE[req.email] = {
        "otp": otp,
        "expires": expires,
        "attempts": 0
    }
    
    # Attempt to send the real email
    email_sent = send_otp_email(req.email, otp)
    
    if not email_sent:
        # Fallback to simulate sending email by logging securely to terminal
        print(f"\n=========================================")
        print(f"🔒 SECURE OTP EMAIL SIMULATION")
        print(f"To: {req.email}")
        print(f"Your Password Reset OTP is: {otp}")
        print(f"Expires in 10 minutes.")
        print(f"=========================================\n")
    
    return {"message": "If the email is registered, an OTP has been sent."}

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    record = OTP_STORE.get(req.email)
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    if datetime.datetime.utcnow() > record["expires"]:
        del OTP_STORE[req.email]
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    if record["attempts"] >= 5:
        del OTP_STORE[req.email]
        raise HTTPException(status_code=400, detail="Maximum attempts exceeded. Request a new OTP.")
        
    if record["otp"] != req.otp:
        record["attempts"] += 1
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    record = OTP_STORE.get(req.email)
    if not record or record["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired session. Please request a new OTP.")
        
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
    user_id, user_data = db.get_user_by_email(req.email)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update password
    hashed_password = get_password_hash(req.new_password)
    db.update_user_profile(user_id, {"hashed_password": hashed_password})
    
    # Invalidate OTP
    del OTP_STORE[req.email]
    
    return {"message": "Password reset successfully"}

@router.post("/register", response_model=Token)
def register_user(user: UserCreate):
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    existing_id, _ = db.get_user_by_email(user.email)
    if existing_id:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    profile = {
        "email": user.email,
        "hashed_password": hashed_password,
        "onboarded": False,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    db.create_user(user_id, profile)
    access_token = create_access_token(data={"sub": user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_user(user: UserLogin):
    user_id, user_data = db.get_user_by_email(user.email)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    hashed = user_data["profile"].get("hashed_password")
    if not hashed or not verify_password(user.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.put("/profile")
def update_profile(profile_update: UserProfileUpdate, current_user: str = Depends(get_current_user)):
    updates = profile_update.model_dump()
    updates["onboarded"] = True
    db.update_user_profile(current_user, updates)
    return {"status": "success"}

@router.get("/me")
def get_me(current_user: str = Depends(get_current_user)):
    user = db.get_user(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = {k:v for k,v in user.get("profile", {}).items() if k != "hashed_password"}
    return {"user_id": current_user, "profile": profile}

@router.get("/{user_id}/history")
def get_user_history(user_id: str, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to view this history")
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "profile": {k:v for k,v in user.get("profile", {}).items() if k != "hashed_password"},
        "sessions": user.get("sessions", [])
    }
