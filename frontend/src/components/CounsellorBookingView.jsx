import React, { useState, useEffect } from 'react';
import { HeartHandshake, Calendar, Clock, UserCheck, ShieldCheck, CheckCircle2, AlertCircle, FileText, Lock, MapPin, Briefcase, Mail } from 'lucide-react';

const FALLBACK_COUNSELLORS = [
  {
    id: 1,
    name: "Dr. S. Aarthi",
    designation: "Lead Campus Counsellor",
    specialization: "Academic Stress, Anxiety & Depression",
    room: "Room 204, Health Center",
    available_slots: "Mon-Fri, 9:00 AM – 5:00 PM",
    email: "aarthi@campus.edu",
    is_active: true
  },
  {
    id: 2,
    name: "Dr. R. Priya",
    designation: "Student Wellness Counsellor",
    specialization: "Relationship Issues, Loneliness & Hostel Adjustment",
    room: "Room 206, Health Center",
    available_slots: "Mon, Wed, Fri, 10:00 AM – 3:00 PM",
    email: "priya@campus.edu",
    is_active: true
  },
  {
    id: 3,
    name: "Mr. K. Rajan",
    designation: "Career & Placement Counsellor",
    specialization: "Placement Stress, Career Anxiety & Goal Setting",
    room: "Room 110, Placement Block",
    available_slots: "Tue, Thu, 11:00 AM – 4:00 PM",
    email: "rajan@campus.edu",
    is_active: true
  }
];

export default function CounsellorBookingView({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [counsellors, setCounsellors] = useState(FALLBACK_COUNSELLORS);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(1);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState('');

  // Form states
  const [slotDate, setSlotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slotTime, setSlotTime] = useState('10:30 AM - 11:00 AM');
  const [mode, setMode] = useState('In-Person (Health Center)');
  const [topic, setTopic] = useState('Exam Anxiety & Stress Relief');
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [shareSummary, setShareSummary] = useState(true);
  const [urgency, setUrgency] = useState('routine');

  const isStaff = user?.role === 'counsellor' || user?.role === 'admin';

  useEffect(() => {
    fetchCounsellors();
    fetchAppointments();
    if (isStaff) {
      fetchCrisisAlerts();
    }
  }, [user, isStaff]);

  const fetchCounsellors = async () => {
    try {
      const res = await fetch('/api/counsellors');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCounsellors(data);
          setSelectedCounsellorId(data[0].id);
        } else if (Array.isArray(data) && data.length === 0) {
          setCounsellors([]);
          setSelectedCounsellorId(null);
        }
      }
    } catch (err) {
      console.warn('Using fallback counsellors:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/counsellor/appointments?user_id=${user?.id || ''}&role=${user?.role || 'student'}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCrisisAlerts = async () => {
    try {
      const res = await fetch('/api/counsellor/crisis-alerts');
      const data = await res.json();
      setCrisisAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCounsellor = counsellors.find(c => c.id === Number(selectedCounsellorId)) || counsellors[0] || null;

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedCounsellor) {
      alert("No counsellor available to book. Please check back later.");
      return;
    }
    setLoading(true);
    setBookSuccess('');

    try {
      const aliasName = isAnonymous
        ? `Anonymous Student #${Math.floor(100 + Math.random() * 900)}`
        : user?.full_name ? `${user.full_name} (${user.department || 'Student'})` : 'Student';

      const res = await fetch('/api/counsellor/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: isAnonymous ? null : (user?.id || null),
          student_alias: aliasName,
          counsellor_name: `${selectedCounsellor.name} (${selectedCounsellor.designation})`,
          department: user?.department || 'Engineering',
          slot_date: slotDate,
          slot_time: slotTime,
          mode: mode,
          topic: topic,
          notes: notes,
          share_summary_consented: shareSummary,
          urgency: urgency
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBookSuccess(`Appointment confirmed with ${selectedCounsellor.name} on ${slotDate} at ${slotTime}!`);
        setNotes('');
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await fetch(`/api/counsellor/appointment/${apptId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, counsellor_notes: "Reviewed and verified by counsellor." })
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Counsellors Roster Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.6rem' 
            }}>
              👩‍⚕️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Campus Wellness &amp; Counselling Team</h2>
                <span className="badge badge-level-0">{counsellors.length} Counsellors Available</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Professional, confidential &amp; stigma-free mental health support for students
              </p>
            </div>
          </div>

          {isStaff && (
            <span className="badge badge-level-2" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Staff Access: {user.role.toUpperCase()} MODE
            </span>
          )}
        </div>

        {/* Available Counsellors Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {counsellors.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCounsellorId(c.id)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: selectedCounsellorId === c.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${selectedCounsellorId === c.id ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f8fafc' }}>{c.name}</div>
                {selectedCounsellorId === c.id && (
                  <span className="badge badge-level-1" style={{ fontSize: '0.72rem' }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>{c.designation}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Briefcase size={13} color="#a5b4fc" /> {c.specialization}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} color="#34d399" /> {c.room}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff View: Crisis Escalation Alerts */}
      {isStaff && crisisAlerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', marginBottom: '12px' }}>
            <AlertCircle size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Priority Crisis Escalation Inbox</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {crisisAlerts.map((al) => (
              <div key={al.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fca5a5' }}>
                    Trigger Message: "{al.trigger_message}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Session: {al.session_id} • Time: {al.created_at} • Status: {al.status}
                  </div>
                </div>
                <span className="badge badge-level-3">Distress 1.0</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Booking Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: isStaff ? '1fr' : 'minmax(320px, 1.15fr) minmax(320px, 1fr)', gap: '24px' }}>
        
        {/* Left Column: Booking Form */}
        {!isStaff && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Book a Session</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                👤 Student: {user?.full_name || user?.username || 'Student'}
              </span>
            </div>

            {bookSuccess && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.86rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> {bookSuccess}
              </div>
            )}

            <form onSubmit={handleBookAppointment}>
              {/* Counsellor Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Choose Counsellor *
                </label>
                {counsellors.length === 0 ? (
                  <div style={{ color: '#f87171', fontSize: '0.85rem' }}>No counsellors are currently listed. Please contact campus admin.</div>
                ) : (
                  <select
                    className="form-input"
                    value={selectedCounsellorId || ''}
                    onChange={(e) => setSelectedCounsellorId(Number(e.target.value))}
                    required
                  >
                    {counsellors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.designation} ({c.room})
                      </option>
                    ))}
                  </select>
                )}
                {selectedCounsellor && (
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#38bdf8', background: 'rgba(56,189,248,0.06)', padding: '6px 10px', borderRadius: '6px' }}>
                    Specialization: {selectedCounsellor.specialization} • Hours: {selectedCounsellor.available_slots}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Time Slot
                  </label>
                  <select
                    className="form-input"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                  >
                    <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                    <option value="01:30 PM - 02:00 PM">01:30 PM - 02:00 PM</option>
                    <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Consultation Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setMode(`In-Person (${selectedCounsellor?.room || 'Health Center'})`)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: mode.includes('In-Person') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: mode.includes('In-Person') ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: mode.includes('In-Person') ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    🏢 In-Person ({selectedCounsellor?.room?.split(',')[0] || 'Room 204'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('Confidential Online Video Call')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: mode.includes('Online') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: mode.includes('Online') ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: mode.includes('Online') ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    🔒 Confidential Video/Audio
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Primary Concern / Topic
                </label>
                <select
                  className="form-input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="Exam Anxiety & Stress Relief">Exam Anxiety &amp; Focus</option>
                  <option value="Placement Fatigue & Rejection">Placement Fatigue &amp; Rejections</option>
                  <option value="Hostel Adjustment & Sleep Disturbance">Hostel Adjustment &amp; Sleep Issues</option>
                  <option value="Burnout & Low Energy">Academic Burnout &amp; Fatigue</option>
                  <option value="Personal Well-Being & Peer Relations">Relationships &amp; Personal Well-Being</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Optional Note for Counsellor
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Share anything you want the counsellor to know in advance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Privacy Toggles */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span><strong>Book Anonymously</strong> (Show alias instead of my student name)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareSummary}
                    onChange={(e) => setShareSummary(e.target.checked)}
                  />
                  <span><strong>Consent to Share</strong> anonymized distress score summary with counsellor</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading || counsellors.length === 0}
              >
                {loading ? 'Submitting Request...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Appointments List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <UserCheck size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {isStaff ? 'All Scheduled Campus Consultations' : 'My Upcoming Appointments'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '540px', overflowY: 'auto' }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0', fontSize: '0.9rem' }}>
                No appointments booked yet. Fill the form to schedule one!
              </div>
            ) : (
              appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {appt.topic}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        With: <strong>{appt.counsellor_name}</strong>
                      </div>
                    </div>
                    <span className={`badge ${appt.status === 'completed' ? 'badge-level-0' : appt.status === 'verified' ? 'badge-level-1' : 'badge-level-2'}`}>
                      {appt.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <span>📅 {appt.slot_date}</span>
                    <span>⏰ {appt.slot_time}</span>
                    <span>📍 {appt.mode}</span>
                  </div>

                  {appt.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                      <strong>Student Note:</strong> {appt.notes}
                    </div>
                  )}

                  {isStaff && appt.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-outline-emerald"
                        style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                        onClick={() => handleUpdateStatus(appt.id, 'verified')}
                      >
                        ✔ Accept / Verify Slot
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                        onClick={() => handleUpdateStatus(appt.id, 'completed')}
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
