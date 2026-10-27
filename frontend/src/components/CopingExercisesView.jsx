import React, { useState, useEffect } from 'react';
import { Wind, Compass, Sparkles, Clock, Moon, CheckSquare, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function CopingExercisesView() {
  const [activeTab, setActiveTab] = useState('breathing'); // 'breathing', 'grounding', 'reframing', 'study', 'sleep'

  // --- Box Breathing State ---
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale, hold-empty
  const [timerCount, setTimerCount] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setTimerCount((prev) => {
          if (prev <= 1) {
            // Change phase
            setBreathPhase((curPhase) => {
              if (curPhase === 'inhale') return 'hold';
              if (curPhase === 'hold') return 'exhale';
              if (curPhase === 'exhale') return 'hold-empty';
              if (curPhase === 'hold-empty') {
                setCycleCount((c) => c + 1);
                return 'inhale';
              }
              return 'inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('inhale');
    setTimerCount(4);
    setCycleCount(0);
  };

  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Inhale slowly through your nose';
      case 'hold': return 'Hold your breath gently';
      case 'exhale': return 'Exhale smoothly through mouth';
      case 'hold-empty': return 'Rest before the next breath';
      default: return '';
    }
  };

  // --- 5-4-3-2-1 Grounding State ---
  const [groundingStep, setGroundingStep] = useState(5);
  const [groundingInputs, setGroundingInputs] = useState({ 5: '', 4: '', 3: '', 2: '', 1: '' });

  // --- Thought Reframer State ---
  const [negThought, setNegThought] = useState('');
  const [distortion, setDistortion] = useState('catastrophizing');
  const [reframedThought, setReframedThought] = useState('');

  const handleReframe = () => {
    if (!negThought.trim()) return;
    const reframes = {
      catastrophizing: `Even though my mind is anticipating the absolute worst outcome, I have prepared for challenges before and can handle step-by-step solutions instead of an imaginary disaster.`,
      all_or_nothing: `Success is not all-or-nothing. Getting a lower score or facing an interview setback doesn't mean I am incapable; it's a valuable learning iteration.`,
      mind_reading: `I am assuming others are judging me negatively, but in reality, people are focused on their own responsibilities. I don't need external perfection to be worthy.`,
      emotional_reasoning: `Just because I feel anxious right now does not mean I am in real danger. Anxiety is just adrenaline, not a prophecy of failure.`
    };
    setReframedThought(reframes[distortion] || `I can accept this feeling without letting it define my entire future.`);
  };

  // --- Sleep Hygiene Checklist ---
  const [sleepChecks, setSleepChecks] = useState([
    { id: 1, text: "Switched phone to 'Do Not Disturb' mode 30 mins before sleep", checked: false },
    { id: 2, text: "Jotted down tomorrow's 3 priority tasks on paper", checked: false },
    { id: 3, text: "Dimmed room lights or used eye mask against corridor light", checked: false },
    { id: 4, text: "Drank half a glass of room-temperature water", checked: false },
    { id: 5, text: "Did 3 slow exhalations to trigger vagus nerve relaxation", checked: false }
  ]);

  const toggleSleepCheck = (id) => {
    setSleepChecks(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Exercise Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={16} /> 4-4-4-4 Box Breathing
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'grounding' ? 'active' : ''}`}
          onClick={() => setActiveTab('grounding')}
        >
          <Compass size={16} /> 5-4-3-2-1 Sensory Grounding
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'reframing' ? 'active' : ''}`}
          onClick={() => setActiveTab('reframing')}
        >
          <Sparkles size={16} /> Cognitive Thought Reframing
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <Moon size={16} /> Campus Bedtime Protocol
        </button>
      </div>

      {/* 1. BOX BREATHING */}
      {activeTab === 'breathing' && (
        <div className="glass-panel" style={{ padding: '36px 24px', textAlign: 'center', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            4-4-4-4 Box Breathing Exercise
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Regulates the autonomic nervous system and halts acute exam panic in under 2 minutes.
          </p>

          <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={`breath-circle ${isBreathingActive ? breathPhase : ''}`}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: '#06b6d4', letterSpacing: '0.05em' }}>
                {isBreathingActive ? breathPhase.replace('-', ' ') : 'Ready'}
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
                {isBreathingActive ? timerCount : '4'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 16px', lineHeight: '1.2' }}>
                {isBreathingActive ? getPhaseInstruction() : 'Click start to begin'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
              onClick={() => setIsBreathingActive(!isBreathingActive)}
            >
              {isBreathingActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start Breathing</>}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetBreathing}
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div style={{ marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Completed Cycles: <strong style={{ color: '#38bdf8' }}>{cycleCount}</strong> / 4 recommended
          </div>
        </div>
      )}

      {/* 2. 5-4-3-2-1 GROUNDING */}
      {activeTab === 'grounding' && (
        <div className="glass-panel" style={{ padding: '32px 24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            5-4-3-2-1 Sensory Grounding Technique
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Anchors racing thoughts back to immediate physical reality. Step through each of your five senses.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[5, 4, 3, 2, 1].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '4px',
                  background: step >= groundingStep ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          <div style={{ 
            padding: '24px', 
            borderRadius: '14px', 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}>
            {groundingStep === 5 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4', marginBottom: '8px' }}>
                  👀 5 Things You Can See
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Look around you right now. Spot 5 distinct objects (e.g. your blue pen, a laptop hinge, window shadow, notebook cover, ceiling fan).
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type 5 things you see..."
                  value={groundingInputs[5]}
                  onChange={(e) => setGroundingInputs({ ...groundingInputs, 5: e.target.value })}
                />
              </div>
            )}

            {groundingStep === 4 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
                  ✋ 4 Things You Can Physically Feel
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Feel the texture of your shirt, the firmness of your chair beneath you, the cool surface of your desk, or feet flat on the floor.
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type 4 physical sensations..."
                  value={groundingInputs[4]}
                  onChange={(e) => setGroundingInputs({ ...groundingInputs, 4: e.target.value })}
                />
              </div>
            )}

            {groundingStep === 3 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                  👂 3 Things You Can Hear
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Listen carefully. Is it the whirr of an AC, birds chirping outside the lab, footsteps in the hall, or your own breath?
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type 3 ambient sounds..."
                  value={groundingInputs[3]}
                  onChange={(e) => setGroundingInputs({ ...groundingInputs, 3: e.target.value })}
                />
              </div>
            )}

            {groundingStep === 2 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a855f7', marginBottom: '8px' }}>
                  👃 2 Things You Can Smell
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Notice scents in the air: coffee, fresh rain, notebook paper, soap, or clean air.
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type 2 scents you notice..."
                  value={groundingInputs[2]}
                  onChange={(e) => setGroundingInputs({ ...groundingInputs, 2: e.target.value })}
                />
              </div>
            )}

            {groundingStep === 1 && (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f43f5e', marginBottom: '8px' }}>
                  👅 1 Thing You Can Taste
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Take a small sip of water, notice the lingering taste of mint, tea, or simply swallow slowly and sense the present moment.
                </p>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type 1 taste or sensation..."
                  value={groundingInputs[1]}
                  onChange={(e) => setGroundingInputs({ ...groundingInputs, 1: e.target.value })}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {groundingStep < 5 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setGroundingStep((s) => s + 1)}
              >
                Previous Sense
              </button>
            ) : <div />}

            {groundingStep > 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setGroundingStep((s) => s - 1)}
              >
                Next Sense ({groundingStep - 1})
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-emerald"
                onClick={() => alert("🎉 Excellent grounding! Your nervous system is now anchored in the present moment.")}
              >
                <CheckCircle2 size={16} /> Complete Grounding
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. COGNITIVE REFRAMING */}
      {activeTab === 'reframing' && (
        <div className="glass-panel" style={{ padding: '32px 24px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Cognitive Thought Reframing (CBT Triad)
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Catch automatic catastrophizing thoughts, check the cognitive bias, and replace them with evidence-based reasoning.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              1. What is the harsh thought running in your mind?
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. If I don't clear this interview, my whole engineering career is finished."
              value={negThought}
              onChange={(e) => setNegThought(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              2. Identify Cognitive Distortion Pattern:
            </label>
            <select
              className="form-input"
              value={distortion}
              onChange={(e) => setDistortion(e.target.value)}
            >
              <option value="catastrophizing">Catastrophizing (Assuming the worst-case scenario will occur)</option>
              <option value="all_or_nothing">All-or-Nothing Thinking (I must be 100% perfect or I am a failure)</option>
              <option value="mind_reading">Mind Reading (Believing everyone thinks negatively of me)</option>
              <option value="emotional_reasoning">Emotional Reasoning (I feel like a fraud, so I must be one)</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleReframe}
            disabled={!negThought.trim()}
            style={{ width: '100%', marginBottom: '20px' }}
          >
            Generate Balanced CBT Reframe
          </button>

          {reframedThought && (
            <div style={{ 
              padding: '18px', 
              borderRadius: '12px', 
              background: 'rgba(16, 185, 129, 0.12)', 
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#d1fae5'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#34d399', marginBottom: '4px' }}>
                Balanced Perspective:
              </div>
              <div style={{ fontSize: '0.94rem', lineHeight: '1.6' }}>
                "{reframedThought}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BEDTIME SLEEP HYGIENE */}
      {activeTab === 'sleep' && (
        <div className="glass-panel" style={{ padding: '32px 24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Campus Bedtime Wind-Down Checklist
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Curated protocol for college and hostel students to achieve deep restorative sleep even with late-night noise.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sleepChecks.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleSleepCheck(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: item.checked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: item.checked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: item.checked ? 'none' : '2px solid var(--text-dim)',
                  background: item.checked ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {item.checked && '✓'}
                </div>
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: item.checked ? '#ffffff' : 'var(--text-muted)',
                  textDecoration: item.checked ? 'line-through' : 'none'
                }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
