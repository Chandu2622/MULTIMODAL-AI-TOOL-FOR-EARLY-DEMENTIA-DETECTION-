import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./mindtrack.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="in_progress")  # in_progress, completed

    # Cognitive raw scores (JSON stored as text)
    cognitive_data = Column(Text, nullable=True)
    mmse_total = Column(Float, nullable=True)
    cdrsb_total = Column(Float, nullable=True)
    adas_cog_total = Column(Float, nullable=True)
    cognitive_risk = Column(String, nullable=True)
    cognitive_confidence = Column(Float, nullable=True)

    # Speech
    speech_audio_path = Column(String, nullable=True)
    speech_risk = Column(String, nullable=True)
    speech_confidence = Column(Float, nullable=True)

    # Fused
    overall_risk = Column(String, nullable=True)
    overall_confidence = Column(Float, nullable=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
