import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  MessageSquare, 
  ClipboardCheck, 
  UserCheck, 
  AlertTriangle,
  PhoneCall,
  School,
  CheckCircle2,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginView({ onLoginSuccess, onOpenEmergency }) {
  const [tab, setTab] = useState('quick'); // 'quick', 'login', 'register'
  
  // Quick Student Sign In
  const [studentName, setStudentName] = useState('');
  const [studentDept, setStudentDept] = useState('Computer Science & Engineering');
  const [studentRoll, setStudentRoll] = useState('');

  // Standard Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regRoll, setRegRoll] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Quick Student Login by Name
  const handleQuickLogin = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your name to proceed.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/quick-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName.trim(),
          department: studentDept,
          roll_number: studentRoll.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Unable to sign in. Please try again.');
      }

      localStorage.setItem('mindbridge_token', data.token);
      localStorage.setItem('mindbridge_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Login
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid username or password.');
      }

      localStorage.setItem('mindbridge_token', data.token);
      localStorage.setItem('mindbridge_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regFullName) {
      setError('Please fill in your full name, username, and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim() || undefined,
          full_name: regFullName.trim(),
          password: regPassword,
          role: 'student',
          department: regDept,
          roll_number: regRoll.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed. Username may already exist.');
      }

      localStorage.setItem('mindbridge_token', data.token);
      localStorage.setItem('mindbridge_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest Login
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      localStorage.setItem('mindbridge_token', data.token);
      localStorage.setItem('mindbridge_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError('Unable to start guest session.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill credentials for testing
  const fillCredentials = (roleType) => {
    setTab('login');
    setError('');
    if (roleType === 'student') {
      setLoginUsername('student');
      setLoginPassword('mindbridge123');
    } else if (roleType === 'counsellor') {
      setLoginUsername('counsellor');
      setLoginPassword('mindbridge123');
    } else if (roleType === 'admin') {
      setLoginUsername('admin');
      setLoginPassword('admin123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(10, 15, 29, 0.98) 75%)',
      color: 'var(--text-main)'
    }}>
      {/* Top Navbar */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  MindBridge
                </span>
                <span className="badge badge-level-1" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  Student Portal
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Campus Student Mental Health & Early Intervention
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              onClick={onOpenEmergency}
              title="Immediate Crisis Support (Tele-MANAS 14416)"
            >
              <AlertTriangle size={15} />
              <span>🚨 SOS Help (24/7)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{
        flex: 1,
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Left Side: Welcoming Hero Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '30px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <ShieldCheck size={16} color="#818cf8" />
              Confidential, Stigma-Free Campus Mental Health
            </div>
            
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Student Wellness & Support Portal
            </h1>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              marginBottom: '8px'
            }}>
              Welcome! Sign in with your name to access 24/7 compassionate AI chat, daily mood tracking, clinical assessments, coping tools, and confidential counsellor appointments.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <MessageSquare size={18} color="#06b6d4" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>24/7 AI Empathy Chat</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                Instant, judgement-free support for exam stress, placements, and hostel life.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Heart size={18} color="#ec4899" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Mood & Trend Tracker</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                Log daily emotions and catch early-warning burnout signals before exams.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <ClipboardCheck size={18} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Clinical Screenings</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                Standard PHQ-9 & GAD-7 assessments with private, evidence-based results.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <UserCheck size={18} color="#8b5cf6" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Counsellor Booking</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                Book confidential in-person or online sessions with campus wellness mentors.
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Quick Fill Demo Accounts:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                onClick={() => fillCredentials('student')}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                onClick={() => fillCredentials('counsellor')}
              >
                👩‍⚕️ Counsellor
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                onClick={() => fillCredentials('admin')}
              >
                🏛️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login / Entry Card */}
        <div className="glass-panel" style={{
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative'
        }}>
          {/* Card Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setTab('quick'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'quick' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: tab === 'quick' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ⚡ Enter by Name
            </button>
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'login' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: tab === 'login' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'register' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                color: tab === 'register' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📝 Register
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* TAB 1: QUICK STUDENT ENTRY BY NAME */}
          {tab === 'quick' && (
            <form onSubmit={handleQuickLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Student Full Name <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
                    placeholder="Enter your name (e.g. Priya Sharma, Rahul...)"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Your name will be displayed in your personal dashboards and greetings.
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Department / Branch
                </label>
                <select
                  className="form-input"
                  value={studentDept}
                  onChange={(e) => setStudentDept(e.target.value)}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="Science & Humanities">Science & Humanities</option>
                </select>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Student Roll / ID Number <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2024-CSE-102"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
                }}
                disabled={loading}
              >
                {loading ? 'Setting up Dashboard...' : (
                  <>
                    <span>Enter Student Portal as {studentName.trim() || 'Student'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: STANDARD LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleStandardLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="student, counsellor, or admin"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '42px', paddingRight: '40px' }}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '0.98rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Sign In & Access Dashboard'}
              </button>
            </form>
          )}

          {/* TAB 3: NEW STUDENT REGISTRATION */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Your Full Name <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ananya Sen"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Username <span style={{ color: '#f43f5e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ananya_s"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2024-IT-088"
                    value={regRoll}
                    onChange={(e) => setRegRoll(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Department
                </label>
                <select
                  className="form-input"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email Address <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="student@campus.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Create Password <span style={{ color: '#f43f5e' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Choose secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '0.98rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Creating Student Profile...' : 'Register & Enter Dashboard'}
              </button>
            </form>
          )}

          {/* Anonymous Guest Option */}
          <div style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={handleGuestLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.84rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              🔒 Prefer 100% anonymous mode? Continue as Guest Student
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.95)',
        padding: '20px 24px',
        fontSize: '0.82rem',
        color: 'var(--text-dim)',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>MindBridge Student Support Platform</span> • 
            Campus Student Mental Health & Early Intervention Network
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#38bdf8' }}>SDG 3: Good Health & Well-Being</span>
            <span>•</span>
            <span style={{ color: '#34d399' }}>SDG 4: Quality Education</span>
            <span>•</span>
            <span style={{ color: '#f59e0b' }}>Emergency: 14416 (Tele-MANAS 24/7)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
