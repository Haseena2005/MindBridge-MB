import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, Smile, Frown, Meh, Heart, Award, CheckCircle, Info } from 'lucide-react';

export default function MoodTrackerView({ user, onNavigate }) {
  const [moodScore, setMoodScore] = useState(3);
  const [primaryEmotion, setPrimaryEmotion] = useState('calm');
  const [stressorCategory, setStressorCategory] = useState('academics');
  const [journalNote, setJournalNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState({ history: [], sustained_decline: false, warning_message: null });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const emotions = [
    { id: 'calm', label: '😌 Calm', color: '#10b981' },
    { id: 'positive', label: '✨ Hopeful & Happy', color: '#38bdf8' },
    { id: 'neutral', label: '😐 Neutral', color: '#94a3b8' },
    { id: 'stress', label: '⚡ Overwhelmed', color: '#f59e0b' },
    { id: 'anxiety', label: '😰 Anxious / Nervous', color: '#fb923c' },
    { id: 'sadness', label: '🌧️ Sad / Down', color: '#818cf8' },
    { id: 'loneliness', label: '🥀 Isolated', color: '#c084fc' },
    { id: 'anger', label: '🔥 Frustrated / Irritated', color: '#f43f5e' }
  ];

  const stressors = [
    { id: 'exams', label: '📚 Exams & Internal Tests' },
    { id: 'placements', label: '💼 Placements & Career' },
    { id: 'hostel', label: '🏢 Hostel & Living' },
    { id: 'sleep', label: '🌙 Sleep & Rest' },
    { id: 'relationships', label: '👥 Friends & Family' },
    { id: 'finances', label: '💳 Fees & Finances' }
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, [user]);

  const fetchMoodHistory = async () => {
    try {
      const res = await fetch(`/api/mood/history?user_id=${user?.id || ''}&limit=14`);
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogMood = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/mood/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          mood_score: moodScore,
          primary_emotion: primaryEmotion,
          stressor_category: stressorCategory,
          journal_note: journalNote
        })
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setJournalNote('');
        fetchMoodHistory();
        setTimeout(() => setSubmittedSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moodEmojis = [
    { score: 1, label: 'Very Low', icon: '😫', color: '#f43f5e' },
    { score: 2, label: 'Tense', icon: '😟', color: '#f59e0b' },
    { score: 3, label: 'Neutral', icon: '😐', color: '#94a3b8' },
    { score: 4, label: 'Good', icon: '🙂', color: '#38bdf8' },
    { score: 5, label: 'Great', icon: '😊', color: '#10b981' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Early-Warning Axiom Banner (Section 3.4) */}
      {historyData.sustained_decline && (
        <div style={{ 
          padding: '16px 20px', 
          borderRadius: '14px', 
          background: 'rgba(245, 158, 11, 0.15)', 
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 700, color: '#fef3c7' }}>
                Early-Warning Signal Flagged (Sustained Decline Detected)
              </div>
              <div style={{ fontSize: '0.86rem', color: '#fde68a' }}>
                {historyData.warning_message || "Your distress score has stayed above your baseline for several consecutive days. A quick check-in can help before exams."}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: '0.84rem', borderColor: '#f59e0b', color: '#fbbf24' }}
            onClick={() => onNavigate('counsellor')}
          >
            Schedule 15-min Counsellor Chat
          </button>
        </div>
      )}

      {/* Main Grid: Form on left, Longitudinal Chart on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)', gap: '24px' }}>
        
        {/* Left Card: Daily Mood & Emotion Check-in */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#06b6d4" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daily Mood & Emotion Check-In</h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 600 }}>
              👤 {user?.full_name || user?.username || 'Student'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Take 30 seconds to track how you feel. Your entries are private and fuel your personal early-warning trend.
          </p>

          <form onSubmit={handleLogMood}>
            {/* Mood Scale (1-5) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                1. How are you feeling overall today?
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {moodEmojis.map((item) => (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setMoodScore(item.score)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 6px',
                      borderRadius: '12px',
                      background: moodScore === item.score ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: moodScore === item.score ? `2px solid ${item.color}` : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: moodScore === item.score ? item.color : 'var(--text-muted)' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Emotion Pill Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                2. What emotion best captures your head-space?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {emotions.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setPrimaryEmotion(e.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: primaryEmotion === e.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: primaryEmotion === e.id ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: primaryEmotion === e.id ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stressor Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                3. What has been on your mind most? (Stressor)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {stressors.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStressorCategory(s.id)}
                    style={{
                      padding: '10px',
                      textAlign: 'left',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: stressorCategory === s.id ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      border: stressorCategory === s.id ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: stressorCategory === s.id ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Private Reflection Journal Note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                4. Private Note / Journal Reflection (Optional)
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="What happened today? Any particular lectures, project deadlines, or thoughts?"
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Daily Mood Check-In'}
            </button>

            {submittedSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginTop: '12px', fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> Mood check-in logged! Your personal trend is updated.
              </div>
            )}
          </form>
        </div>

        {/* Right Card: Longitudinal Distress Trend Chart & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="#6366f1" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Longitudinal Distress Trend (14-Days)</h2>
              </div>
              <span className="badge badge-level-1">Section 3.4 Axiom</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Visualizing personal distress score $D_t \in [0, 1]$ over time. A healthy pattern fluctuates; a sustained upward drift alerts you early.
            </p>

            {/* Visual Bar/Line Chart */}
            <div style={{ 
              height: '180px', 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '8px', 
              padding: '16px 10px 0 10px', 
              background: 'rgba(0,0,0,0.25)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '14px'
            }}>
              {historyData.history.length === 0 ? (
                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-dim)', alignSelf: 'center', fontSize: '0.85rem' }}>
                  No mood history entries yet. Submit your first check-in above!
                </div>
              ) : (
                historyData.history.slice(-14).map((item, idx) => {
                  const distressHeight = Math.max(15, Math.min(100, item.distress_score * 100));
                  const isHigh = item.distress_score >= 0.55;
                  const isModerate = item.distress_score >= 0.35 && item.distress_score < 0.55;
                  const color = isHigh ? '#f59e0b' : isModerate ? '#06b6d4' : '#10b981';

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        height: '100%', 
                        justifyContent: 'flex-end' 
                      }}
                      title={`Date: ${item.created_at} | Distress: ${item.distress_score} | Emotion: ${item.primary_emotion}`}
                    >
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                        {(item.distress_score).toFixed(2)}
                      </div>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${distressHeight}%`, 
                          background: `linear-gradient(180deg, ${color} 0%, rgba(99,102,241,0.2) 100%)`, 
                          borderRadius: '6px 6px 0 0',
                          border: `1px solid ${color}`,
                          transition: 'height 0.4s ease'
                        }}
                      />
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                        D{idx + 1}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Level 0 (Normal &lt;0.30)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }}></span> Level 1 (0.30 - 0.54)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Level 2 (&gt;0.55 Elevated)
              </span>
            </div>
          </div>

          {/* Past Mood Entries List */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)' }}>
              Recent Journal Snippets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historyData.history.slice(-5).reverse().map((entry) => (
                <div 
                  key={entry.id} 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: '10px', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 700, textTransform: 'capitalize', color: '#f8fafc' }}>{entry.primary_emotion}</span>
                      <span style={{ color: 'var(--text-dim)' }}>•</span>
                      <span style={{ color: '#06b6d4' }}>{entry.stressor_category}</span>
                      <span style={{ color: 'var(--text-dim)' }}>({entry.created_at})</span>
                    </div>
                    {entry.journal_note && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        "{entry.journal_note}"
                      </div>
                    )}
                  </div>
                  <span className={`badge ${entry.distress_score >= 0.55 ? 'badge-level-2' : entry.distress_score >= 0.3 ? 'badge-level-1' : 'badge-level-0'}`}>
                    D: {(entry.distress_score).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
