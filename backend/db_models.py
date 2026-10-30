from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("AssessmentSession", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    education_level = Column(String(100), nullable=True)
    language = Column(String(100), nullable=True, default="English")
    memory_concerns = Column(String(255), nullable=True)
    emergency_name = Column(String(255), nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    consent = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")

class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    
    test_flow_seed = Column(String(36), nullable=True)
    test_flow = Column(JSON, nullable=True)
    cognitive_responses = Column(JSON, nullable=True)
    speech_responses = Column(JSON, nullable=True)
    
    cognitive_score = Column(Float, nullable=True)
    speech_score = Column(Float, nullable=True)
    combined_risk_score = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True)
    domain_breakdown = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")

class OTPRecord(Base):
    __tablename__ = "otp_records"

    email = Column(String(255), primary_key=True, index=True)
    otp = Column(String(10), nullable=False)
    attempts = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
