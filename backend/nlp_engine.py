import re
import math
from typing import Dict, Any, List, Tuple

# Crisis cues regex patterns (high recall)
CRISIS_PATTERNS = [
    r"\b(suicid\w*|kill\s+(my\s*self|me)|die\b|end\s+my\s+life|want\s+to\s+die|harm\s+myself)\b",
    r"\b(take\s+my\s+(own\s+)?life|no\s+point\s+in\s+going\s+on|better\s+off\s+dead|hanging\s+myself)\b",
    r"\b(cut\s+my\s+wrists?|overdose\b|don'?t\s+want\s+to\s+live|goodbye\s+cruel\s+world)\b",
    r"\b(can'?t\s+take\s+this\s+anymore|everything\s+feels\s+pointless|want\s+to\s+disappear\s+forever)\b"
]

# PII Masking regex patterns
PHONE_PATTERN = r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
EMAIL_PATTERN = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
ROLL_NO_PATTERN = r"\b\d{10,14}\b"
NAME_INTRO_PATTERN = r"(?i)\b(my name is|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b"

# Stressors keywords
STRESSOR_KEYWORDS = {
    "exams": ["exam", "test", "finals", "midterm", "marks", "grade", "gpa", "syllabus", "studying", "revision", "assessment", "arrear", "semester"],
    "placements": ["placement", "interview", "job", "career", "offer", "resume", "rejection", "recruitment", "internship", "package", "hiring"],
    "hostel": ["hostel", "roommate", "mess food", "homesick", "warden", "noisy", "room", "campus living", "staying away", "curfew"],
    "relationships": ["friend", "relationship", "breakup", "lonely", "family", "parents", "fight", "isolated", "argument", "peer", "social"],
    "sleep": ["insomnia", "cannot sleep", "nightmare", "tired", "exhausted", "sleep deprivation", "waking up", "fatigue"],
    "finances": ["fees", "money", "loan", "expenses", "afford", "financial", "debt"]
}

# Emotion lexicons with valence and weight
EMOTION_LEXICONS = {
    "sadness": ["sad", "depressed", "down", "crying", "unhappy", "hopeless", "miserable", "heartbroken", "gloomy", "heavy", "worthless", "empty"],
    "anxiety": ["anxious", "panic", "worried", "nervous", "fear", "scared", "dread", "shaking", "restless", "on edge", "racing heart", "freaking out"],
    "anger": ["angry", "furious", "mad", "irritated", "annoyed", "frustrated", "unfair", "rage", "hate", "resentful"],
    "stress": ["stressed", "overwhelmed", "pressure", "burden", "burnout", "swamped", "too much", "drowning", "suffocating", "hectic", "deadline"],
    "loneliness": ["lonely", "alone", "isolated", "nobody", "no friends", "left out", "abandoned", "alienated", "unheard"],
    "positive": ["happy", "relieved", "hopeful", "calm", "grateful", "better", "peaceful", "proud", "excited", "good", "great", "content"],
    "neutral": ["okay", "fine", "alright", "normal", "average", "regular"]
}

# Vetted Evidence-Based Coping Strategies
COPING_LIBRARY = {
    "cbt_breathing_02": {
        "id": "cbt_breathing_02",
        "title": "4-4-4-4 Box Breathing Technique",
        "category": "Physiological Reset",
        "suitable_for": ["anxiety", "panic", "stress", "exams"],
        "summary": "Equal-ratio breath pacing that calms the sympathetic nervous system within 2 minutes.",
        "steps": [
            "Inhale slowly through your nose for 4 seconds.",
            "Hold your breath gently for 4 seconds.",
            "Exhale smoothly through your mouth for 4 seconds.",
            "Hold empty lungs for 4 seconds before the next cycle.",
            "Repeat for 4 cycles to lower cortisol and heart rate."
        ]
    },
    "cbt_grounding_54321": {
        "id": "cbt_grounding_54321",
        "title": "5-4-3-2-1 Sensory Grounding",
        "category": "Grounding Exercise",
        "suitable_for": ["anxiety", "overwhelm", "panic", "stress"],
        "summary": "Anchors an overstimulated mind back into the physical present through five senses.",
        "steps": [
            "Acknowledge 5 things you can see around your room right now.",
            "Touch 4 physical textures (your desk, clothing, notebook, chair).",
            "Listen for 3 distinct ambient sounds (fan hum, footsteps, distant traffic).",
            "Notice 2 things you can smell or scents you enjoy.",
            "Identify 1 positive thing you can taste or take a slow sip of water."
        ]
    },
    "cbt_thought_reframe": {
        "id": "cbt_thought_reframe",
        "title": "Cognitive Thought Reframing (CBT Triad)",
        "category": "Cognitive Restructuring",
        "suitable_for": ["sadness", "stress", "placements", "exams"],
        "summary": "Separates automatic catastrophizing thoughts from objective facts.",
        "steps": [
            "Catch the thought: Name the harsh statement you are telling yourself (e.g. 'I will definitely fail this interview').",
            "Check the evidence: What are 2 concrete facts that challenge this absolute prediction?",
            "Reframe rationally: Replace it with a grounded perspective: 'One rejection or challenging test does not define my worth or intelligence; it's one data point I can learn from.'"
        ]
    },
    "cbt_study_plan_05": {
        "id": "cbt_study_plan_05",
        "title": "Micro-Chunking & Pomodoro Study Action",
        "category": "Academic Stress Relief",
        "suitable_for": ["exams", "stress", "overwhelm"],
        "summary": "Destroys exam paralysis by shrinking massive syllabi into 15-minute manageable micro-goals.",
        "steps": [
            "Pick ONE sub-topic or 2 pages of notes only.",
            "Set a gentle timer for 15 minutes of low-pressure focus.",
            "Turn off notifications; remind yourself: 'I only need to do these 15 minutes.'",
            "Take an immediate 3-minute physical stretch when the timer dings."
        ]
    },
    "cbt_sleep_hygiene": {
        "id": "cbt_sleep_hygiene",
        "title": "Campus Bedtime Wind-Down Protocol",
        "category": "Sleep Restoration",
        "suitable_for": ["sleep", "hostel", "stress"],
        "summary": "Helps college students decompress despite noisy hostel environments or late-night screen fatigue.",
        "steps": [
            "Put phone in Do Not Disturb 20 minutes before lights out.",
            "Write down tomorrow's 3 priority tasks on paper to empty your mental buffer.",
            "Dim blue lights; use earplugs or gentle white noise if the corridor is loud.",
            "Do 5 long, slow exhalations to tell your body it is safe to rest."
        ]
    }
}

class NLPEngine:
    def __init__(self):
        pass

    def mask_pii(self, text: str) -> str:
        """Stage 4.1.2: Masks names, phone numbers, roll numbers, and emails."""
        cleaned = text
        cleaned = re.sub(PHONE_PATTERN, "[PHONE_MASKED]", cleaned)
        cleaned = re.sub(EMAIL_PATTERN, "[EMAIL_MASKED]", cleaned)
        cleaned = re.sub(ROLL_NO_PATTERN, "[ROLL_NO_MASKED]", cleaned)
        cleaned = re.sub(NAME_INTRO_PATTERN, r"\1 [NAME_MASKED]", cleaned)
        return cleaned

    def detect_crisis(self, text: str) -> Tuple[bool, List[str]]:
        """Stage 4.1.4: Rule-based crisis screening (high recall)."""
        lower = text.lower()
        matched = []
        for pattern in CRISIS_PATTERNS:
            matches = re.findall(pattern, lower)
            if matches:
                matched.append(pattern)
        return (len(matched) > 0, matched)

    def detect_stressor(self, text: str) -> str:
        """Identifies student stressor category (exams, placements, hostel, etc.)."""
        lower = text.lower()
        scores = {}
        for category, kws in STRESSOR_KEYWORDS.items():
            count = sum(1 for kw in kws if kw in lower)
            if count > 0:
                scores[category] = count
        if scores:
            return max(scores, key=scores.get)
        return "general"

    def classify_emotion_and_stress(self, text: str) -> Dict[str, Any]:
        """Stage 4.1.3: Classifies emotion probabilities and estimates stress level."""
        lower = text.lower()
        words = re.findall(r"\b\w+\b", lower)

        emotion_hits = {emo: 0.05 for emo in EMOTION_LEXICONS} # base prior
        
        # Check negations like "not happy", "cannot sleep"
        negation_active = False
        negation_terms = ["not", "never", "no", "can't", "cant", "don't", "dont", "hardly"]

        for i, word in enumerate(words):
            if word in negation_terms:
                negation_active = True
                continue

            for emo, kw_list in EMOTION_LEXICONS.items():
                if word in kw_list:
                    if negation_active and emo == "positive":
                        emotion_hits["sadness"] += 1.5
                        emotion_hits["stress"] += 1.0
                    elif negation_active and emo in ["sadness", "anxiety", "stress"]:
                        emotion_hits["neutral"] += 1.0
                    else:
                        emotion_hits[emo] += 2.0
            
            # Reset negation after 3 tokens
            if i > 0 and words[i-1] in negation_terms:
                negation_active = False

        total_weight = sum(emotion_hits.values())
        probs = {k: v / total_weight for k, v in emotion_hits.items()}
        primary_emotion = max(probs, key=probs.get)

        # Negative emotion sum: sadness, anxiety, anger, stress, loneliness
        p_neg = sum(probs[e] for e in ["sadness", "anxiety", "anger", "stress", "loneliness"])
        p_neg = min(1.0, max(0.05, p_neg))

        # Stress level estimation based on stress/anxiety weights and exclamations/length
        stress_level = min(1.0, (probs["stress"] * 1.5 + probs["anxiety"] * 1.2 + probs["sadness"] * 0.8))
        if "!" in text or text.isupper():
            stress_level = min(1.0, stress_level + 0.15)

        return {
            "primary_emotion": primary_emotion,
            "probabilities": probs,
            "p_neg": round(p_neg, 3),
            "stress_level": round(stress_level, 3)
        }

    def compute_distress_and_level(self, p_neg: float, is_crisis: bool) -> Tuple[float, int]:
        """
        Section 5.2.2 Support Ladder formula:
        D(m) = min(1, Pneg(m) * (1 + lambda * U(m))), lambda = 0.5
        Table 5.1:
        Level 0: D < 0.30 (Self-help)
        Level 1: 0.30 <= D <= 0.54 (Guided CBT support)
        Level 2: 0.55 <= D <= 0.79 (Counsellor referral)
        Level 3: D >= 0.80 or any crisis cue (Crisis)
        """
        u = 1.0 if is_crisis else 0.0
        lam = 0.5
        distress = min(1.0, p_neg * (1.0 + lam * u))
        distress = round(distress, 2)

        if is_crisis or distress >= 0.80:
            level = 3
        elif distress >= 0.55:
            level = 2
        elif distress >= 0.30:
            level = 1
        else:
            level = 0

        return distress, level

    def get_matched_coping_strategies(self, emotion: str, stressor: str) -> List[Dict[str, Any]]:
        """Retrieves best matching evidence-based CBT exercises."""
        selected = []
        if stressor == "exams":
            selected.append(COPING_LIBRARY["cbt_study_plan_05"])
            selected.append(COPING_LIBRARY["cbt_breathing_02"])
        elif stressor == "sleep" or stressor == "hostel":
            selected.append(COPING_LIBRARY["cbt_sleep_hygiene"])
            selected.append(COPING_LIBRARY["cbt_grounding_54321"])
        elif emotion in ["anxiety", "stress"]:
            selected.append(COPING_LIBRARY["cbt_breathing_02"])
            selected.append(COPING_LIBRARY["cbt_grounding_54321"])
        elif emotion in ["sadness", "loneliness"]:
            selected.append(COPING_LIBRARY["cbt_thought_reframe"])
            selected.append(COPING_LIBRARY["cbt_grounding_54321"])
        else:
            selected.append(COPING_LIBRARY["cbt_breathing_02"])
            selected.append(COPING_LIBRARY["cbt_thought_reframe"])
        return selected

    def generate_supportive_response(
        self,
        masked_text: str,
        emotion: str,
        stressor: str,
        distress_score: float,
        support_level: int,
        is_crisis: bool
    ) -> Dict[str, Any]:
        """
        Generates empathetic, CBT-informed reply.
        For Level 3 (Crisis): strictly returns deterministic crisis net with national & campus helplines.
        """
        # Level 3: Deterministic Safety Protocol (Section 5.2.3)
        if support_level == 3 or is_crisis:
            escalation_msg = (
                "💙 I hear how difficult and overwhelming things feel right now, but please know that you do not have to carry this alone. "
                "Your safety and life matter deeply. Because your message indicates you may be in intense distress or having thoughts of harm, "
                "I am connecting you immediately with confidential, 24/7 trained human professionals who want to help:\n\n"
                "🚨 **EMERGENCY HELPLINES (CONFIDENTIAL & FREE):**\n"
                "• **Tele-MANAS (Govt of India 24/7):** Dial **14416** or **1800-891-4416**\n"
                "• **KIRAN Mental Health Helpline:** Dial **1800-599-0019**\n"
                "• **Vandrevala Foundation:** Call or WhatsApp **+91 9999 666 555**\n"
                "• **Sneha India Suicide Prevention:** **044-24640050**\n"
                "• **Campus Emergency Counselor:** Contact Student Health Center at extension **#4004**\n\n"
                "Please reach out to one of these numbers right away or talk to a trusted friend or faculty advisor. "
                "You can also click the **'Connect With Campus Counsellor'** button below to prioritize an urgent session."
            )
            return {
                "message": escalation_msg,
                "is_crisis": True,
                "helpline_info": {
                    "tele_manas": "14416",
                    "kiran": "1800-599-0019",
                    "vandrevala": "+91 9999 666 555",
                    "campus_health": "Ext #4004"
                },
                "recommended_tools": ["counsellor_booking", "emergency_call"]
            }

        coping_list = self.get_matched_coping_strategies(emotion, stressor)
        coping_first = coping_list[0]

        # Empathy acknowledgment phrases
        empathy_templates = {
            "sadness": "I can feel how heavy and disheartening this is for you right now.",
            "anxiety": "It sounds like anxiety is running high and creating a lot of tension.",
            "stress": "College demands can feel completely overwhelming when everything piles up at once.",
            "anger": "It is completely understandable to feel frustrated when situations feel out of control.",
            "loneliness": "Feeling isolated or disconnected while at college is really painful, but you are not alone.",
            "positive": "It's really encouraging to hear some positivity in your experience!",
            "neutral": "Thank you for checking in and sharing what's on your mind today."
        }

        ack = empathy_templates.get(emotion, "I hear you and I appreciate you opening up about this.")

        if support_level == 2:
            # Counsellor referral recommended (Table 5.1 & Section 5.2.2)
            body = (
                f"{ack} While you are navigating these feelings around {stressor}, remember that sustained distress is not something you need to bear on your own. "
                f"I recommend trying this grounded step right now:\n\n"
                f"✨ **{coping_first['title']}**\n{coping_first['summary']}\n"
                + "\n".join([f"• {s}" for s in coping_first['steps']]) +
                f"\n\n🤝 **Next Gentle Step:** Because your stress level is elevated (Distress Score: {distress_score:.2f}), "
                f"our campus counsellors (like Dr. S. Aarthi at the Campus Health & Wellness Center) offer confidential, supportive one-on-one sessions. "
                f"Would you like to book a quick, judgement-free 15-minute slot through the button below?"
            )
        elif support_level == 1:
            # Guided support
            body = (
                f"{ack} You're dealing with notable tension around {stressor}, and taking 2 minutes right now can help reset your mental bandwidth.\n\n"
                f"🌿 **Recommended Evidence-Based Technique:**\n"
                f"**{coping_first['title']}** — {coping_first['summary']}\n"
                + "\n".join([f"• {s}" for s in coping_first['steps']]) +
                f"\n\nTake it one small breath at a time. What part of {stressor} feels heaviest right now?"
            )
        else:
            # Level 0: Everyday self-help & validation
            body = (
                f"{ack} It's great that you're taking a moment to check in with yourself. Maintaining your emotional balance during semester life is a continuous practice.\n\n"
                f"💡 **Quick Wellness Anchor:**\n"
                f"**{coping_first['title']}**\n"
                + "\n".join([f"• {s}" for s in coping_first['steps'][:3]]) +
                f"\n\nKeep observing how you feel throughout the day, and feel free to log your mood in your private tracker anytime!"
            )

        return {
            "message": body,
            "is_crisis": False,
            "helpline_info": None,
            "recommended_tools": [coping_first['id']]
        }

nlp_engine = NLPEngine()
