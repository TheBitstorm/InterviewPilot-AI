// src/pages/interview/InterviewHistoryPage.jsx
// Integrated Claude Interview History design with warm cream aesthetic.
// Reuses interviewService.getAll, reportService.getBySession, useAuthStore, and real API data.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { interviewService } from '../../services/interviewService';
import { reportService } from '../../services/reportService';
import Logo from '../../components/Logo';

// Styles are included in this file, so no separate CSS file is needed.
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap');

.dash{--bg:#F2EEE6;--card:#fff;--ink:#0A0A0A;--muted:#6B675F;--line:#E3DED2;--yellow:#F4CF63;--orange:#FF5A1F;
  min-height:100vh;display:grid;grid-template-columns:264px 1fr;background:var(--bg);color:var(--ink);
  font-family:'Space Grotesk',system-ui,sans-serif;box-sizing:border-box}
.dash *,.dash *::before,.dash *::after{box-sizing:inherit}
.dash a{color:inherit;text-decoration:none}
.dash svg.i{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

/* sidebar */
.d-side{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:22px 16px;border-right:1px solid var(--line)}
.d-logo{padding:0 6px 24px}
.d-nav{display:flex;flex-direction:column;gap:4px;margin-top:6px}
.d-nav a{position:relative;display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;font-size:15px;font-weight:500;color:var(--muted);transition:background .18s,color .18s,transform .18s}
.d-nav a svg.i{transition:transform .18s,color .18s}
.d-nav a:hover{background:rgba(10,10,10,.06);color:var(--ink)}
.d-nav a:hover svg.i{transform:translateX(2px)}
.d-nav a.on{background:var(--ink);color:var(--bg);box-shadow:0 4px 14px rgba(10,10,10,.18)}
.d-nav a.on::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--orange);margin-left:auto}
.d-nav a.on:hover svg.i{transform:none}
.d-user{margin-top:auto;padding-top:16px;border-top:1px solid var(--line)}
.d-me{display:flex;align-items:center;gap:10px;padding:6px}
.d-av{width:38px;height:38px;border-radius:50%;background:var(--yellow);display:grid;place-items:center;font-weight:700;flex:none}
.d-me b{display:block;font-size:14px}.d-me small{display:block;font-size:12px;color:var(--muted);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.d-out{width:100%;margin-top:10px;display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;font:inherit;font-size:14px;color:var(--muted);cursor:pointer}
.d-out{transition:color .15s,border-color .15s,background .15s}
.d-out:hover{color:var(--ink);border-color:var(--ink);background:#FBFAF7}

/* main */
.d-main{min-width:0;display:flex;flex-direction:column;gap:24px;padding:44px clamp(20px,4vw,56px) 64px;max-width:960px;width:100%;margin:0 auto}
.d-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:4px}
.d-head p{margin:0;color:var(--muted);font-size:15px}
.d-head h1{margin:4px 0 0;font-size:30px;letter-spacing:-.02em;line-height:1.1}
.btn{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:999px;font:inherit;font-weight:600;font-size:14px;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);transition:background .15s,border-color .15s,transform .15s}
.btn:hover{border-color:var(--ink)}
.btn.dark{background:var(--ink);color:var(--bg);border-color:var(--ink)}.btn.dark:hover{background:#262626}
.btn.yellow{background:var(--yellow);border-color:var(--yellow);color:var(--ink)}.btn.yellow:hover{background:#efc650}
.btn.sm{height:38px;padding:0 16px}
.d-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.d-rh+.d-empty,.d-rh+.d-list{margin-top:22px}
.d-empty{display:grid;justify-items:center;text-align:center;gap:8px;padding:56px 24px 52px;border:1px dashed rgba(10,10,10,.1);border-radius:16px;background:#FBFAF7}
.d-eico{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;margin-bottom:10px;color:var(--ink);background:rgba(244,207,99,.4);box-shadow:0 0 0 8px rgba(244,207,99,.16)}
.d-eico svg.i{width:28px;height:28px}
.d-empty h3{margin:0;font-size:18px;letter-spacing:-.01em;color:var(--ink)}
.d-empty p{margin:0;max-width:360px;font-size:14px;line-height:1.55;color:var(--muted)}
.d-empty .btn{height:48px;padding:0 26px;font-size:15px;margin-top:18px;box-shadow:0 6px 16px rgba(10,10,10,.18)}
.d-empty .btn:hover{transform:translateY(-1px)}
.dash :focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.h-title{margin:0;font-size:30px;letter-spacing:-.02em;line-height:1.1}
.d-head .h-sub{margin:8px 0 0;color:var(--muted);font-size:15px}
.h-list{margin:0;padding:8px;list-style:none;display:grid;gap:4px}
.h-row{display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:14px;transition:background .15s;text-decoration:none;color:inherit}
a.h-row:hover{background:#FBFAF7}
.h-ic{width:42px;height:42px;border-radius:12px;background:rgba(255,90,31,.1);color:var(--orange);display:grid;place-items:center;flex:none}
.h-info{flex:1;min-width:0}.h-info b{display:block;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h-info small{display:block;margin-top:3px;color:var(--muted);font-size:13px}
.h-pill{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
.h-score{background:var(--yellow);border-radius:999px;padding:4px 12px;font-weight:700;font-size:13px;white-space:nowrap}
.h-go{color:var(--muted);flex:none}.h-row:hover .h-go{color:var(--ink)}
.h-list li+li{border-top:1px solid var(--line)}
.h-wrap{padding:8px}
.d-main .d-empty{margin:20px;padding:72px 24px 64px}
@media(min-width:1500px){.d-main{max-width:1000px;padding-top:52px}}
@media(max-width:820px){
  .dash{grid-template-columns:minmax(0,1fr)}
  .d-side{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:14px 16px;border-right:0;border-bottom:1px solid var(--line)}
  .d-logo{padding:0}.d-nav{flex-direction:row;margin:0;order:3;width:100%;overflow-x:auto}.d-nav a{white-space:nowrap;padding:9px 14px}
  .d-user{margin:0 0 0 auto;padding:0;border:0}.d-me div,.d-out span{display:none}.d-out{width:auto;margin:0}
}
@media(max-width:640px){.h-row{flex-wrap:wrap;gap:10px 14px}.h-info{flex-basis:calc(100% - 60px)}.h-title{font-size:26px}}
@media(prefers-reduced-motion:reduce){.dash *{transition:none!important}}
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
  upload: 'M12 16V4 M7 9l5-5 5 5 M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>
);

const cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase() : '');

const TYPE_LABELS = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  hr: 'HR & Screening',
};

export default function InterviewHistoryPage({
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

  const [sessions, setSessions]     = useState([]);
  const [reports, setReports]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const user = {
    name: rawUser?.name || 'Candidate',
    email: rawUser?.email || '',
  };

  const nav = [
    ['dashboard', 'Dashboard', 'home', routes.dashboard],
    ['resume', 'Resume', 'file', routes.resume],
    ['new', 'New Interview', 'mic', routes.newInterview],
    ['history', 'History', 'clock', routes.history],
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await interviewService.getAll();
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setSessions(list);

        // Map reports directly from embedded session.report (0 extra queries)
        const reportMap = {};
        const missingReports = [];

        list.forEach((s) => {
          if (s.report) {
            reportMap[s.id] = s.report;
          } else if (s.status === 'completed') {
            missingReports.push(s.id);
          }
        });

        // If any completed sessions lacked embedded reports, fetch all reports in a single query
        if (missingReports.length > 0) {
          try {
            const allReportsRes = await reportService.getAll();
            const allReports = allReportsRes.data?.data || allReportsRes.data || [];
            if (Array.isArray(allReports)) {
              allReports.forEach((r) => {
                if (r.sessionId) reportMap[r.sessionId] = r;
              });
            }
          } catch {
            // Non-critical: sessions will still render with available data
          }
        }

        if (mounted) setReports(reportMap);
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load interview history.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  async function signOut() {
    try {
      setSigningOut(true);
      clearAuth();
      navigate('/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  // Format session date
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Map backend sessions to Claude UI item format
  const sorted = [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const interviews = sorted.map((s) => {
    const report = reports[s.id];
    let score = null;
    if (report?.overallScore != null) {
      score = Math.round(report.overallScore * 10);
    }

    let href = null;
    if (s.status === 'completed' && report?.id) {
      href = `/report/${report.id}`;
    } else if (s.status === 'active' || s.status === 'pending') {
      href = `/interview/${s.id}`;
    }

    const questionCount = s.questions?.length ?? s._count?.questions ?? null;

    let displayStatus = s.status;
    if (s.status === 'active') displayStatus = 'In Progress';
    else if (s.status === 'completed') displayStatus = 'Completed';
    else if (s.status === 'pending') displayStatus = 'Pending';

    return {
      id: s.id,
      role: s.roleTarget || 'Technical Interview',
      type: TYPE_LABELS[s.type] || s.type,
      difficulty: s.difficulty,
      questions: questionCount,
      date: formatDate(s.createdAt),
      status: displayStatus,
      score,
      href,
    };
  });

  const Row = ({ it }) => {
    const meta = [
      cap(it.type),
      cap(it.difficulty),
      it.questions != null && `${it.questions} questions`,
      it.date,
    ].filter(Boolean).join(' · ');

    const body = (
      <>
        <span className="h-ic"><Icon name="mic" /></span>
        <span className="h-info">
          <b>{it.role}</b>
          {meta && <small>{meta}</small>}
        </span>
        {it.status && <span className="h-pill">{it.status}</span>}
        {it.score != null && <span className="h-score">{it.score}%</span>}
        {it.href && <span className="h-go"><Icon name="arrow" /></span>}
      </>
    );

    return it.href ? (
      <Link className="h-row" to={it.href}>
        {body}
      </Link>
    ) : (
      <div className="h-row">{body}</div>
    );
  };

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
              className={key === 'history' ? 'on' : ''}
              aria-current={key === 'history' ? 'page' : undefined}
            >
              <Icon name={icon} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="d-user">
          <div className="d-me">
            <span className="d-av">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            <div><b>{user.name}</b><small>{user.email}</small></div>
          </div>
          <button id="history-signout-btn" className="d-out" onClick={signOut} disabled={signingOut}>
            <Icon name="out" /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="d-main">
        <header className="d-head">
          <div>
            <h1 className="h-title">Interview History</h1>
            <p className="h-sub">Review your past practice sessions and performance</p>
          </div>
          <Link className="btn dark" to={routes.newInterview}>
            <Icon name="plus" />New Interview
          </Link>
        </header>

        {loading && (
          <div style={{ display: 'grid', placeItems: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 14 }}>Loading interview history…</p>
          </div>
        )}

        {!loading && error && (
          <p style={{ margin: 0, padding: '12px 16px', borderRadius: 12, background: '#FBEBED', color: '#B3323F', fontSize: 14 }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <section className="d-card h-wrap">
            {interviews.length === 0 ? (
              <div className="d-empty">
                <span className="d-eico"><Icon name="mic" /></span>
                <h3>No interviews yet</h3>
                <p>Start your first practice session to see your history here.</p>
                <Link className="btn dark" to={routes.newInterview}>Start Your First Interview →</Link>
              </div>
            ) : (
              <ul className="h-list">
                {interviews.map((it) => (
                  <li key={it.id}><Row it={it} /></li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!loading && sorted.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)', margin: '8px 0 0' }}>
            {sorted.length} session{sorted.length !== 1 ? 's' : ''} · {sorted.filter((s) => s.status === 'completed').length} completed
          </p>
        )}
      </main>
    </div>
  );
}
