// src/pages/ResumePage.jsx
// Visual Polish & Color Refinement:
// - Enhanced Active status badge with rich, saturated warm amber/gold palette (#FEF3C7 / #FCD34D / #92400E) and indicator dot.
// - Restored clear accent color (#EC4F5F) for "Click to upload" with polished underline and hover states.
// - Cohesive document file icons with harmonious sizing, background tints, and borders across upload, preview, and card states.
// - 100% preserves resumeService.upload, resumeService.getAll, resumeService.getActive, returnTo/setupState routing, and auth handling.

import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { resumeService } from '../services/resumeService';
import Logo from '../components/Logo';

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
  --red-soft: rgba(236, 79, 95, 0.06);
  --red-border: rgba(236, 79, 95, 0.18);
  --amber-soft: #FEF3C7;
  --amber-border: #FCD34D;
  --amber-ink: #92400E;
  --green: #16A34A;
  --green-soft: #F0FDF4;
  --green-border: #DCFCE7;
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
  gap: 20px;
  padding: 40px clamp(20px, 4vw, 56px) 64px;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
}
.d-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.r-title {
  margin: 0;
  font-size: 32px;
  letter-spacing: -.02em;
  line-height: 1.1;
  font-weight: 700;
}
.r-lead {
  margin: 6px 0 0;
  max-width: 640px;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.5;
}

/* Overview Strip */
.r-overview {
  display: grid;
  grid-template-columns: auto 1px 1fr 1px auto;
  align-items: center;
  gap: 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 1px 3px rgba(10,10,10,.02);
}
.r-ov-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.r-ov-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.r-ov-val {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
}
.r-ov-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}
.r-ov-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--green);
}
.r-ov-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px rgba(22, 163, 74, 0.45);
}
.r-ov-div {
  width: 1px;
  height: 28px;
  background: var(--line);
}

/* Cards & List */
.r-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.r-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(10,10,10,.02);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.r-card:hover {
  transform: translateY(-1px);
  border-color: rgba(10,10,10,.18);
  box-shadow: 0 4px 12px rgba(10,10,10,.04);
}
.r-card.r-active {
  border-color: rgba(236, 79, 95, 0.18);
  background: #FFFFFF;
}
.r-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}
.r-card-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}
.r-file-ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  color: var(--muted);
  display: grid;
  place-items: center;
  flex: none;
  transition: transform .15s ease, background .15s ease, color .15s ease;
}
.r-file-ic.active {
  background: var(--red-soft);
  border-color: var(--red-border);
  color: var(--red);
}
.r-card:hover .r-file-ic {
  transform: scale(1.04);
}
.r-card-meta {
  flex: 1;
  min-width: 0;
}
.r-card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.r-filename {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 420px;
}

/* Enhanced Active Status Badge: saturated, warm, visible & balanced */
.r-badge-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--amber-soft);
  border: 1px solid var(--amber-border);
  color: var(--amber-ink);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
  box-shadow: 0 1px 2px rgba(146, 64, 14, 0.08);
}
.r-dot-active {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D97706;
  box-shadow: 0 0 5px rgba(217, 119, 6, 0.5);
}

.r-card-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  color: var(--muted);
  font-size: 13px;
}
.r-card-dot {
  font-size: 10px;
  opacity: .6;
}
.r-card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}
.r-view-btn {
  font-size: 13px;
  font-weight: 600;
}
.r-del-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
  flex: none;
}
.r-del-btn:hover {
  color: #B3323F;
  border-color: #B3323F;
  background: #FBEBED;
}

/* Upload Card */
.r-up {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 26px 28px;
  box-shadow: 0 1px 3px rgba(10,10,10,.02);
}
.r-up h2 {
  margin: 0;
  font-size: 19px;
  letter-spacing: -.01em;
  font-weight: 700;
  color: var(--ink);
}
.r-up > p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13.5px;
}
.r-drop {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 8px;
  margin-top: 20px;
  padding: 42px 24px;
  border: 1.5px dashed rgba(10,10,10,.16);
  border-radius: 14px;
  background: #FAF9F6;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.r-drop:hover {
  border-color: rgba(10,10,10,.35);
  background: #F5F3ED;
}
.r-drop.over {
  border-color: var(--red);
  background: rgba(236, 79, 95, 0.05);
}
.r-drop input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.r-drop:focus-within {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* Upload Icon in drop area: warm, subtle accent */
.r-uico {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  background: var(--red-soft);
  border: 1px solid var(--red-border);
  color: var(--red);
  box-shadow: 0 1px 3px rgba(236, 79, 95, 0.08);
  transition: transform .18s ease;
}
.r-drop:hover .r-uico {
  transform: translateY(-2px);
}
.r-uico svg.i {
  width: 22px;
  height: 22px;
}

/* Restored & Enhanced "Click to upload" accent styling */
.r-drop strong {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}
.r-drop strong u {
  color: var(--red);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgba(236, 79, 95, 0.45);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  transition: color .15s ease, text-decoration-color .15s ease;
}
.r-drop:hover strong u {
  color: #D93849;
  text-decoration-color: #D93849;
}
.r-drop small {
  display: inline-block;
  color: var(--muted);
  font-size: 12.5px;
  background: rgba(10,10,10,.04);
  padding: 3px 10px;
  border-radius: 999px;
  margin-top: 2px;
}

/* Selected File Preview */
.r-file {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #FAF9F6;
}
.r-file .ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--red-soft);
  border: 1px solid var(--red-border);
  color: var(--red);
  display: grid;
  place-items: center;
  flex: none;
}
.r-file .meta {
  flex: 1;
  min-width: 0;
}
.r-file b {
  display: block;
  font-size: 14.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ink);
}
.r-file small {
  color: var(--muted);
  font-size: 12.5px;
}
.r-x {
  border: 1px solid var(--line);
  background: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all .15s ease;
}
.r-x:hover {
  color: var(--ink);
  border-color: var(--ink);
  background: #FBFAF7;
}

/* Status banners */
.r-err {
  margin: 14px 0 0;
  padding: 11px 15px;
  border-radius: 10px;
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  color: #B91C1C;
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.r-ok {
  margin: 14px 0 0;
  padding: 11px 15px;
  border-radius: 10px;
  background: #F0FDF4;
  border: 1px solid #DCFCE7;
  color: #15803D;
  font-size: 13.5px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.r-go {
  width: 100%;
  height: 46px;
  margin-top: 18px;
  justify-content: center;
  font-size: 14.5px;
}
.r-go:disabled {
  opacity: .5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Empty & Loading states */
.r-empty-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
}
.r-empty-ic {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #FAF8F5;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--muted);
  flex: none;
}
.r-empty-card b {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}
.r-empty-card p {
  margin: 3px 0 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.45;
}
.r-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--muted);
  font-size: 14px;
}
.r-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--line);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: r-spin .7s linear infinite;
}
@keyframes r-spin {
  to { transform: rotate(360deg); }
}

/* buttons */
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
  box-shadow: 0 1px 2px rgba(10,10,10,.03);
  transition: background .15s, border-color .15s, transform .15s, box-shadow .15s;
}
.btn:hover {
  border-color: var(--ink);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(10,10,10,.06);
}
.btn.dark {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
.btn.dark:hover {
  background: #1c1c1c;
  border-color: #1c1c1c;
  box-shadow: 0 4px 12px rgba(10,10,10,.2);
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

/* Success Banner & Start Interview Flow */
.r-success-box {
  margin-top: 16px;
  padding: 16px 20px;
  border-radius: 14px;
  background: #F0FDF4;
  border: 1px solid #DCFCE7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.r-success-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.r-success-ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #DCFCE7;
  color: #15803D;
  display: grid;
  place-items: center;
  flex: none;
}
.r-success-ic svg.i {
  width: 18px;
  height: 18px;
}
.r-success-text b {
  display: block;
  font-size: 14.5px;
  font-weight: 700;
  color: #15803D;
}
.r-success-text p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #166534;
  line-height: 1.4;
}
.r-start-cta {
  height: 42px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(244, 207, 99, 0.3);
  flex: none;
}

/* Modal Dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,10,10,.48);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 999;
}
.modal-box {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 20px;
  max-width: 440px;
  width: 100%;
  padding: 26px;
  box-shadow: 0 16px 40px rgba(0,0,0,.18);
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
  .r-overview {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .r-ov-div { display: none; }
}
@media (max-width: 520px) {
  .r-title { font-size: 26px; }
  .r-up { padding: 20px; }
  .r-drop { padding: 32px 16px; }
  .r-card-inner { flex-direction: column; align-items: flex-start; }
  .r-card-actions { width: 100%; justify-content: flex-end; }
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
  upload: 'M12 16V4 M7 9l5-5 5 5 M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',
  arrowLeft: 'M19 12H5 M12 19l-7-7 7-7',
  trash: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>
);

const MAX_BYTES = 5 * 1024 * 1024;
const formatSize = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function ResumePage({
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

  const returnTo   = location.state?.returnTo;
  const setupState = location.state?.setupState;

  const [resumes, setResumes]           = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [file, setFile]                 = useState(null);
  const [over, setOver]                 = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [busy, setBusy]                 = useState(false);
  const [signingOut, setSigningOut]     = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState('');
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

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

  // Load all resumes and active resume simultaneously
  const loadResumeData = async () => {
    try {
      setLoading(true);
      const [activeRes, allRes] = await Promise.allSettled([
        resumeService.getActive(),
        resumeService.getAll(),
      ]);

      let activeData = null;
      if (activeRes.status === 'fulfilled' && activeRes.value?.data?.data) {
        activeData = activeRes.value.data.data;
      }
      setActiveResume(activeData);

      if (allRes.status === 'fulfilled' && Array.isArray(allRes.value?.data?.data)) {
        setResumes(allRes.value.data.data);
      } else {
        setResumes(activeData ? [activeData] : []);
      }
    } catch {
      setActiveResume(null);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  function pick(f) {
    setDone(false);
    setError('');
    if (!f) return;
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (!isPdf) return setError('Please choose a PDF file.');
    if (f.size > MAX_BYTES) return setError('That file is larger than 5 MB.');
    setFile(f);
  }

  function clear() {
    setFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleUpload() {
    if (!file) return;
    setError('');
    setDone(false);
    try {
      setBusy(true);
      const formData = new FormData();
      formData.append('resume', file);
      const res = await resumeService.upload(formData);
      const uploaded = res.data?.data || res.data;
      setUploadedResume(uploaded);
      setDone(true);
      clear();

      // Refresh the full resume list immediately
      await loadResumeData();

      // Automatically redirect to the New Interview setup page with the newly uploaded resume preselected
      setTimeout(() => {
        navigate(returnTo || routes.newInterview, {
          state: {
            selectedResumeId: uploaded?.id,
            setupState,
            justUploaded: true,
          },
        });
      }, 700);
    } catch (err) {
      setUploadedResume(null);
      setDone(false);
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Upload failed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!resumeToDelete) return;
    try {
      setDeleting(true);
      setDeleteNotice('');
      await resumeService.delete(resumeToDelete.id);
      setResumeToDelete(null);
      await loadResumeData();
    } catch (err) {
      setDeleteNotice(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete resume. Please try again.'
      );
    } finally {
      setDeleting(false);
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
              className={key === 'resume' ? 'on' : ''}
              aria-current={key === 'resume' ? 'page' : undefined}
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
          <button id="resume-signout-btn" className="d-out" onClick={signOut} disabled={signingOut}>
            <Icon name="out" /><span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="d-main">
        {returnTo && (
          <Link
            id="back-to-setup-btn"
            to={returnTo}
            state={{ setupState }}
            className="btn sm"
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Icon name="arrowLeft" /> Back to Setup
          </Link>
        )}

        <header className="d-head">
          <div>
            <h1 className="r-title">Resume</h1>
            <p className="r-lead">
              Your resume is used to personalise every interview question and AI feedback. Upload a PDF to get started.
            </p>
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div className="r-loading">
            <div className="r-spinner" />
            <span>Loading resumes…</span>
          </div>
        )}

        {/* Small Resume Overview strip (when resumes exist) */}
        {!loading && resumes.length > 0 && (
          <div className="r-overview">
            <div className="r-ov-item">
              <span className="r-ov-label">Total Resumes</span>
              <strong className="r-ov-val">{resumes.length} {resumes.length === 1 ? 'file' : 'files'}</strong>
            </div>
            <div className="r-ov-div" />
            <div className="r-ov-item">
              <span className="r-ov-label">Active For Interviews</span>
              <strong className="r-ov-val r-ov-truncate" title={activeResume?.fileName || resumes[0]?.fileName}>
                {activeResume?.fileName || resumes[0]?.fileName || 'None'}
              </strong>
            </div>
            <div className="r-ov-div" />
            <div className="r-ov-item">
              <span className="r-ov-label">AI Status</span>
              <span className="r-ov-status">
                <span className="r-ov-dot" />
                Parsed &amp; Ready
              </span>
            </div>
          </div>
        )}

        {/* Display all resumes as separate cards */}
        {!loading && resumes.length > 0 ? (
          <div className="r-cards">
            {resumes.map((r) => {
              const isActive = r.isActive || r.id === activeResume?.id;
              return (
                <section key={r.id} className={`r-card${isActive ? ' r-active' : ''}`}>
                  <div className="r-card-inner">
                    <div className="r-card-left">
                      <span className={`r-file-ic${isActive ? ' active' : ''}`}><Icon name="file" /></span>
                      <div className="r-card-meta">
                        <div className="r-card-title-row">
                          <b className="r-filename" title={r.fileName}>{r.fileName}</b>
                          {isActive && (
                            <span className="r-badge-active">
                              <span className="r-dot-active" />
                              Active
                            </span>
                          )}
                        </div>
                        <small className="r-card-sub">
                          {r.createdAt && `Uploaded on ${formatDate(r.createdAt)}`}
                          <span className="r-card-dot">•</span>
                          <span>PDF Document</span>
                        </small>
                      </div>
                    </div>
                    <div className="r-card-actions">
                      {r.fileUrl && (
                        <a className="btn sm r-view-btn" href={r.fileUrl} target="_blank" rel="noreferrer">
                          View
                        </a>
                      )}
                      <button
                        type="button"
                        className="r-del-btn"
                        title="Delete resume"
                        aria-label={`Delete resume ${r.fileName}`}
                        onClick={() => {
                          setDeleteNotice('');
                          setResumeToDelete(r);
                        }}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        ) : !loading ? (
          <section className="r-empty-card">
            <span className="r-empty-ic"><Icon name="file" /></span>
            <div>
              <b>No resume uploaded yet</b>
              <p>Upload your PDF resume below. InterviewPilot AI will parse your technical background to tailor practice questions and feedback.</p>
            </div>
          </section>
        ) : null}

        <section className="d-card r-up">
          <h2>{resumes.length > 0 ? 'Upload Another Resume' : 'Upload Resume'}</h2>
          <p>PDF format · Max 5 MB · Your resume is parsed to personalise interview questions.</p>

          {!file ? (
            <label
              id="resume-drop-zone"
              className={`r-drop${over ? ' over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
            >
              <input
                id="resume-file-input"
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              <span className="r-uico"><Icon name="upload" /></span>
              <strong><u>Click to upload</u> or drag &amp; drop</strong>
              <small>PDF only · Max 5 MB</small>
            </label>
          ) : (
            <div className="r-file">
              <span className="ic"><Icon name="file" /></span>
              <div className="meta">
                <b>{file.name}</b>
                <small>{formatSize(file.size)} · Ready to upload</small>
              </div>
              <button id="resume-remove-btn" type="button" className="r-x" onClick={clear} disabled={busy}>
                Remove
              </button>
            </div>
          )}

          {error && <p id="resume-error-alert" className="r-err" role="alert">{error}</p>}
          {done && uploadedResume && (
            <div id="resume-success-banner" className="r-success-box" role="status">
              <div className="r-success-left">
                <span className="r-success-ic"><Icon name="check" /></span>
                <div className="r-success-text">
                  <b>Resume uploaded successfully!</b>
                  <p>Redirecting to New Interview setup with your resume selected…</p>
                </div>
              </div>
            </div>
          )}

          <button
            id="upload-resume-btn"
            type="button"
            className="btn dark r-go"
            onClick={handleUpload}
            disabled={!file || busy}
          >
            <Icon name="upload" />
            {busy ? 'Uploading & Parsing…' : 'Upload Resume'}
          </button>
        </section>
      </main>

      {/* Confirmation Dialog for Delete */}
      {resumeToDelete && (
        <div className="modal-overlay" onClick={() => { if (!deleting) { setResumeToDelete(null); setDeleteNotice(''); } }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FBEBED', color: '#B3323F', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="trash" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}>Delete Resume?</h3>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                  Are you sure you want to delete this resume? <strong style={{ color: 'var(--ink)' }}>{resumeToDelete.fileName}</strong>
                </p>
              </div>
            </div>

            {deleteNotice && (
              <p style={{ margin: '14px 0 0', padding: '10px 14px', borderRadius: 10, background: '#FBEBED', color: '#B3323F', fontSize: 13, lineHeight: 1.4 }}>
                {deleteNotice}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button
                type="button"
                className="btn sm"
                disabled={deleting}
                onClick={() => { setResumeToDelete(null); setDeleteNotice(''); }}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-resume-btn"
                type="button"
                className="btn sm"
                disabled={deleting}
                style={{ background: '#B3323F', borderColor: '#B3323F', color: '#fff' }}
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
