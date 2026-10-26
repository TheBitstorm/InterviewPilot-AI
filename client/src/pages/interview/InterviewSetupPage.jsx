// src/pages/interview/InterviewSetupPage.jsx
// Visual Enhancement: Setup Your Mock Interview UI Refinements
// - Custom, subtle semantic tints for Easy (emerald), Medium (amber), and Hard (coral/red) options.
// - Harmonious selection states, borders, and checkmark indicators.
// - Polished resume cards with matching warm amber Active badge and red document icon.
// - Clean typography, consistent section padding, and refined Ready to Begin CTA.
// - 100% preserves resumeService.getAll, resumeService.getActive, interviewService.create, and useAuthStore.

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';
import Logo from '../../components/Logo';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&display=swap');

.dash {
  --bg: #F2EEE6;
  --card: #ffffff;
  --ink: #0A0A0A;
  --muted: #6B675F;
  --line: #E3DED2;
  --yellow: #F4CF63;
  --red: #EC4F5F;
  --red-soft: rgba(236, 79, 95, 0.10);
  --red-border: rgba(236, 79, 95, 0.28);
  --green: #16A34A;
  --green-soft: #F0FDF4;
  --green-border: #DCFCE7;
  --amber: #D97706;
  --amber-soft: #FFFBEB;
  --amber-border: #FCD34D;
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
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 40px clamp(20px, 4vw, 56px) 64px;
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
}
.n-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(244, 207, 99, 0.3);
  border: 1px solid rgba(244, 207, 99, 0.6);
  font-size: 12.5px;
  font-weight: 700;
  color: #854D0E;
}
.n-badge svg.i { width: 14px; height: 14px; }
.n-title {
  margin: 12px 0 0;
  font-size: 32px;
  letter-spacing: -.02em;
  line-height: 1.1;
  font-weight: 700;
}
.n-lead {
  margin: 6px 0 0;
  max-width: 660px;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.5;
}

/* Sections */
.d-main .n-sec {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 26px 28px;
  box-shadow: 0 1px 3px rgba(10, 10, 10, 0.02);
}
.n-h {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.n-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--bg);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  flex: none;
}
.n-h h2 {
  margin: 0;
  font-size: 19px;
  letter-spacing: -.01em;
  line-height: 30px;
  font-weight: 700;
  color: var(--ink);
}
.n-h p {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 13.5px;
}
.n-h .btn {
  margin-left: auto;
  flex: none;
}
.n-body {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

/* Options */
.opt {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;
  background: #FAF9F6;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  position: relative;
  transition: border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .15s ease;
}
.opt:hover {
  border-color: rgba(10, 10, 10, 0.28);
  background: #F5F3ED;
}
.opt.sel {
  border-color: var(--ink);
  background: #FAF8F5;
  box-shadow: 0 0 0 1px var(--ink);
}
.opt .ck {
  position: absolute;
  right: 14px;
  top: 14px;
  opacity: 0;
  color: var(--ink);
  transition: opacity .15s ease;
}
.opt.sel .ck {
  opacity: 1;
}

/* Difficulty Option Color Accents: Easy (green), Medium (amber), Hard (red) */
.opt-diff-easy.sel {
  border-color: #16A34A;
  background: #F0FDF4;
  box-shadow: 0 0 0 1px #16A34A;
}
.opt-diff-easy.sel .ck {
  color: #16A34A;
}
.opt-diff-easy:hover:not(.sel) {
  border-color: rgba(22, 163, 74, 0.4);
  background: #F7FEFA;
}
.dot-easy {
  background: #16A34A;
  box-shadow: 0 0 6px rgba(22, 163, 74, 0.45);
}

.opt-diff-medium.sel {
  border-color: #D97706;
  background: #FFFBEB;
  box-shadow: 0 0 0 1px #D97706;
}
.opt-diff-medium.sel .ck {
  color: #D97706;
}
.opt-diff-medium:hover:not(.sel) {
  border-color: rgba(217, 119, 6, 0.4);
  background: #FEFCF6;
}
.dot-medium {
  background: #D97706;
  box-shadow: 0 0 6px rgba(217, 119, 6, 0.45);
}

.opt-diff-hard.sel {
  border-color: #DC2626;
  background: #FEF2F2;
  box-shadow: 0 0 0 1px #DC2626;
}
.opt-diff-hard.sel .ck {
  color: #DC2626;
}
.opt-diff-hard:hover:not(.sel) {
  border-color: rgba(220, 38, 38, 0.4);
  background: #FFF8F8;
}
.dot-hard {
  background: #DC2626;
  box-shadow: 0 0 6px rgba(220, 38, 38, 0.45);
}

/* Resume Selection */
.n-res {
  display: flex;
  align-items: center;
  gap: 14px;
}
.n-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #cfc9ba;
  flex: none;
  display: grid;
  place-items: center;
  transition: border-color .15s ease;
}
.opt.sel .n-radio {
  border-color: var(--ink);
}
.opt.sel .n-radio::after {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink);
}
.n-ficon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(236, 79, 95, 0.1);
  border: 1px solid rgba(236, 79, 95, 0.25);
  color: var(--red);
  display: grid;
  place-items: center;
  flex: none;
}
.n-res .meta {
  min-width: 0;
  flex: 1;
}
.n-res b {
  font-size: 15px;
  margin-right: 8px;
  word-break: break-all;
  color: var(--ink);
}
.n-res small {
  display: block;
  margin-top: 3px;
  color: var(--muted);
  font-size: 13px;
}
.pillx {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  vertical-align: 1px;
  margin-right: 6px;
  letter-spacing: .02em;
}
.pillx.y {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  color: #92400E;
}
.pillx.k {
  background: var(--ink);
  color: #fff;
}

/* Target Role Input & Chips */
.n-label {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ink);
}
.n-label i {
  font-style: normal;
  color: var(--red);
}
.n-input {
  width: 100%;
  height: 46px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #FAF9F6;
  font: inherit;
  font-size: 15px;
  color: var(--ink);
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.n-input:focus {
  outline: none;
  border-color: var(--ink);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.08);
}
.n-sug {
  margin: 10px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .03em;
}
.n-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  font: inherit;
  font-size: 13.5px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s ease;
}
.chip:hover {
  border-color: var(--ink);
  color: var(--ink);
  background: #FBFAF7;
}
.chip.sel {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

/* Grid Layouts */
.n-grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.n-grid4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.n-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(10, 10, 10, 0.05);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--muted);
}
.opt.sel .n-tag {
  background: var(--ink);
  color: #fff;
}
.n-t {
  display: block;
  margin: 12px 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.n-d {
  display: block;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}
.n-lv {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.n-lv i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.n-lvd {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
}

/* Number of Questions */
.n-cnt {
  text-align: center;
  padding: 18px 12px;
}
.n-cnt strong {
  display: block;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -.02em;
  font-weight: 700;
  color: var(--ink);
}
.n-cnt span {
  display: block;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 500;
}

.n-none {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(244, 207, 99, 0.22);
  border: 1px solid rgba(244, 207, 99, 0.7);
  font-size: 14px;
}

/* Bottom CTA Card */
.n-go {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 28px;
  border-radius: 16px;
  background: #141312;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px -2px rgba(10, 10, 10, 0.18);
}
.n-go-badge {
  display: inline-block;
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--red);
  background: rgba(236, 79, 95, 0.12);
  border: 1px solid rgba(236, 79, 95, 0.25);
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  width: fit-content;
}
.n-go p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: #D4D0C7;
}
.n-go .btn {
  width: fit-content;
  height: 44px;
  padding: 0 24px;
  font-size: 14.5px;
  margin-top: 4px;
}
.n-go .btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}
.n-go :focus-visible {
  outline-color: var(--yellow);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  box-shadow: 0 1px 2px rgba(10, 10, 10, 0.03);
  transition: background .15s ease, border-color .15s ease, transform .15s ease, box-shadow .15s ease;
}
.btn:hover {
  border-color: var(--ink);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(10, 10, 10, 0.06);
}
.btn.dark {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
.btn.dark:hover {
  background: #1c1c1c;
  border-color: #1c1c1c;
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.2);
}
.btn.yellow {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--ink);
}
.btn.yellow:hover {
  background: #efc650;
  border-color: #efc650;
  box-shadow: 0 3px 10px rgba(244, 207, 99, 0.35);
}
.btn.sm {
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
}

.n-err {
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  color: #B91C1C;
  font-size: 13.5px;
}
.n-ok {
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: #F0FDF4;
  border: 1px solid #DCFCE7;
  color: #15803D;
  font-size: 13.5px;
  font-weight: 500;
}

@media (min-width: 1500px) {
  .d-main { max-width: 960px; padding-top: 48px; }
}
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
@media (max-width: 720px) {
  .n-grid3 { grid-template-columns: 1fr; }
  .n-grid4 { grid-template-columns: repeat(2, 1fr); }
  .n-h { flex-wrap: wrap; }
  .n-h .btn { margin-left: 44px; }
}
@media (max-width: 520px) {
  .d-main .n-sec { padding: 20px; }
  .n-title { font-size: 26px; }
}
@media (prefers-reduced-motion: reduce) {
  .dash * { transition: none !important; }
}
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
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>
);

const SUGGESTED_ROLES = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'System Architect',
];

const TYPES = [
  {
    id: 'technical',
    tag: 'Technical Depth',
    title: 'Technical Interview',
    desc: 'Coding architecture, algorithms, frameworks, and system design questions.',
  },
  {
    id: 'behavioral',
    tag: 'Culture & Fit',
    title: 'Behavioral Interview',
    desc: 'Situational prompts, team collaboration, leadership, and STAR method.',
  },
  {
    id: 'hr',
    tag: 'Foundational',
    title: 'HR & Screening',
    desc: 'Career trajectory, background, workplace expectations, and motivations.',
  },
];

const LEVELS = [
  { id: 'easy', title: 'Easy', dotClass: 'dot-easy', desc: 'Core fundamentals & straightforward concepts.' },
  { id: 'medium', title: 'Medium', dotClass: 'dot-medium', desc: 'Industry standard scenarios & balanced problem-solving.' },
  { id: 'hard', title: 'Hard', dotClass: 'dot-hard', desc: 'Complex trade-offs, architecture & edge cases.' },
];

const COUNTS = [3, 5, 7, 10];

export default function InterviewSetupPage({
  routes = {
    dashboard: '/dashboard',
    resume: '/resume',
    newInterview: '/interview/setup',
    history: '/interview/history',
  },
}) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const rawUser   = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const incomingSetupState = location.state?.setupState || {};

  const [resumes, setResumes]                   = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.selectedResumeId || null);
  const [role, setRole]                         = useState(incomingSetupState.targetRole || 'Full Stack Developer');
  const [type, setType]                         = useState(incomingSetupState.interviewType || 'technical');
  const [difficulty, setDifficulty]             = useState(incomingSetupState.difficulty || 'medium');
  const [questions, setQuestions]               = useState(incomingSetupState.questionCount || 5);
  const [error, setError]                       = useState('');
  const [busy, setBusy]                         = useState(false);
  const [signingOut, setSigningOut]             = useState(false);
  const [justUploadedBanner, setJustUploadedBanner] = useState(
    location.state?.justUploaded ? 'Resume uploaded and selected successfully!' : ''
  );

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

  // Fetch all resumes and active resume on mount
  useEffect(() => {
    let mounted = true;
    const fetchResumes = async () => {
      try {
        const [activeRes, allRes] = await Promise.allSettled([
          resumeService.getActive(),
          resumeService.getAll(),
        ]);

        if (!mounted) return;

        let activeObj = null;
        if (activeRes.status === 'fulfilled' && activeRes.value?.data?.data) {
          activeObj = activeRes.value.data.data;
        }

        if (allRes.status === 'fulfilled' && Array.isArray(allRes.value?.data?.data)) {
          const list = allRes.value.data.data;
          setResumes(list);

          const incomingId = location.state?.selectedResumeId;
          if (incomingId && list.some((r) => r.id === incomingId)) {
            setSelectedResumeId(incomingId);
          } else if (selectedResumeId && list.some((r) => r.id === selectedResumeId)) {
            // retain existing selection
          } else if (activeObj && list.some((r) => r.id === activeObj.id)) {
            setSelectedResumeId(activeObj.id);
          } else if (list.length > 0) {
            setSelectedResumeId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load resumes:', err);
      }
    };

    fetchResumes();
    return () => { mounted = false; };
  }, [location.state?.selectedResumeId]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const canStart = !!selectedResume && role.trim().length > 0 && !busy;

  const handleGoToUpload = () => {
    navigate('/resume', {
      state: {
        returnTo: '/interview/setup',
        setupState: {
          targetRole: role,
          interviewType: type,
          difficulty,
          questionCount: questions,
        },
      },
    });
  };

  async function start() {
    if (!canStart) return;
    setError('');
    const startT0 = Date.now();
    try {
      setBusy(true);
      const payload = {
        resumeId: selectedResumeId || null,
        targetRole: role.trim(),
        interviewType: type,
        difficulty,
        questionCount: Number(questions),
      };

      const response = await interviewService.create(payload);
      const session = response.data?.data || response.data;

      if (!session?.id) {
        throw new Error('Interview session creation did not return a valid session ID.');
      }

      console.log(`[Timing:Frontend] Session creation request completed in ${Date.now() - startT0}ms`);

      navigate(`/interview/${session.id}`, {
        state: {
          session,
          questionCount: Number(questions),
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not start the interview. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      setSigningOut(true);
      clearAuth();
      navigate('/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const Head = ({ n, title, text, children }) => (
    <div className="n-h">
      <span className="n-num">{n}</span>
      <div><h2>{title}</h2><p>{text}</p></div>
      {children}
    </div>
  );

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
              className={key === 'new' ? 'on' : ''}
              aria-current={key === 'new' ? 'page' : undefined}
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
          <button id="setup-signout-btn" className="d-out" onClick={signOut} disabled={signingOut}>
            <Icon name="out" /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="d-main">
        <header>
          <span className="n-badge"><Icon name="spark" />Interview Setup</span>
          <h1 className="n-title">Setup Your Mock Interview</h1>
          <p className="n-lead">
            Select your resume, configure the role, question type, and difficulty level to generate a realistic, tailored interview session.
          </p>
        </header>

        {justUploadedBanner && (
          <p className="n-ok" role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{justUploadedBanner}</span>
            <button
              type="button"
              onClick={() => setJustUploadedBanner('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: 'inherit' }}
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </p>
        )}

        {/* Section 1: Resume Selection (Lists all uploaded resumes) */}
        <section className="n-sec" aria-labelledby="s1">
          <Head
            n="1"
            title="Resume Selection"
            text="Select an uploaded resume so the AI interviewer can generate tailored questions based on your experience."
          >
            <button
              type="button"
              className="btn sm"
              onClick={handleGoToUpload}
            >
              <Icon name="upload" />
              Upload New Resume
            </button>
          </Head>

          <div className="n-body" role="group" aria-label="Resume">
            {resumes.length === 0 ? (
              <div className="n-none">
                <span>No resume uploaded yet. Upload one to personalise your interview.</span>
                <button type="button" className="btn dark sm" onClick={handleGoToUpload}>
                  Upload resume →
                </button>
              </div>
            ) : (
              resumes.map((r) => {
                const isSelected = r.id === selectedResumeId;
                return (
                  <button
                    type="button"
                    key={r.id}
                    className={`opt${isSelected ? ' sel' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedResumeId(r.id)}
                  >
                    <span className="n-res">
                      <span className="n-radio" />
                      <span className="n-ficon"><Icon name="file" /></span>
                      <span className="meta">
                        <b>{r.fileName}</b>
                        {r.isActive && <span className="pillx y">Active</span>}
                        {isSelected && <span className="pillx k">Selected</span>}
                        {r.createdAt && <small>Uploaded on {formatDate(r.createdAt)}</small>}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Section 2: Target Role */}
        <section className="n-sec">
          <Head
            n="2"
            title="Target Role"
            text="Enter the job title you are preparing for or pick a popular recommendation."
          />
          <div className="n-body">
            <div>
              <label className="n-label" htmlFor="role">Role / Title <i>*</i></label>
              <input
                id="role"
                className="n-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                autoComplete="off"
              />
            </div>
            <p className="n-sug">Suggested Roles</p>
            <div className="n-chips" style={{ marginTop: -2 }}>
              {SUGGESTED_ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`chip${role === r ? ' sel' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Interview Type */}
        <section className="n-sec">
          <Head
            n="3"
            title="Interview Type"
            text="Select the focus area of this interview session."
          />
          <div className="n-body n-grid3" role="group" aria-label="Interview type">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`opt${type === t.id ? ' sel' : ''}`}
                aria-pressed={type === t.id}
                onClick={() => setType(t.id)}
              >
                <span className="ck"><Icon name="check" /></span>
                <span className="n-tag">{t.tag}</span>
                <span className="n-t">{t.title}</span>
                <span className="n-d">{t.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 4: Difficulty with Semantic Tints (Easy = green, Medium = amber, Hard = red) */}
        <section className="n-sec">
          <Head
            n="4"
            title="Difficulty"
            text="Calibrate question complexity according to your current level."
          />
          <div className="n-body n-grid3" role="group" aria-label="Difficulty">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.id}
                className={`opt opt-diff-${l.id}${difficulty === l.id ? ' sel' : ''}`}
                aria-pressed={difficulty === l.id}
                onClick={() => setDifficulty(l.id)}
              >
                <span className="ck"><Icon name="check" /></span>
                <span className="n-lv"><i className={l.dotClass} />{l.title}</span>
                <span className="n-lvd">{l.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 5: Number of Questions */}
        <section className="n-sec">
          <Head
            n="5"
            title="Number of Questions"
            text="Determine how many questions will be prepared for this mock round."
          />
          <div className="n-body n-grid4" role="group" aria-label="Number of questions">
            {COUNTS.map((c) => (
              <button
                type="button"
                key={c}
                className={`opt n-cnt${questions === c ? ' sel' : ''}`}
                aria-pressed={questions === c}
                onClick={() => setQuestions(c)}
              >
                <strong>{c}</strong><span>Questions</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 6: Ready to Begin */}
        <section className="n-go">
          <span className="n-go-badge">Ready to begin</span>
          <p>
            {[
              selectedResume?.fileName || 'No resume selected',
              role.trim() || 'No role',
              type.toUpperCase(),
              difficulty.toUpperCase(),
              `${questions} Questions`,
            ].join(' · ')}
          </p>
          {error && <p className="n-err" role="alert">{error}</p>}
          <button
            id="start-interview-btn"
            type="button"
            className="btn yellow"
            onClick={start}
            disabled={!canStart}
          >
            {busy ? 'Starting…' : 'Start Interview →'}
          </button>
        </section>
      </main>
    </div>
  );
}
