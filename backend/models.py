import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student") # student, counsellor, admin
    department = Column(String(50), default="Computer Science & Engineering")
    roll_number = Column(String(30), nullable=True)
    avatar = Column(String(50), default="calm-teal")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    mood_entries = relationship("MoodCheckin", back_populates="user", cascade="all, delete-orphan")
    screenings = relationship("ScreeningResult", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("CounsellorAppointment", foreign_keys="CounsellorAppointment.student_id", back_populates="student")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(64), index=True, nullable=False)
    sender = Column(String(10), default="user") # 'user' or 'assistant'
    raw_text = Column(Text, nullable=False)
    masked_text = Column(Text, nullable=True)
    emotion = Column(String(30), default="neutral") # sadness, anxiety, anger, stress, loneliness, neutral, positive
    stress_level = Column(Float, default=0.0) # 0.0 to 1.0
    distress_score = Column(Float, default=0.0) # D(m) = min(1, Pneg * (1 + 0.5 * U))
    support_level = Column(Integer, default=0) # 0=self-help, 1=guided support, 2=counsellor referral, 3=crisis
    stressor = Column(String(50), default="general") # exams, placements, finances, hostel, relationships, sleep
    coping_ids = Column(String(255), default="")
    escalated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MoodCheckin(Base):
    __tablename__ = "mood_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(64), nullable=True)
    mood_score = Column(Integer, nullable=False) # 1 (terrible) to 5 (great)
    primary_emotion = Column(String(30), nullable=False)
    stressor_category = Column(String(50), default="academics")
    distress_score = Column(Float, default=0.2)
    journal_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="mood_entries")

class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    test_type = Column(String(20), nullable=False) # "PHQ-9" or "GAD-7"
    total_score = Column(Integer, nullable=False)
    severity_label = Column(String(50), nullable=False)
    answers_summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="screenings")

class CounsellorAppointment(Base):
    __tablename__ = "counsellor_appointments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    counsellor_name = Column(String(100), default="Dr. S. Aarthi (Lead Campus Counsellor)")
    student_alias = Column(String(100), default="Anonymous Student")
    department = Column(String(50), default="CSE")
    slot_date = Column(String(30), nullable=False)
    slot_time = Column(String(30), nullable=False)
    mode = Column(String(30), default="In-Person (Health Center)") # "In-Person" or "Confidential Online Call"
    topic = Column(String(100), default="Exam Anxiety & Sleep Issues")
    notes = Column(Text, nullable=True)
    counsellor_notes = Column(Text, nullable=True)
    share_summary_consented = Column(Boolean, default=True)
    urgency = Column(String(20), default="routine") # routine, elevated, crisis
    status = Column(String(20), default="confirmed") # confirmed, in-progress, completed, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="appointments")

class CrisisLog(Base):
    __tablename__ = "crisis_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False)
    user_id = Column(Integer, nullable=True)
    trigger_message = Column(Text, nullable=False)
    distress_score = Column(Float, default=1.0)
    status = Column(String(30), default="Alerted") # Alerted, Helpline Provided, Counsellor Connected
    action_taken = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CounsellorProfile(Base):
    """Admin-managed counsellor profiles visible to students during booking."""
    __tablename__ = "counsellor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(100), default="Campus Counsellor")
    specialization = Column(String(200), default="General Counselling & Stress Management")
    room = Column(String(80), default="Room 204, Health Center")
    available_slots = Column(String(200), default="Mon-Fri, 9:00 AM – 5:00 PM")
    email = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

