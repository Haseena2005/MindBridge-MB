import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, Sparkles, AlertTriangle, ArrowRight, HeartHandshake, Wind, Compass, RefreshCw } from 'lucide-react';

export default function ChatView({ user, onNavigate, onOpenEmergency }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stressor, setStressor] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 10));
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    { label: "Exam Anxiety", text: "Exams are next week and I can't focus, I feel anxious." },
    { label: "Hostel Noise & Sleep", text: "Can't sleep because of hostel noise, feeling stressed." },
    { label: "Placement Rejections", text: "Placement rejections keep piling up, I feel like a failure." },
    { label: "Everyday Tiredness", text: "A bit tired today, but I'm fine." },
    { label: "Crisis Safety Test", text: "I feel like there is no point in going on." }
  ];

  useEffect(() => {
    // Load historical or benchmark messages
    fetchHistory();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/history?session_id=${sessionId}&user_id=${user?.id || ''}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: `Hello ${user?.full_name || user?.username || 'there'} 👋. I am MindBridge, your private, 24/7 campus student wellness companion. How are you holding up with your classes, hostel, or exams today? You can share anything here freely.`,
            emotion: 'neutral',
            distress_score: 0.15,
            support_level: 0,
            stressor: 'general'
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const optimisticMsg = {
      id: 'opt_' + Date.now(),
      sender: 'user',
      text: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          stressor: stressor === 'auto' ? null : stressor,
          user_id: user?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to process message');

      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        emotion: data.emotion,
        stress_level: data.stress_level,
        distress_score: data.distress_score,
        support_level: data.support_level,
        stressor: data.stressor,
        is_crisis: data.is_crisis,
        recommended_tools: data.recommended_tools,
        helpline_info: data.helpline_info
      };

      setMessages(prev => [...prev, botMsg]);

      // If crisis level 3 triggered, pop emergency modal
      if (data.is_crisis) {
        onOpenEmergency();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: "I encountered a brief connection issue. Please feel free to retry or reach out to campus counseling directly.",
          emotion: 'neutral',
          support_level: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadgeClass = (lvl) => {
    if (lvl === 3) return 'badge-level-3';
    if (lvl === 2) return 'badge-level-2';
    if (lvl === 1) return 'badge-level-1';
    return 'badge-level-0';
  };

  const getLevelName = (lvl) => {
    if (lvl === 3) return 'Level 3: Crisis Safety Protocol';
    if (lvl === 2) return 'Level 2: Counsellor Referral';
    if (lvl === 1) return 'Level 1: Guided CBT Support';
    return 'Level 0: Self-Help & Validation';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)', minHeight: '620px' }}>
      {/* Top Banner: Transparency & PII Masking */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 18px', 
        background: 'rgba(255, 255, 255, 0.03)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Shield size={16} color="#06b6d4" />
          <span><strong>Autonomous Safety:</strong> PII is masked before NLP.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
            👤 Student: {user?.full_name || user?.username || 'Student'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            24/7 Companion
          </span>
        </div>
      </div>

      {/* Benchmark Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          Quick Prompts (Project Benchmarks):
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.76rem', padding: '5px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}
            onClick={() => handleSendMessage(p.text)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '18px' 
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div 
              key={m.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{ 
                  background: isUser 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                    : m.is_crisis 
                      ? 'rgba(244, 63, 94, 0.15)' 
                      : 'rgba(30, 41, 59, 0.95)',
                  border: isUser 
                    ? 'none' 
                    : m.is_crisis 
                      ? '1px solid rgba(244, 63, 94, 0.4)' 
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontSize: '0.94rem'
                }}
              >
                {m.text}
              </div>

              {/* Bot Meta & Action Ladders */}
              {!isUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className={`badge ${getLevelBadgeClass(m.support_level)}`}>
                    {getLevelName(m.support_level)}
                  </span>
                  {m.distress_score !== undefined && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Distress D(m): {(m.distress_score).toFixed(2)}
                    </span>
                  )}
                  {m.emotion && (
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'capitalize' }}>
                      • Emotion: {m.emotion}
                    </span>
                  )}
                  {m.stressor && m.stressor !== 'general' && (
                    <span style={{ fontSize: '0.72rem', color: '#a855f7', textTransform: 'capitalize' }}>
                      • Stressor: {m.stressor}
                    </span>
                  )}

                  {/* Interactive Shortcut buttons on replies */}
                  {m.support_level === 2 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', color: '#fbbf24' }}
                      onClick={() => onNavigate('counsellor')}
                    >
                      <HeartHandshake size={13} /> Book with Dr. Aarthi
                    </button>
                  )}
                  {m.support_level === 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', color: '#38bdf8' }}
                      onClick={() => onNavigate('coping')}
                    >
                      <Wind size={13} /> Open 4-4-4-4 Box Breathing
                    </button>
                  )}
                  {m.is_crisis && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px' }}
                      onClick={onOpenEmergency}
                    >
                      <AlertTriangle size={13} /> Emergency Hotlines (14416)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>MindBridge is analyzing emotion & distress score...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}
      >
        <select 
          className="form-input" 
          value={stressor} 
          onChange={(e) => setStressor(e.target.value)}
          style={{ width: '160px', padding: '12px 10px', fontSize: '0.82rem' }}
          title="Filter or specify stressor context"
        >
          <option value="auto">Auto-Detect Topic</option>
          <option value="exams">Exams & Tests</option>
          <option value="placements">Placements & Job</option>
          <option value="hostel">Hostel & Roommates</option>
          <option value="sleep">Sleep & Fatigue</option>
          <option value="relationships">Friends & Family</option>
          <option value="finances">Finances & Fees</option>
        </select>

        <input 
          type="text" 
          className="form-input" 
          placeholder="Share how you're feeling, what happened in class, or exam worries..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
        />

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || !input.trim()}
          style={{ padding: '12px 20px' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
