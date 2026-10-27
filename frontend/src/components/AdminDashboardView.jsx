import React, { useState, useEffect } from 'react';
import { BarChart3, CalendarCheck, ShieldAlert, Download, RefreshCw, CheckCircle2, AlertCircle, UserPlus, Trash2, HeartHandshake, MapPin, Clock, Mail, Briefcase } from 'lucide-react';

export default function AdminDashboardView({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Form states for Add Counsellor
  const [showAddForm, setShowAddForm] = useState(false);
  const [cName, setCName] = useState('');
  const [cDesignation, setCDesignation] = useState('Campus Counsellor');
  const [cSpecialization, setCSpecialization] = useState('Academic Stress & Anxiety');
  const [cRoom, setCRoom] = useState('Room 204, Student Health Center');
  const [cSlots, setCSlots] = useState('Mon-Fri, 9:00 AM – 5:00 PM');
  const [cEmail, setCEmail] = useState('');
  const [counsellorMsg, setCounsellorMsg] = useState({ type: '', text: '' });
  const [submittingCounsellor, setSubmittingCounsellor] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptRes, crisisRes, summaryRes, counsRes] = await Promise.all([
        fetch('/api/counsellor/appointments?role=admin'),
        fetch('/api/counsellor/crisis-alerts'),
        fetch('/api/analytics/campus-summary'),
        fetch('/api/counsellors/all')
      ]);
      const apptData = await apptRes.json();
      const crisisData = await crisisRes.json();
      const summaryData = await summaryRes.json();
      const counsData = await counsRes.json();

      setAppointments(Array.isArray(apptData) ? apptData : []);
      setCrisisAlerts(Array.isArray(crisisData) ? crisisData : []);
      setSummary(summaryData);
      setCounsellors(Array.isArray(counsData) ? counsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const res = await fetch('/api/counsellors/all');
      const data = await res.json();
      setCounsellors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCounsellor = async (e) => {
    e.preventDefault();
    if (!cName.trim()) {
      setCounsellorMsg({ type: 'error', text: 'Please enter counsellor name.' });
      return;
    }
    setSubmittingCounsellor(true);
    setCounsellorMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/counsellors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cName.trim(),
          designation: cDesignation.trim() || 'Campus Counsellor',
          specialization: cSpecialization.trim() || 'General Wellness',
          room: cRoom.trim() || 'Health Center',
          available_slots: cSlots.trim() || 'Mon-Fri, 9:00 AM – 5:00 PM',
          email: cEmail.trim() || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCounsellorMsg({ type: 'success', text: `✅ ${data.message || 'Counsellor added successfully!'}` });
        setCName('');
        setCEmail('');
        setShowAddForm(false);
        fetchCounsellors();
      } else {
        setCounsellorMsg({ type: 'error', text: data.detail || 'Failed to add counsellor.' });
      }
    } catch (err) {
      setCounsellorMsg({ type: 'error', text: 'Network error adding counsellor.' });
    } finally {
      setSubmittingCounsellor(false);
    }
  };

  const handleRemoveCounsellor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}? They will no longer appear in student booking.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/counsellors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setCounsellorMsg({ type: 'success', text: `🗑️ ${data.message || 'Counsellor removed.'}` });
        fetchCounsellors();
      } else {
        setCounsellorMsg({ type: 'error', text: data.detail || 'Failed to remove counsellor.' });
      }
    } catch (err) {
      setCounsellorMsg({ type: 'error', text: 'Error removing counsellor.' });
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await fetch(`/api/counsellor/appointment/${apptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, counsellor_notes: 'Status updated by admin.' })
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const totalAppts = appointments.length;
  const pendingAppts = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const urgentAppts = appointments.filter(a => a.urgency === 'urgent').length;

  const sections = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'counsellors', label: `👩‍⚕️ Manage Counsellors (${counsellors.length})` },
    { id: 'appointments', label: `📅 All Appointments (${appointments.length})` },
    { id: 'crisis', label: `🚨 Crisis Alerts (${crisisAlerts.length})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Admin Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
          }}>🏛️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Admin Control Panel</h2>
              <span className="badge badge-level-2">ADMIN</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Welcome, {user?.full_name || user?.username} • Campus Mental Health &amp; Counsellor Administration
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> Refresh All
        </button>
      </div>

      {/* Global alert message */}
      {counsellorMsg.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: counsellorMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${counsellorMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          color: counsellorMsg.type === 'success' ? '#34d399' : '#fca5a5',
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{counsellorMsg.text}</span>
          <button onClick={() => setCounsellorMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
      )}

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button key={s.id} type="button" onClick={() => setActiveSection(s.id)} style={{
            padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem',
            cursor: 'pointer', border: 'none', transition: 'all 0.2s ease',
            background: activeSection === s.id ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.07)',
            color: activeSection === s.id ? '#fff' : 'var(--text-muted)',
            boxShadow: activeSection === s.id ? '0 4px 14px rgba(245,158,11,0.3)' : 'none'
          }}>{s.label}</button>
        ))}
      </div>

      {loading && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading admin data...
        </div>
      )}

      {/* ── SECTION: COUNSELLOR MANAGEMENT ── */}
      {!loading && activeSection === 'counsellors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Action Header */}
          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Campus Counsellors Directory</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Add or remove counsellors. Active counsellors immediately show up in the student "Book Counsellor" section.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <UserPlus size={16} /> {showAddForm ? 'Close Add Form' : 'Add Counsellor'}
            </button>
          </div>

          {/* Add Counsellor Form Modal/Collapse */}
          {showAddForm && (
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'rgba(16, 185, 129, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <UserPlus size={20} color="#10b981" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Add New Campus Counsellor</h4>
              </div>

              <form onSubmit={handleAddCounsellor}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Counsellor Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. M. Sangeetha"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Campus Psychologist"
                      value={cDesignation}
                      onChange={(e) => setCDesignation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Specialization / Domain
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Placement Stress, Anxiety & Career Direction"
                      value={cSpecialization}
                      onChange={(e) => setCSpecialization(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Room / Location
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Room 205, Student Wellness Center"
                      value={cRoom}
                      onChange={(e) => setCRoom(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Available Slots / Days
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mon, Wed, Fri, 10:00 AM – 4:00 PM"
                      value={cSlots}
                      onChange={(e) => setCSlots(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Contact Email (Optional)
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. sangeetha@campus.edu"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingCounsellor} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    {submittingCounsellor ? 'Adding...' : '✓ Save & Add to Student Portal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Counsellors List Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {counsellors.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
                No counsellors registered yet. Click "Add Counsellor" above to create one.
              </div>
            ) : counsellors.map((c) => (
              <div key={c.id} className="glass-panel" style={{
                padding: '20px',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
                      }}>👩‍⚕️</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{c.designation}</div>
                      </div>
                    </div>
                    <span className="badge badge-level-0">Active</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="#a5b4fc" />
                      <span>{c.specialization}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#34d399" />
                      <span>{c.room}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#f59e0b" />
                      <span>{c.available_slots}</span>
                    </div>
                    {c.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#38bdf8" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.74rem', color: '#10b981' }}>
                    ● Shown in Student Booking
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCounsellor(c.id, c.name)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#f87171',
                      borderColor: 'rgba(244,63,94,0.3)'
                    }}
                    title="Remove this counsellor"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      {!loading && activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Active Counsellors', value: counsellors.length, color: '#10b981', icon: '👩‍⚕️' },
              { label: 'Total Bookings', value: totalAppts, color: '#6366f1', icon: '📅' },
              { label: 'Pending Review', value: pendingAppts, color: '#f59e0b', icon: '⏳' },
              { label: 'Completed', value: completedAppts, color: '#10b981', icon: '✅' },
              { label: 'Urgent Cases', value: urgentAppts, color: '#f43f5e', icon: '🚨' },
              { label: 'Crisis Alerts', value: crisisAlerts.length, color: '#f43f5e', icon: '⚠️' },
            ].map((card) => (
              <div key={card.label} className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{card.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {summary?.support_level_distribution && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Support Level Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(summary.support_level_distribution).map(([level, pct]) => {
                  const clr = level.includes('0') ? '#10b981' : level.includes('1') ? '#06b6d4' : level.includes('2') ? '#f59e0b' : '#f43f5e';
                  return (
                    <div key={level}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{level}</span>
                        <span style={{ fontWeight: 700, color: clr }}>{pct}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: clr, borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Export Campus Wellness Report (CSV)</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Download anonymized campus-wide stressor &amp; support metrics</div>
            </div>
            <button className="btn btn-secondary" onClick={() => window.open('/api/analytics/export', '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* APPOINTMENTS */}
      {!loading && activeSection === 'appointments' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All Campus Appointments ({appointments.length})</h3>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
              <span style={{ color: '#10b981' }}>● Completed ({completedAppts})</span>
              <span style={{ color: '#f59e0b' }}>● Pending ({pendingAppts})</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '560px', overflowY: 'auto' }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }}>No appointments yet.</div>
            ) : appointments.map((appt) => (
              <div key={appt.id} style={{
                padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${appt.urgency === 'urgent' ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.08)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{appt.topic}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Student: <strong style={{ color: '#38bdf8' }}>{appt.student_alias}</strong> • {appt.department} • Counsellor: <strong>{appt.counsellor_name}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {appt.urgency === 'urgent' && <span className="badge badge-level-3">URGENT</span>}
                    <span className={`badge ${appt.status === 'completed' ? 'badge-level-0' : appt.status === 'verified' ? 'badge-level-1' : 'badge-level-2'}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  <span>📅 {appt.slot_date}</span>
                  <span>⏰ {appt.slot_time}</span>
                  <span>📍 {appt.mode}</span>
                </div>
                {appt.status !== 'completed' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline-emerald" style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      onClick={() => handleUpdateStatus(appt.id, 'completed')}>✓ Mark Complete</button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      onClick={() => handleUpdateStatus(appt.id, 'verified')}>✔ Verify Slot</button>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crisis Escalation Log ({crisisAlerts.length})</h3>
          </div>
          {crisisAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#10b981', padding: '40px 0' }}>
              <CheckCircle2 size={36} style={{ marginBottom: '8px', opacity: 0.7 }} />
              <div>No crisis alerts. Campus is stable ✅</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
              {crisisAlerts.map((al) => (
                <div key={al.id} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fca5a5', marginBottom: '4px' }}>
                    Trigger: "{al.trigger_message}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Session: {al.session_id} • {al.created_at} • Distress: {al.distress_score}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#fb923c', marginTop: '4px' }}>
                    Action: {al.action_taken}
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
