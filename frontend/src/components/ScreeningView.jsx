import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Activity, AlertCircle, CheckCircle2, Award, ChevronRight, ArrowLeft } from 'lucide-react';

export default function ScreeningView({ user, onNavigate }) {
  const [activeTest, setActiveTest] = useState('PHQ-9'); // 'PHQ-9' or 'GAD-7'
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const phq9Questions = [
    "Little interest or pleasure in doing tasks or college activities?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling or staying asleep, or sleeping too much in the hostel/home?",
    "Feeling tired, fatigued, or having very little physical energy?",
    "Poor appetite or overeating during stressful times?",
    "Feeling bad about yourself — or that you are a failure or let your family down?",
    "Trouble concentrating on things, such as lectures, reading books, or exams?",
    "Moving or speaking noticeably slowly, or being fidgety/restless?",
    "Thoughts that you would be better off asleep or hurting yourself in some way?"
  ];

  const gad7Questions = [
    "Feeling nervous, anxious, or constantly on edge?",
    "Not being able to stop or control excessive worrying?",
    "Worrying too much about different things (grades, placements, future)?",
    "Having serious trouble relaxing and unwinding?",
    "Being so restless that it is hard to sit still in class or study?",
    "Becoming easily annoyed, frustrated, or irritable?",
    "Feeling afraid, as if something awful or terrible might happen?"
  ];

  const frequencyOptions = [
    { label: "Not at all", points: 0 },
    { label: "Several days", points: 1 },
    { label: "More than half the days", points: 2 },
    { label: "Nearly every day", points: 3 }
  ];

  const questions = activeTest === 'PHQ-9' ? phq9Questions : gad7Questions;

  useEffect(() => {
    fetchHistory();
    setAnswers({});
    setResult(null);
  }, [activeTest, user]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/screening/history?user_id=${user?.id || ''}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAnswer = (qIndex, points) => {
    setAnswers(prev => ({ ...prev, [qIndex]: points }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert(`Please answer all ${questions.length} questions to receive an accurate assessment.`);
      return;
    }

    const answersArray = questions.map((_, i) => answers[i] || 0);
    setSubmitting(true);

    try {
      const res = await fetch('/api/screening/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          test_type: activeTest,
          answers: answersArray
        })
      });

      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Test Selector Banner */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={22} color="#06b6d4" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Standardized Clinical Screenings</h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Validated psychiatric self-assessments (PHQ-9 & GAD-7) recommended in Project Report Section 2.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${activeTest === 'PHQ-9' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTest('PHQ-9'); setResult(null); setAnswers({}); }}
          >
            PHQ-9 (Depression Scale)
          </button>
          <button
            type="button"
            className={`btn ${activeTest === 'GAD-7' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTest('GAD-7'); setResult(null); setAnswers({}); }}
          >
            GAD-7 (Anxiety Scale)
          </button>
        </div>
      </div>

      {result ? (
        /* Result Display Card */
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(99, 102, 241, 0.2)', 
            border: '2px solid #6366f1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Activity size={32} color="#6366f1" />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            {result.test_type} Assessment Completed
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', margin: '12px 0' }}>
            Score: {result.total_score} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>/ {result.max_score}</span>
          </div>

          <div style={{ 
            display: 'inline-block', 
            padding: '8px 18px', 
            borderRadius: '999px', 
            background: 'rgba(255, 255, 255, 0.08)', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '20px'
          }}>
            Severity Category: <span style={{ color: '#fbbf24' }}>{result.severity_label}</span>
          </div>

          <div style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: 'rgba(0,0,0,0.3)', 
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'left',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Clinical & CBT Guidance:
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {result.recommended_action}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setResult(null); setAnswers({}); }}
            >
              Take Assessment Again
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('counsellor')}
            >
              Discuss With Campus Counsellor
            </button>
          </div>
        </div>
      ) : (
        /* Questions Questionnaire Form */
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {activeTest === 'PHQ-9' ? 'PHQ-9 Depression Screener' : 'GAD-7 Generalized Anxiety Screener'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Over the last 2 weeks, how often have you been bothered by any of the following problems?
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              👤 {user?.full_name || user?.username || 'Student'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {questions.map((q, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)' 
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '12px', color: '#f8fafc' }}>
                  {idx + 1}. {q}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {frequencyOptions.map((opt) => {
                    const isSelected = answers[idx] === opt.points;
                    return (
                      <button
                        key={opt.points}
                        type="button"
                        onClick={() => handleSelectAnswer(idx, opt.points)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {opt.label} ({opt.points})
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Answered: {Object.keys(answers).length} / {questions.length}
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: '12px 24px' }}
            >
              {submitting ? 'Scoring Assessment...' : 'Calculate My Score & Guidance'}
            </button>
          </div>
        </form>
      )}

      {/* Past Screenings History */}
      {history.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-muted)' }}>
            Your Screening Records
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {history.map((h) => (
              <div 
                key={h.id} 
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#06b6d4' }}>{h.test_type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{h.created_at}</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '6px 0', color: '#f8fafc' }}>
                  Score: {h.total_score}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                  {h.severity_label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
