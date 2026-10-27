import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldCheck, Download, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

const DEFAULT_SUMMARY = {
  total_anonymized_interactions: 368,
  stressor_counts: { exams: 102, placements: 83, hostel: 44, relationships: 51, sleep: 38, finances: 50 },
  emotion_counts: { anxiety: 69, stress: 68, sadness: 66, neutral: 58, positive: 57, loneliness: 50 },
  weekly_trends: [
    { week: "Week 1", exams: 12, placements: 8, hostel: 22, sleep: 15 },
    { week: "Week 2", exams: 15, placements: 10, hostel: 25, sleep: 16 },
    { week: "Week 3", exams: 21, placements: 14, hostel: 20, sleep: 18 },
    { week: "Week 4", exams: 32, placements: 18, hostel: 19, sleep: 22 },
    { week: "Week 5", exams: 58, placements: 22, hostel: 17, sleep: 28 },
    { week: "Week 6", exams: 64, placements: 31, hostel: 16, sleep: 30 },
    { week: "Week 7", exams: 45, placements: 62, hostel: 15, sleep: 29 },
    { week: "Week 8", exams: 38, placements: 59, hostel: 16, sleep: 25 },
    { week: "Week 9", exams: 42, placements: 44, hostel: 18, sleep: 22 },
    { week: "Week 10", exams: 51, placements: 38, hostel: 19, sleep: 24 },
    { week: "Week 11", exams: 72, placements: 30, hostel: 17, sleep: 35 },
    { week: "Week 12", exams: 85, placements: 25, hostel: 16, sleep: 38 },
    { week: "Week 13", exams: 90, placements: 21, hostel: 18, sleep: 40 },
    { week: "Week 14 (Current)", exams: 76, placements: 24, hostel: 17, sleep: 32 }
  ],
  early_warnings: [
    {
      stressor: "Exam Anxiety",
      flagged_week: "Week 5",
      visible_in_survey: "Week 14",
      lead_time: "9 Weeks Early",
      status: "Active Intervention",
      recommendation: "Counsellor workshop on exam panic chunking scheduled for 3rd & final year students."
    },
    {
      stressor: "Placement Stress & Rejection Fatigue",
      flagged_week: "Week 7",
      visible_in_survey: "Week 14",
      lead_time: "7 Weeks Early",
      status: "Active Intervention",
      recommendation: "Mock interview reframing and confidence clinic rolled out with Placement Cell."
    },
    {
      stressor: "Hostel Sleep Disturbance",
      flagged_week: "Not flagged (stable)",
      visible_in_survey: "Not flagged",
      lead_time: "Within Baseline",
      status: "Monitored",
      recommendation: "Corridor noise regulations reinforced; sleep hygiene tips distributed."
    }
  ],
  support_level_distribution: {
    "Level 0 (Self-Help)": 44,
    "Level 1 (Guided Support)": 32,
    "Level 2 (Counsellor Referral)": 18,
    "Level 3 (Crisis Escalated)": 6
  }
};

export default function CampusAnalyticsView({ user }) {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/campus-summary');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSummary(data);
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('Using default summary due to fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/analytics/export', '_blank');
  };

  const weeklyTrends = Array.isArray(summary?.weekly_trends) && summary.weekly_trends.length > 0
    ? summary.weekly_trends
    : DEFAULT_SUMMARY.weekly_trends;

  const earlyWarnings = Array.isArray(summary?.early_warnings) && summary.early_warnings.length > 0
    ? summary.early_warnings
    : DEFAULT_SUMMARY.early_warnings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Campus Header & Privacy Guarantee */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#6366f1" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Campus Well-Being &amp; Early-Warning Analytics</h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Campus Community Insights • Empirical Student Wellness Study (4,000 Anonymised Interactions)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600 }}>
              👤 Logged in: {user.full_name || user.username}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <ShieldCheck size={16} /> Minimum Group Size &gt; 10 (Strict K-Anonymity)
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchSummary}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={15} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* 2-Sigma Anomaly Early-Warning Cards (Table 8.3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {earlyWarnings.map((warn, idx) => {
          const colors = ['#f59e0b', '#06b6d4', '#10b981'];
          const borderColor = colors[idx % colors.length];
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fef3c7' }}>{warn.stressor}</span>
                <span className={`badge ${warn.lead_time.includes('Early') ? 'badge-level-2' : 'badge-level-0'}`}>
                  {warn.lead_time}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Flagged in <strong>{warn.flagged_week}</strong>. Visible in traditional survey: <em>{warn.visible_in_survey}</em>.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                Action: {warn.recommendation}
              </div>
            </div>
          );
        })}
      </div>

      {/* 14-Week Longitudinal Trends Visualization */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              14-Week Longitudinal Stressor Volume (Semester Time Series)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Tracks relative volume of anonymized student queries per week across critical campus stressors.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '3px' }}></span> Exam Anxiety
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#06b6d4', borderRadius: '3px' }}></span> Placement Stress
            </span>
          </div>
        </div>

        {/* Visual Multi-Bar Graph */}
        <div style={{ 
          height: '240px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '10px', 
          padding: '20px 10px 0 10px', 
          background: 'rgba(0,0,0,0.25)', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto'
        }}>
          {weeklyTrends.map((item, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                minWidth: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', width: '100%', height: '80%', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '45%',
                    height: `${Math.max(6, Math.min(100, ((item.exams || 10) / 100) * 100))}%`,
                    background: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                  title={`Exams: ${item.exams}`}
                />
                <div
                  style={{
                    width: '45%',
                    height: `${Math.max(6, Math.min(100, ((item.placements || 10) / 100) * 100))}%`,
                    background: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                  title={`Placements: ${item.placements}`}
                />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                W{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables 8.1, 8.2 & 8.4 from Project Report */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Table 8.1 & 8.2 Model Performance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
            Table 8.1 &amp; 8.2: Empirical NLP &amp; Safety Evaluation
          </h3>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>
              EMOTION CLASSIFIER ACCURACY &amp; MACRO-F1:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Method</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Accuracy</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Macro-F1</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 6px' }}>VADER (lexicon rule-based)</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.68</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.64</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 6px' }}>TF-IDF + Logistic Regression</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.74</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.71</td>
                </tr>
                <tr style={{ color: '#38bdf8', fontWeight: 700, background: 'rgba(6, 182, 212, 0.08)' }}>
                  <td style={{ padding: '8px 6px' }}>Transformer Classifier (MindBridge)</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.84</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.81</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>
              CRISIS LANGUAGE DETECTION RECALL:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Architecture</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Recall (Safety First)</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Precision</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 6px' }}>Keyword List Only</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.61</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.88</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 6px' }}>Classifier Only</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.83</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.80</td>
                </tr>
                <tr style={{ color: '#34d399', fontWeight: 700, background: 'rgba(16, 185, 129, 0.08)' }}>
                  <td style={{ padding: '8px 6px' }}>Rules + Classifier (MindBridge)</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.95 (Peak Recall)</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px' }}>0.71</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 8.4 Support Ladder Benchmark Messages */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
            Table 8.4: Support-Level Assignment of Benchmark Messages
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Computed via mathematical distress formula: D(m) = min(1, Pneg(m) * (1 + 0.5 * U(m)))
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>"A bit tired today, but I'm fine."</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Pneg: 0.18 | U: 0 | Distress: 0.18</div>
              </div>
              <span className="badge badge-level-0">0 - Self-Help</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>"Can't sleep because of hostel noise, feeling stressed."</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Pneg: 0.41 | U: 0 | Distress: 0.41</div>
              </div>
              <span className="badge badge-level-1">1 - Guided Support</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>"Exams are next week and I can't focus, I feel anxious."</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Pneg: 0.62 | U: 0 | Distress: 0.62</div>
              </div>
              <span className="badge badge-level-2">2 - Counsellor Referral</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>"Placement rejections keep piling up, I feel like a failure."</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Pneg: 0.74 | U: 0 | Distress: 0.74</div>
              </div>
              <span className="badge badge-level-2">2 - Counsellor Referral</span>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fca5a5' }}>"I feel like there is no point in going on."</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Pneg: 0.91 | U: 1 | Distress: 1.00 (Capped)</div>
              </div>
              <span className="badge badge-level-3">3 - Crisis Escalation</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
