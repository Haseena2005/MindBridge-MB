import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  ClipboardCheck,
  Wind,
  UserCheck,
  BarChart3,
  AlertTriangle,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  CalendarCheck,
  ShieldAlert,
  LayoutDashboard
} from 'lucide-react';

import AuthModal from './components/AuthModal';
import EmergencyModal from './components/EmergencyModal';
import LoginView from './components/LoginView';
import ChatView from './components/ChatView';
import MoodTrackerView from './components/MoodTrackerView';
import ScreeningView from './components/ScreeningView';
import CopingExercisesView from './components/CopingExercisesView';
import CounsellorBookingView from './components/CounsellorBookingView';
import CampusAnalyticsView from './components/CampusAnalyticsView';
import CounsellorDashboardView from './components/CounsellorDashboardView';
import AdminDashboardView from './components/AdminDashboardView';

// --- Role-based tab definitions ---
const STUDENT_TABS = [
  { id: 'chat',       label: '24/7 AI Chat',       icon: MessageSquare },
  { id: 'mood',       label: 'Mood & Trends',       icon: Heart },
  { id: 'screenings', label: 'PHQ-9 & GAD-7',       icon: ClipboardCheck },
  { id: 'coping',     label: 'Coping Tools',        icon: Wind },
  { id: 'counsellor', label: 'Book Counsellor',     icon: UserCheck },
  { id: 'analytics',  label: 'Campus Insights',     icon: BarChart3 },
];

const COUNSELLOR_TABS = [
  { id: 'counsellor_dash', label: 'My Dashboard',       icon: LayoutDashboard },
  { id: 'chat',            label: '24/7 AI Chat',        icon: MessageSquare },
  { id: 'analytics',       label: 'Campus Insights',     icon: BarChart3 },
];

const ADMIN_TABS = [
  { id: 'admin_dash', label: 'Admin Panel',         icon: LayoutDashboard },
  { id: 'analytics',  label: 'Campus Insights',     icon: BarChart3 },
  { id: 'chat',       label: '24/7 AI Chat',        icon: MessageSquare },
];

function getTabsForRole(role) {
  if (role === 'admin')      return ADMIN_TABS;
  if (role === 'counsellor') return COUNSELLOR_TABS;
  return STUDENT_TABS;
}

function getDefaultTab(role) {
  if (role === 'admin')      return 'admin_dash';
  if (role === 'counsellor') return 'counsellor_dash';
  return 'chat';
}

export default function App() {
  const [user, setUser]                   = useState(null);
  const [activeTab, setActiveTab]         = useState('chat');
  const [isAuthOpen, setIsAuthOpen]       = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  useEffect(() => {
    // When opening the link, always show the login page first as requested
    localStorage.removeItem('mindbridge_token');
    localStorage.removeItem('mindbridge_user');
    setUser(null);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveTab(getDefaultTab(loggedInUser?.role));
  };

  const handleLogout = () => {
    localStorage.removeItem('mindbridge_token');
    localStorage.removeItem('mindbridge_user');
    setUser(null);
    setActiveTab('chat');
  };

  // Show login page when not logged in
  if (!user) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
          user={null}
        />
      </>
    );
  }

  const role = user?.role || 'student';
  const tabs = getTabsForRole(role);

  // Role accent colors for header badge
  const roleMeta = {
    admin:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: '🏛️ Admin' },
    counsellor: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.3)',  label: '👩‍⚕️ Counsellor' },
    student:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', label: '🎓 Student' },
  };
  const rm = roleMeta[role] || roleMeta.student;

  return (
    <div className="app-container">
      {/* ─── Header ─── */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.92)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 500
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>MindBridge</span>
                <span className="badge badge-level-1" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Campus Wellness Portal</div>
            </div>
          </div>

          {/* Nav Tabs — role-specific */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', padding: '2px 0' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          {/* SOS + User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              onClick={() => setIsEmergencyOpen(true)}
              title="Immediate Crisis Support"
            >
              <AlertTriangle size={14} />
              <span>SOS</span>
            </button>

            {/* User badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 12px', borderRadius: '10px',
              background: rm.bg, border: `1px solid ${rm.border}`, fontSize: '0.8rem'
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: rm.color }} />
              <span style={{ fontWeight: 700, color: '#fff' }}>{user.full_name || user.username}</span>
              <span style={{ fontSize: '0.68rem', color: rm.color, textTransform: 'uppercase' }}>
                {rm.label}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Log out"
            >
              <LogOut size={14} /> <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="main-content">

        {/* ── STUDENT TABS ── */}
        {activeTab === 'chat' && (
          <ChatView
            user={user}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}
        {activeTab === 'mood' && (
          <MoodTrackerView user={user} onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'screenings' && (
          <ScreeningView user={user} onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'coping' && <CopingExercisesView />}
        {activeTab === 'counsellor' && <CounsellorBookingView user={user} />}
        {activeTab === 'analytics' && <CampusAnalyticsView user={user} />}

        {/* ── COUNSELLOR TAB ── */}
        {activeTab === 'counsellor_dash' && <CounsellorDashboardView user={user} />}

        {/* ── ADMIN TAB ── */}
        {activeTab === 'admin_dash' && <AdminDashboardView user={user} />}

      </main>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(10, 15, 29, 0.95)',
        padding: '20px',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>MindBridge</span> • Student Mental Health &amp; Early Intervention Network
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span style={{ color: '#38bdf8' }}>SDG 3: Good Health</span>
            <span>•</span>
            <span style={{ color: '#34d399' }}>SDG 4: Quality Education</span>
            <span>•</span>
            <span style={{ color: '#f59e0b' }}>🆘 14416 (Tele-MANAS)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        user={user}
      />
    </div>
  );
}
