import React, { useState, useEffect } from 'react';
import { HeartHandshake, CalendarCheck, AlertCircle, CheckCircle2, RefreshCw, Clock } from 'lucide-react';

export default function CounsellorDashboardView({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('appointments');
  const [filterStatus, setFilterStatus] = useState('all');
  const [counsellorNote, setCounsellorNote] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptRes, crisisRes] = await Promise.all([
        fetch('/api/counsellor/appointments?role=counsellor'),
        fetch('/api/counsellor/crisis-alerts')
      ]);
      const apptData = await apptRes.json();
      const crisisData = await crisisRes.json();
      setAppointments(Array.isArray(apptData) ? apptData : []);
      setCrisisAlerts(Array.isArray(crisisData) ? crisisData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      const note = counsellorNote[apptId] || '';
      await fetch(`/api/counsellor/appointment/${apptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          counsellor_notes: note || `Marked as ${newStatus} by counsellor.`
        })
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppts = filterStatus === 'all'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const totalAppts = appointments.length;
  const pendingAppts = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const urgentAppts = appointments.filter(a => a.urgency === 'urgent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Counsellor Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
          }}>👩‍⚕️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Counsellor Dashboard</h2>
              <span className="badge badge-level-1">COUNSELLOR</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Welcome, {user?.full_name || user?.username} • Campus Wellness Team
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Bookings', value: totalAppts, color: '#6366f1', icon: '📅' },
          { label: 'Awaiting Review', value: pendingAppts, color: '#f59e0b', icon: '⏳' },
          { label: 'Completed', value: completedAppts, color: '#10b981', icon: '✅' },
          { label: 'Urgent', value: urgentAppts, color: '#f43f5e', icon: '🚨' },
          { label: 'Crisis Alerts', value: crisisAlerts.length, color: '#f43f5e', icon: '⚠️' },
        ].map((card) => (
          <div key={card.label} className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{card.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Section Nav */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'appointments', label: '📅 Student Appointments' },
          { id: 'crisis', label: '🚨 Crisis Alerts' }
        ].map(s => (
          <button key={s.id} type="button" onClick={() => setActiveSection(s.id)} style={{
            padding: '9px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem',
            cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
            background: activeSection === s.id ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.07)',
            color: activeSection === s.id ? '#fff' : 'var(--text-muted)',
            boxShadow: activeSection === s.id ? '0 4px 14px rgba(99,102,241,0.3)' : 'none'
          }}>{s.label}</button>
        ))}
      </div>

      {loading && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading appointments...
        </div>
      )}

      {/* APPOINTMENTS */}
      {!loading && activeSection === 'appointments' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Filter Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartHandshake size={20} color="#6366f1" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Consultation Bookings</h3>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'confirmed', 'verified', 'completed'].map(f => (
                <button key={f} type="button" onClick={() => setFilterStatus(f)} style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: filterStatus === f ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                  color: filterStatus === f ? '#c7d2fe' : 'var(--text-muted)',
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '600px', overflowY: 'auto' }}>
            {filteredAppts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0', fontSize: '0.9rem' }}>
                No {filterStatus === 'all' ? '' : filterStatus} appointments found.
              </div>
            ) : filteredAppts.map((appt) => (
              <div key={appt.id} style={{
                padding: '18px', borderRadius: '14px',
                background: appt.urgency === 'urgent' ? 'rgba(244,63,94,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${appt.urgency === 'urgent' ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'}`
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{appt.topic}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Student: <strong style={{ color: '#38bdf8' }}>{appt.student_alias}</strong>
                      {appt.department && <> · Dept: {appt.department}</>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {appt.urgency === 'urgent' && <span className="badge badge-level-3">URGENT</span>}
                    <span className={`badge ${appt.status === 'completed' ? 'badge-level-0' : appt.status === 'verified' ? 'badge-level-1' : 'badge-level-2'}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', gap: '18px', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span>📅 {appt.slot_date}</span>
                  <span>⏰ {appt.slot_time}</span>
                  <span>📍 {appt.mode}</span>
                  <span>🕐 Booked: {appt.created_at}</span>
                </div>

                {appt.notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <strong>Student's note:</strong> {appt.notes}
                  </div>
                )}

                {appt.counsellor_notes && (
                  <div style={{ fontSize: '0.8rem', color: '#6ee7b7', background: 'rgba(16,185,129,0.07)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                    <strong>Counsellor note:</strong> {appt.counsellor_notes}
                  </div>
                )}

                {/* Action buttons — show only if not completed */}
                {appt.status !== 'completed' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '7px 10px' }}
                      placeholder="Optional: add a counsellor note..."
                      value={counsellorNote[appt.id] || ''}
                      onChange={(e) => setCounsellorNote(prev => ({ ...prev, [appt.id]: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn btn-outline-emerald" style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                        onClick={() => handleUpdateStatus(appt.id, 'completed')}>
                        ✓ Mark Completed
                      </button>
                      {appt.status === 'confirmed' && (
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                          onClick={() => handleUpdateStatus(appt.id, 'verified')}>
                          ✔ Confirm Slot
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRISIS ALERTS */}
      {!loading && activeSection === 'crisis' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', marginBottom: '16px' }}>
            <AlertCircle size={22} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crisis Escalation Inbox ({crisisAlerts.length})</h3>
          </div>
          {crisisAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#10b981', padding: '40px 0' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '8px', opacity: 0.7 }} />
              <div>No active crisis alerts. Students are well 🌱</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
              {crisisAlerts.map((al) => (
                <div key={al.id} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fca5a5', marginBottom: '4px' }}>
                    "{al.trigger_message}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Session: {al.session_id} • {al.created_at} • Distress score: {al.distress_score}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#fb923c', marginTop: '4px' }}>
                    ⚡ {al.action_taken}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
