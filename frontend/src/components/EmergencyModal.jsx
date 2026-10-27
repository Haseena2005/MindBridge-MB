import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, Heart, CheckCircle2 } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose, user }) {
  const [alertSent, setAlertSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const triggerUrgentAlert = async () => {
    setLoading(true);
    try {
      await fetch('/api/counsellor/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id || null,
          student_alias: user?.full_name ? `${user.full_name} (${user.department || 'Student'})` : 'Anonymous Student in Crisis',
          topic: 'URGENT: Immediate Crisis Escalation',
          slot_date: new Date().toISOString().split('T')[0],
          slot_time: 'IMMEDIATE / ASAP',
          mode: 'In-Person (Room 204 Health Center) or Priority Call',
          urgency: 'crisis',
          share_summary_consented: true,
          notes: 'Triggered through Emergency SOS Red Alert. High distress reported.'
        })
      });
      setAlertSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          border: '2px solid rgba(244, 63, 94, 0.5)', 
          boxShadow: '0 0 50px rgba(244, 63, 94, 0.3)',
          padding: '28px' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'rgba(244, 63, 94, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(244, 63, 94, 0.4)'
            }}>
              <AlertTriangle size={24} color="#f43f5e" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                Crisis Support & Helplines
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                Available 24 hours a day, 7 days a week. Completely free & confidential.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          padding: '14px', 
          borderRadius: '10px', 
          background: 'rgba(244, 63, 94, 0.1)', 
          border: '1px solid rgba(244, 63, 94, 0.25)', 
          marginBottom: '20px',
          fontSize: '0.9rem',
          color: '#ffe4e6'
        }}>
          <strong>💙 You matter, and you are not alone.</strong> If you or someone you know is in immediate danger or experiencing thoughts of self-harm, please connect with a compassionate professional right away.
        </div>

        {/* Helplines List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tele-MANAS (Govt. of India)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>National Mental Health 24/7 Toll-Free</div>
            </div>
            <a href="tel:14416" className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <PhoneCall size={15} /> Dial 14416
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>KIRAN Helpline</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Govt. 24/7 Multi-language Support</div>
            </div>
            <a href="tel:18005990019" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <PhoneCall size={15} /> 1800-599-0019
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Sneha India (Chennai)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Suicide Prevention & Emotional Support</div>
            </div>
            <a href="tel:04424640050" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <PhoneCall size={15} /> 044-24640050
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#c7d2fe' }}>Campus Health & Counselling</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Campus Health & Counselling Center, Room 204</div>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8' }}>Ext #4004</span>
          </div>
        </div>

        {/* Priority Campus Alert Action */}
        <div style={{ 
          padding: '16px', 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.06)' 
        }}>
          {alertSent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399' }}>
              <CheckCircle2 size={24} />
              <div>
                <div style={{ fontWeight: 700 }}>Priority Counsellor Alert Logged</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Dr. S. Aarthi and student wellness team have been alerted for priority follow-up.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Need immediate campus intervention?</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Notifies campus counsellor on-duty for prioritized callback.
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={triggerUrgentAlert}
                disabled={loading}
                style={{ fontSize: '0.85rem' }}
              >
                {loading ? 'Sending Alert...' : '🚨 Request Urgent Callback'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
