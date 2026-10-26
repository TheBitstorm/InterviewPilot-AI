// src/pages/DashboardPage.jsx
// Visual Enhancement: Infuses the Landing Page's pinkish-red accent (#EC4F5F) for key metric highlights,
// active indicators, refined hover states, and premium card depth while preserving 100% of the existing
// layout, API data integration, state, navigation, and auth handlers.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { interviewService } from '../services/interviewService';
import { reportService } from '../services/reportService';
import { resumeService } from '../services/resumeService';
import Logo from '../components/Logo';

// Styles scoped to Dashboard with warm cream, ink, and Landing Page pinkish-red (#EC4F5F) accents.
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap');

.dash {
  --bg: #F2EEE6;
  --card: #fff;
  --ink: #0A0A0A;
  --muted: #6B675F;
  --line: #E3DED2;
  --yellow: #F4CF63;
  --red: #EC4F5F;
  --red-soft: rgba(236, 79, 95, 0.10);
  --red-border: rgba(236, 79, 95, 0.28);
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px 1fr;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  box-sizing: border-box;
}
.dash *, .dash *::before, .dash *::after { box-sizing: inherit; }
.dash a { color: inherit; text-decoration: none; }
.dash svg.i {
  width: 18px;
  height: 18px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* sidebar */
.d-side {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
  border-right: 1px solid var(--line);
  background: var(--bg);
  z-index: 10;
}
.d-logo { padding: 0 6px 24px; }
.d-nav { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.d-nav a {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--muted);
  transition: background .18s, color .18s, transform .18s;
}
.d-nav a svg.i { transition: transform .18s, color .18s; }
.d-nav a:hover { background: rgba(10,10,10,.06); color: var(--ink); }
.d-nav a:hover svg.i { transform: translateX(2px); }
.d-nav a.on {
  background: var(--ink);
  color: var(--bg);
  box-shadow: 0 4px 14px rgba(10,10,10,.16);
}
.d-nav a.on::after {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--red);
  margin-left: auto;
  box-shadow: 0 0 8px rgba(236, 79, 95, 0.7);
}
.d-nav a.on:hover svg.i { transform: none; }
.d-user { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--line); }
.d-me { display: flex; align-items: center; gap: 10px; padding: 6px; }
.d-av {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--yellow);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.d-me b { display: block; font-size: 14px; }
.d-me small {
  display: block;
  font-size: 12px;
  color: var(--muted);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.d-out {
  width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: var(--muted);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}
.d-out:hover { color: var(--ink); border-color: var(--ink); background: #FBFAF7; }

/* main */
.d-main {
  min-width: 0;
  padding: 40px clamp(20px, 4vw, 56px) 56px;
  max-width: 1120px;
  width: 100%;
}
.d-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.d-head p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  font-weight: 500;
}
.d-head h1 {
  margin: 4px 0 0;
  font-size: 32px;
  letter-spacing: -.02em;
  line-height: 1.1;
  font-weight: 700;
}
.d-act { display: flex; gap: 10px; flex-wrap: wrap; }

/* buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  box-shadow: 0 1px 2px rgba(10,10,10,.04);
  transition: background .18s, border-color .18s, transform .18s, box-shadow .18s;
}
.btn:hover {
  border-color: var(--ink);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(10,10,10,.08);
}
.btn.dark {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
.btn.dark:hover {
  background: #1c1c1c;
  border-color: #1c1c1c;
  box-shadow: 0 4px 14px rgba(10,10,10,.25);
}
.btn.dark svg.i {
  color: var(--red);
  transition: transform .18s ease;
}
.btn.dark:hover svg.i {
  transform: rotate(90deg);
}
.btn.yellow {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--ink);
}
.btn.yellow:hover {
  background: #efc650;
  border-color: #efc650;
  box-shadow: 0 4px 14px rgba(244,207,99,.4);
}
.btn.sm { height: 38px; padding: 0 16px; }

/* cards */
.d-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}
.d-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(10,10,10,.02);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.d-stat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 148px;
  position: relative;
}
.d-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(10,10,10,.18);
  box-shadow: 0 6px 18px -4px rgba(10,10,10,.06);
}
.d-stat.highlight {
  border-color: rgba(236, 79, 95, 0.35);
  background: linear-gradient(180deg, #FFFFFF 0%, #FFFDFD 100%);
}
.d-stat .top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #55524B;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: .01em;
}
.d-stat .ic {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  transition: transform .18s ease;
}
.d-stat .ic svg.i {
  width: 16px;
  height: 16px;
}
.d-stat:hover .ic {
  transform: scale(1.05);
}
.d-stat .ic.ic-completed {
  background: #F0FDF4;
  border: 1px solid #DCFCE7;
  color: #16A34A;
}
.d-stat .ic.ic-score {
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  color: #E11D48;
}
.d-stat .ic.ic-sessions {
  background: #FEFCE8;
  border: 1px solid #FEF9C3;
  color: #CA8A04;
}
.d-stat .ic.ic-role {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #475569;
}
.d-stat strong {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -.02em;
  font-weight: 700;
  color: var(--ink);
}
.d-stat strong.role-val {
  font-size: 18px;
  line-height: 1.25;
  font-weight: 600;
  word-break: break-word;
}
.d-stat small {
  display: block;
  margin-top: auto;
  padding-top: 10px;
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 500;
}

/* no resume notice banner */
.d-note {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-left: 3px solid var(--red);
  box-shadow: 0 1px 2px rgba(10,10,10,.02);
}
.d-note-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.d-note-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--red-soft);
  border: 1px solid var(--red-border);
  color: var(--red);
  display: grid;
  place-items: center;
  flex: none;
}
.d-note b { display: block; font-size: 14.5px; font-weight: 700; }
.d-note span { font-size: 13.5px; color: var(--muted); }

/* recent interviews */
.d-recent {
  margin-top: 20px;
  padding: 22px 24px;
}
.d-rh {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}
.d-rh h2 {
  margin: 0;
  font-size: 19px;
  letter-spacing: -.01em;
  font-weight: 700;
  color: var(--ink);
}
.d-rh p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 13.5px;
}
.d-rh a {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 13px;
  border-radius: 999px;
  background: #FBFAF7;
  border: 1px solid var(--line);
  transition: border-color .15s, background .15s, transform .15s;
}
.d-rh a:hover {
  border-color: var(--ink);
  background: #fff;
  transform: translateX(1px);
}
.d-empty {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 12px;
  padding: 40px 0 20px;
  color: var(--muted);
  font-size: 14.5px;
}
.d-eico {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  color: var(--ink);
  background: rgba(244, 207, 99, 0.4);
  box-shadow: 0 0 0 8px rgba(244, 207, 99, 0.16);
}
.d-eico svg.i {
  width: 28px;
  height: 28px;
}
.d-list {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.d-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid rgba(0,0,0,.04);
  background: #FAFAF8;
  border-radius: 12px;
  transition: background .15s, border-color .15s, transform .15s, box-shadow .15s;
}
.d-list li.clickable {
  cursor: pointer;
}
.d-list li.clickable:hover {
  background: #FFFFFF;
  border-color: var(--line);
  transform: translateX(2px);
  box-shadow: 0 2px 6px rgba(10,10,10,.03);
}
.d-list b {
  display: block;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
}
.d-list small {
  color: var(--muted);
  font-size: 12.5px;
  margin-top: 2px;
  display: block;
}
.d-score {
  border-radius: 999px;
  padding: 3px 12px;
  font-weight: 600;
  font-size: 12.5px;
  letter-spacing: .01em;
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.22);
}
.d-score.mid {
  background: rgba(244, 207, 99, 0.18);
  color: #854d0e;
  border-color: rgba(244, 207, 99, 0.4);
}

/* bottom cta */
.d-cta {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 24px 28px;
  border-radius: 16px;
  background: #141312;
  color: var(--bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px -2px rgba(10,10,10,.18);
  position: relative;
}
.d-cta-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--red);
  background: rgba(236, 79, 95, 0.12);
  border: 1px solid rgba(236, 79, 95, 0.25);
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}
.d-cta h3 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -.01em;
  font-weight: 700;
  color: #fff;
}
.d-cta p {
  margin: 4px 0 0;
  color: #A39E93;
  font-size: 14px;
  line-height: 1.45;
}

.dash :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.d-cta :focus-visible { outline-color: var(--yellow); }

@media (max-width: 1000px) { .d-stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 820px) {
  .dash { grid-template-columns: minmax(0, 1fr); }
  .d-side {
    position: static;
    height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    padding: 14px 16px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .d-logo { padding: 0; }
  .d-nav {
    flex-direction: row;
    margin: 0;
    order: 3;
    width: 100%;
    overflow-x: auto;
  }
  .d-nav a { white-space: nowrap; padding: 9px 14px; }
  .d-user { margin: 0 0 0 auto; padding: 0; border: 0; }
  .d-me div, .d-out span { display: none; }
  .d-out { width: auto; margin: 0; }
}
@media (max-width: 520px) {
  .d-stats { grid-template-columns: 1fr; }
  .d-head h1 { font-size: 26px; }
}
@media (prefers-reduced-motion: reduce) { .dash * { transition: none !important; } }
`;

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  award: 'M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M8.5 14 7 22l5-3 5 3-1.5-8',
  plus: 'M12 5v14 M5 12h14',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  briefcase: 'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M2 13h20',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>
);

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
}

export default function DashboardPage({
  routes = {
    dashboard: '/dashboard',
    resume: '/resume',
    newInterview: '/interview/setup',
    history: '/interview/history',
  },
}) {
  const navigate  = useNavigate();
  const rawUser   = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = {
    name: rawUser?.name || 'Candidate',
    email: rawUser?.email || '',
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [sessionsRes, reportsRes, resumeRes] = await Promise.allSettled([
          interviewService.getAll(),
          reportService.getAll(),
          resumeService.getActive(),
        ]);
        if (!mounted) return;

        if (sessionsRes.status === 'fulfilled') {
          const d = sessionsRes.value.data?.data || sessionsRes.value.data || [];
          setSessions(Array.isArray(d) ? d : []);
        }
        if (reportsRes.status === 'fulfilled') {
          const d = reportsRes.value.data?.data || reportsRes.value.data || [];
          setReports(Array.isArray(d) ? d : []);
        }
        if (resumeRes.status === 'fulfilled') {
          setActiveResume(resumeRes.value.data?.data || resumeRes.value.data || null);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Compute metrics from real backend data
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const completedCount    = completedSessions.length || reports.length;
  const validScores       = reports
    .map((r) => r.overallScore)
    .filter((s) => typeof s === 'number' && !isNaN(s));
  const avgScore = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : null;

  const stats = {
    completed: completedCount,
    avgScore: avgScore ? `${avgScore}/10` : null,
    total: sessions.length,
    targetRole: sessions[0]?.roleTarget || null,
  };

  const hasResume = Boolean(activeResume && activeResume.id);

  // Map real sessions to recent interview items
  const reportMap = new Map(reports.map((r) => [r.sessionId, r]));
  const interviews = sessions.slice(0, 5).map((s) => {
    const report = reportMap.get(s.id);
    const scoreVal = report?.overallScore != null ? Math.round(report.overallScore * 10) : null;
    return {
      id: s.id,
      role: s.roleTarget || 'Technical Interview',
      date: s.createdAt
        ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '',
      score: scoreVal,
      reportId: report?.id,
      status: s.status,
    };
  });

  const nav = [
    ['dashboard', 'Dashboard', 'home', routes.dashboard],
    ['resume', 'Resume', 'file', routes.resume],
    ['new', 'New Interview', 'mic', routes.newInterview],
    ['history', 'History', 'clock', routes.history],
  ];

  const cards = [
    ['Completed', stats.completed ?? 0, 'Sessions evaluated', 'check', 'ic-completed', false, false],
    ['Avg. score', stats.avgScore ?? '—', stats.avgScore == null ? 'No reports yet' : 'Across all sessions', 'award', 'ic-score', true, false],
    ['Total sessions', stats.total ?? 0, 'Practice interviews', 'mic', 'ic-sessions', false, false],
    ['Target role', stats.targetRole ?? '—', 'Most recent session', 'briefcase', 'ic-role', false, true],
  ];

  async function handleSignOut() {
    try {
      setBusy(true);
      clearAuth();
      navigate('/login', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash">
      <style>{STYLES}</style>

      <aside className="d-side">
        <Logo to={routes.dashboard} className="d-logo" />

        <nav className="d-nav" aria-label="Main">
          {nav.map(([key, label, icon, href]) => (
            <Link
              key={key}
              to={href}
              className={key === 'dashboard' ? 'on' : ''}
              aria-current={key === 'dashboard' ? 'page' : undefined}
            >
              <Icon name={icon} />{label}
            </Link>
          ))}
        </nav>

        <div className="d-user">
          <div className="d-me">
            <span className="d-av">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            <div><b>{user.name}</b><small>{user.email}</small></div>
          </div>
          <button
            id="dash-signout-btn"
            className="d-out"
            onClick={handleSignOut}
            disabled={busy}
          >
            <Icon name="out" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="d-main">
        <header className="d-head">
          <div>
            <p>{greeting()}</p>
            <h1>{user.name}</h1>
          </div>
          <div className="d-act">
            <Link className="btn" to={routes.resume}>
              <Icon name="file" />Upload Resume
            </Link>
            <Link className="btn dark" to={routes.newInterview}>
              <Icon name="plus" />New Interview
            </Link>
          </div>
        </header>

        <section className="d-stats" aria-label="Your stats">
          {cards.map(([label, value, sub, icon, iconClass, isHighlight, isRole]) => (
            <div className={`d-card d-stat${isHighlight ? ' highlight' : ''}`} key={label}>
              <div className="top">
                <span>{label}</span>
                <span className={`ic ${iconClass}`}><Icon name={icon} /></span>
              </div>
              <strong className={isRole ? 'role-val' : isHighlight ? 'score-val' : ''}>{value}</strong>
              <small>{sub}</small>
            </div>
          ))}
        </section>

        {!loading && !hasResume && (
          <section className="d-note">
            <div className="d-note-left">
              <span className="d-note-icon">
                <Icon name="file" />
              </span>
              <div>
                <b>No resume uploaded</b>
                <span>Upload your resume so interviews are tailored to your experience.</span>
              </div>
            </div>
            <Link className="btn dark sm" to={routes.resume}>Upload resume →</Link>
          </section>
        )}

        <section className="d-card d-recent">
          <div className="d-rh">
            <div>
              <h2>Recent Interviews</h2>
              <p>Your latest practice sessions</p>
            </div>
            <Link to={routes.history}>View all →</Link>
          </div>
          {!loading && interviews.length === 0 ? (
            <div className="d-empty">
              <span className="d-eico"><Icon name="mic" /></span>
              <span>No interviews yet.</span>
              <Link className="btn dark" to={routes.newInterview}>Start your first interview →</Link>
            </div>
          ) : (
            <ul className="d-list">
              {interviews.map((it) => (
                <li
                  key={it.id}
                  className="clickable"
                  onClick={() => navigate(it.reportId ? `/report/${it.reportId}` : `/interview/${it.id}`)}
                >
                  <div>
                    <b>{it.role}</b>
                    <small>{it.date}</small>
                  </div>
                  {it.score != null && (
                    <span className={`d-score ${it.score < 75 ? 'mid' : ''}`}>
                      {it.score}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="d-cta">
          <div>
            <span className="d-cta-badge">AI-Powered Preparation</span>
            <h3>Ready to practice?</h3>
            <p>Set up your first AI-powered mock interview in under 60 seconds.</p>
          </div>
          <Link className="btn yellow" to={routes.newInterview}>Start interview →</Link>
        </section>
      </main>
    </div>
  );
}
