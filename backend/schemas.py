from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: str
    age: int
    gender: str
    education: str
    language: str = "English"
    memory_concerns: str = ""
    emergency_name: str = ""
    emergency_contact: str = ""
    consent: bool

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SessionCreate(BaseModel):
    user_id: str
    age: int
    education: str

class SpeechSubmit(BaseModel):
    session_id: str
    transcript: str
    duration_seconds: int

class CognitiveSubmit(BaseModel):
    session_id: str
    mmse_answers: Dict[str, Any]
    cdrsb_answers: Dict[str, Any]
    total13_answers: Dict[str, Any]

class PredictRequest(BaseModel):
    session_id: str
