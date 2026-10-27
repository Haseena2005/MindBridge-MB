import datetime
import random
from passlib.context import CryptContext
from .database import engine, Base, SessionLocal
from .models import User, ChatMessage, MoodCheckin, ScreeningResult, CounsellorAppointment, CrisisLog

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        db.close()
        return

    print("Seeding MindBridge database with initial users and campus historical data...")

    # 1. Create Default Users
    student_user = User(
        username="student",
        email="student@campus.edu",
        full_name="Student",
        password_hash=hash_password("mindbridge123"),
        role="student",
        department="Computer Science & Engineering",
        roll_number="STU-2024-001",
        avatar="calm-teal"
    )

    counsellor_user = User(
        username="counsellor",
        email="counsellor@campus.edu",
        full_name="Dr. S. Aarthi",
        password_hash=hash_password("mindbridge123"),
        role="counsellor",
        department="Counseling & Student Wellness",
        roll_number="FAC-WELL-042",
        avatar="warm-amber"
    )

    admin_user = User(
        username="admin",
        email="admin@campus.edu",
        full_name="Dean of Student Affairs",
        password_hash=hash_password("admin123"),
        role="admin",
        department="Academic Administration",
        roll_number="ADM-001",
        avatar="deep-indigo"
    )

    db.add_all([student_user, counsellor_user, admin_user])
    db.commit()
    db.refresh(student_user)
    db.refresh(counsellor_user)

    # 2. Seed Longitudinal Mood Check-ins for Student (Past 14 Days)
    base_date = datetime.datetime.utcnow() - datetime.timedelta(days=14)
    sample_moods = [
        (4, "calm", "academics", 0.22, "Reviewed my data structures notes in the library. Felt productive."),
        (3, "neutral", "sleep", 0.28, "Woke up a bit late, had coffee and rushed to 8:30 class."),
        (3, "stress", "hostel", 0.42, "Noisy hostel corridor till 1 AM. Hard to rest well."),
        (2, "anxiety", "exams", 0.58, "Unit test announcement came out for Theory of Computation. Feeling tight in the chest."),
        (2, "stress", "exams", 0.64, "Heavy syllabus to cover. Tried the 4-4-4-4 breathing technique."),
        (1, "anxiety", "placements", 0.72, "Friend got placed at TCS, while my mock coding assessment was tough."),
        (2, "sadness", "placements", 0.65, "Wondering if my resume is strong enough for upcoming campus drives."),
        (3, "neutral", "academics", 0.38, "Met with project guide Dr. Aarthi, got some clear action items."),
        (4, "positive", "relationships", 0.18, "Evening tea with college friends, felt much more grounded."),
        (3, "calm", "academics", 0.25, "Finished the lab report on time."),
        (2, "stress", "exams", 0.52, "Internal exam timetable published. Schedule looks packed."),
        (2, "anxiety", "exams", 0.61, "Studied for 4 hours. Used the study pomodoro micro-chunking planner."),
        (3, "neutral", "sleep", 0.35, "Sleep was decent with earplugs on."),
        (3, "calm", "general", 0.29, "Ready for today's classes and coding practice.")
    ]

    for i, (m_score, emo, stressor, distress, note) in enumerate(sample_moods):
        entry_time = base_date + datetime.timedelta(days=i, hours=random.randint(9, 21))
        checkin = MoodCheckin(
            user_id=student_user.id,
            session_id=f"sess-hist-{i}",
            mood_score=m_score,
            primary_emotion=emo,
            stressor_category=stressor,
            distress_score=distress,
            journal_note=note,
            created_at=entry_time
        )
        db.add(checkin)

    # 3. Seed Campus Aggregated Mood Data (representing ~4000 anonymised student events over 14 weeks)
    stressor_dist = ["exams", "placements", "hostel", "relationships", "sleep", "finances"]
    emotion_dist = ["anxiety", "stress", "sadness", "neutral", "positive", "loneliness"]
    
    # We will generate sample anonymised checkins distributed across weeks
    for w in range(14, 0, -1):
        # In week 5-6 exams spike, in week 7-8 placements spike
        num_records = 25
        for _ in range(num_records):
            days_ago = w * 7 - random.randint(0, 6)
            created = datetime.datetime.utcnow() - datetime.timedelta(days=days_ago)
            
            # Weighted stressor selection per report
            if w in [5, 6, 4]:
                cur_stressor = random.choices(stressor_dist, weights=[0.55, 0.15, 0.10, 0.08, 0.08, 0.04])[0]
            elif w in [7, 8]:
                cur_stressor = random.choices(stressor_dist, weights=[0.20, 0.50, 0.10, 0.08, 0.08, 0.04])[0]
            else:
                cur_stressor = random.choice(stressor_dist)
            
            cur_emotion = random.choice(emotion_dist)
            cur_distress = round(random.uniform(0.15, 0.78), 2)
            cur_mood = random.randint(1, 5)

            anon_checkin = MoodCheckin(
                user_id=None, # fully anonymized
                session_id=f"campus-anon-w{w}-{random.randint(100, 999)}",
                mood_score=cur_mood,
                primary_emotion=cur_emotion,
                stressor_category=cur_stressor,
                distress_score=cur_distress,
                journal_note="Anonymized campus mood record",
                created_at=created
            )
            db.add(anon_checkin)

    # 4. Seed Standardized Screening Results (PHQ-9 and GAD-7)
    phq9_entry = ScreeningResult(
        user_id=student_user.id,
        test_type="PHQ-9",
        total_score=8,
        severity_label="Mild Depression",
        answers_summary="Occasional trouble falling asleep, feeling tired, low concentration.",
        recommended_action="Level 1 Guided Support: CBT thought reframing, sleep hygiene, and peer study groups.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
    )

    gad7_entry = ScreeningResult(
        user_id=student_user.id,
        test_type="GAD-7",
        total_score=11,
        severity_label="Moderate Anxiety",
        answers_summary="Feeling nervous, anxious or on edge more than half the days; trouble relaxing.",
        recommended_action="Level 2 Counsellor Referral Recommended: Box breathing exercises + optional 15-min campus counsellor chat.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    db.add_all([phq9_entry, gad7_entry])

    # 5. Seed Counsellor Appointments
    appt1 = CounsellorAppointment(
        student_id=student_user.id,
        counsellor_name="Dr. S. Aarthi (Lead Campus Counsellor)",
        student_alias="Student (CSE, Yr-3)",
        department="Computer Science & Engineering",
        slot_date=(datetime.datetime.utcnow() + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
        slot_time="10:30 AM - 11:00 AM",
        mode="In-Person (Room 204, Student Health Center)",
        topic="Upcoming Semester Exam Stress & Concentration",
        notes="Shared consented distress score: 0.61 (Level 2). Would like practical advice on time-blocking and managing palpitations during tests.",
        counsellor_notes="Confirmed. Scheduled preparatory guide sent to student portal.",
        share_summary_consented=True,
        urgency="routine",
        status="confirmed"
    )

    appt2 = CounsellorAppointment(
        student_id=None,
        counsellor_name="Dr. S. Aarthi (Lead Campus Counsellor)",
        student_alias="Anonymous Student #842",
        department="Mechanical Engineering",
        slot_date=(datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
        slot_time="02:00 PM - 02:30 PM",
        mode="Confidential Online Call",
        topic="Hostel Adjustment & Family Expectations",
        notes="Student requested anonymous consultation with audio only.",
        counsellor_notes="Private link generated. Session scheduled.",
        share_summary_consented=False,
        urgency="elevated",
        status="confirmed"
    )

    db.add_all([appt1, appt2])

    # 6. Seed Table 8.4 Benchmark Messages into Chat History
    benchmark_chat = [
        ("A bit tired today, but I'm fine.", "user", "neutral", 0.18, 0.18, 0, "general"),
        ("Thank you for checking in! Feeling a bit tired is natural after heavy lectures. Remember to take a quick hydration pause.", "assistant", "neutral", 0.18, 0.18, 0, "general"),
        ("Can't sleep because of hostel noise, feeling stressed.", "user", "stress", 0.50, 0.41, 1, "hostel"),
        ("Hostel corridor noise can be really disruptive when you're trying to unwind. Here is our Bedtime Wind-Down Protocol and sensory grounding technique to ease your mind.", "assistant", "stress", 0.50, 0.41, 1, "hostel"),
        ("Exams are next week and I can't focus, I feel anxious.", "user", "anxiety", 0.65, 0.62, 2, "exams"),
        ("Exam anticipation can make thoughts race and freeze your focus. Let's do a 4-4-4-4 Box Breathing cycle together right now, and chunk your syllabus into 15-minute sprints. If this feeling lingers, Dr. Aarthi at the campus center has open slots this week.", "assistant", "anxiety", 0.65, 0.62, 2, "exams")
    ]

    for raw, sender, emo, stress, distress, lvl, stressor in benchmark_chat:
        msg = ChatMessage(
            user_id=student_user.id,
            session_id="benchmark-session-1",
            sender=sender,
            raw_text=raw,
            masked_text=raw,
            emotion=emo,
            stress_level=stress,
            distress_score=distress,
            support_level=lvl,
            stressor=stressor,
            escalated=(lvl == 3)
        )
        db.add(msg)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
