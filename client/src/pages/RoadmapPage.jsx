// src/pages/RoadmapPage.jsx
// Redesigned Personalized Learning Roadmap & Skill Gap Progress Portal
// Visually unified with the warm cream, black, and orange design system (Landing Page, Dashboard, New Interview, Performance Analysis).
// Preserves 100% of existing roadmapService, auto-generation flow, topic status updates, optimistic metrics, filters, and resource links.

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { roadmapService } from '../services/roadmapService';
import Logo from '../components/Logo';

// ── Styles (Warm Cream, Ink, Yellow, Orange design system) ─────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&display=swap');

.dash {
  --bg: #F2EEE6;
  --card: #fff;
  --ink: #0A0A0A;
  --muted: #6B675F;
  --line: #E3DED2;
  --yellow: #F4CF63;
  --orange: #FF5A1F;
  --red: #EC4F5F;
  --green: #15803d;
  --green-bg: #dcfce7;
  --green-line: #86efac;
  --amber: #b45309;
  --amber-bg: #fef3c7;
  --amber-line: #fde68a;
  --blue: #1d4ed8;
  --blue-bg: #eff6ff;
  --blue-line: #bfdbfe;
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
  box-shadow: 0 4px 14px rgba(10,10,10,.18);
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

/* main content */
.d-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 40px clamp(20px, 4vw, 56px) 64px;
  max-width: 1020px;
  width: 100%;
  margin: 0 auto;
}

/* common button styles */
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
.btn.dark { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn.dark:hover { background: #1c1c1c; border-color: #1c1c1c; box-shadow: 0 4px 14px rgba(10,10,10,.25); }
.btn.yellow { background: var(--yellow); border-color: var(--yellow); color: var(--ink); }
.btn.yellow:hover { background: #efc650; border-color: #efc650; box-shadow: 0 4px 14px rgba(244,207,99,.4); }
.btn.sm { height: 38px; padding: 0 16px; font-size: 13px; }

/* cards */
.d-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(10,10,10,.03), 0 1px 2px rgba(10,10,10,.02);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}

/* top breadcrumb bar */
.rm-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}
.rm-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  padding: 8px 16px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 1px 2px rgba(10,10,10,.04);
  transition: border-color .15s, background .15s, transform .15s;
}
.rm-back:hover {
  border-color: var(--ink);
  background: #FBFAF7;
  transform: translateX(-2px);
}
.rm-meta-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rm-report-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  background: rgba(244,207,99,.35);
  border: 1px solid rgba(244,207,99,.8);
  padding: 7px 16px;
  border-radius: 999px;
  transition: background .15s, transform .15s, box-shadow .15s;
}
.rm-report-btn:hover {
  background: var(--yellow);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244,207,99,.35);
}
.rm-id {
  font-size: 12px;
  color: var(--muted);
  background: #fff;
  border: 1px solid var(--line);
  padding: 6px 12px;
  border-radius: 999px;
}
.rm-id code { font-family: monospace; font-weight: 600; color: var(--ink); }

/* header banner */
.rm-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  padding: 28px 32px;
  background: #fff;
}
.rm-head-left { flex: 1; min-width: 280px; }
.rm-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.rm-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(10,10,10,.06);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
}
.rm-pill.gold {
  background: rgba(244,207,99,.35);
  border: 1px solid rgba(244,207,99,.8);
  color: var(--ink);
}
.rm-pill.dark { background: var(--ink); color: var(--bg); }
.rm-title {
  margin: 0;
  font-size: 32px;
  letter-spacing: -.02em;
  line-height: 1.1;
  font-weight: 700;
  color: var(--ink);
}
.rm-sub { margin: 6px 0 0; color: var(--muted); font-size: 15px; line-height: 1.5; }

/* progress widget in header */
.rm-prog-box {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 24px;
  background: #FBFAF7;
  border: 1px solid var(--line);
  border-radius: 16px;
  flex: none;
  box-shadow: 0 1px 3px rgba(10,10,10,.03);
}
.rm-prog-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.rm-prog-pct {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -.03em;
  line-height: 1;
  color: var(--ink);
}
.rm-prog-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  color: var(--muted);
  text-transform: uppercase;
  margin-top: 4px;
}
.rm-prog-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 1px solid var(--line);
  padding-left: 20px;
}
.rm-prog-meta small {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  letter-spacing: .04em;
}
.rm-prog-meta strong {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

/* milestone mini metrics bar */
.rm-milestone-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.rm-ms-item {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 2px rgba(10,10,10,.02);
  transition: transform .15s ease, border-color .15s ease;
}
.rm-ms-item:hover {
  transform: translateY(-1px);
  border-color: rgba(10,10,10,.2);
}
.rm-ms-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
}
.rm-ms-icon.all { background: rgba(10,10,10,.05); color: var(--ink); }
.rm-ms-icon.prio { background: rgba(236, 79, 95, 0.12); color: var(--red); }
.rm-ms-icon.prog { background: rgba(244, 207, 99, 0.35); color: #854d0e; }
.rm-ms-icon.done { background: var(--green-bg); color: var(--green); }
.rm-ms-text small {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--muted);
}
.rm-ms-text strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.1;
  margin-top: 2px;
}

/* progress bar card */
.rm-progress-card {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rm-track {
  height: 10px;
  background: #E3DED2;
  border-radius: 999px;
  overflow: hidden;
  width: 100%;
}
.rm-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ink);
  transition: width .4s cubic-bezier(0.16, 1, 0.3, 1), background-color .4s ease;
}
.rm-completion-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--green-bg);
  border: 1px solid var(--green-line);
  border-radius: 12px;
  color: var(--green);
  font-size: 14.5px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.08);
}
.rm-completion-banner strong { font-weight: 700; }

/* filter / tab buttons */
.rm-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rm-tab {
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--muted);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(10,10,10,.03);
  transition: all .15s;
}
.rm-tab:hover {
  border-color: var(--ink);
  color: var(--ink);
  transform: translateY(-1px);
}
.rm-tab.active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
  box-shadow: 0 2px 8px rgba(10,10,10,.16);
}

/* modules list */
.rm-modules { display: flex; flex-direction: column; gap: 16px; }
.rm-mod-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 26px 30px;
  box-shadow: 0 1px 3px rgba(10,10,10,.03), 0 1px 2px rgba(10,10,10,.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color .18s, box-shadow .18s, transform .15s;
}
.rm-mod-card:hover {
  border-color: rgba(10,10,10,.25);
  box-shadow: 0 6px 20px -4px rgba(10,10,10,.06);
}
.rm-mod-card.done {
  border-color: var(--green-line);
  background: #FCFDFB;
}

/* module header */
.rm-mod-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.rm-mod-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rm-mod-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg);
  background: var(--ink);
  padding: 4px 10px;
  border-radius: 8px;
}
.rm-prio-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .05em;
  padding: 4px 12px;
  border-radius: 999px;
  text-transform: uppercase;
}
.rm-prio-badge.high {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid var(--red-line);
}
.rm-prio-badge.medium {
  background: var(--amber-bg);
  color: var(--amber);
  border: 1px solid var(--amber-line);
}
.rm-prio-badge.low {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-line);
}

/* status toggle segmented pill */
.rm-status-seg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: #FBFAF7;
  border: 1px solid var(--line);
}
.rm-status-btn {
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background .15s, color .15s, box-shadow .15s;
}
.rm-status-btn:disabled { opacity: .5; cursor: not-allowed; }
.rm-status-btn:hover:not(:disabled) { color: var(--ink); }
.rm-status-btn.active-not_started {
  background: #E3DED2;
  color: var(--ink);
  font-weight: 700;
}
.rm-status-btn.active-in_progress {
  background: var(--yellow);
  color: var(--ink);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}
.rm-status-btn.active-done {
  background: var(--green);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}

/* module text */
.rm-mod-info h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--ink);
}
.rm-mod-info p {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--muted);
}

/* resources section */
.rm-res-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
.rm-res-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--muted);
}
.rm-res-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}
.rm-res-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #FBFAF7;
  border: 1px solid var(--line);
  transition: transform .18s, border-color .18s, background .18s, box-shadow .18s;
}
.rm-res-card:hover {
  background: #fff;
  border-color: var(--ink);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(10,10,10,.05);
}
.rm-res-icon-tile {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
}
.rm-res-icon-tile.video { background: rgba(236, 79, 95, 0.12); color: var(--red); }
.rm-res-icon-tile.code { background: rgba(34, 197, 94, 0.12); color: var(--green); }
.rm-res-icon-tile.book { background: rgba(244, 207, 99, 0.35); color: #854d0e; }
.rm-res-meta { flex: 1; min-width: 0; }
.rm-res-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.rm-res-title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--ink);
}
.rm-res-ext {
  color: var(--muted);
  flex: none;
  margin-top: 2px;
  transition: color .15s;
}
.rm-res-card:hover .rm-res-ext { color: var(--ink); }
.rm-res-subrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.rm-res-type {
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  background: rgba(10,10,10,.05);
  padding: 2px 7px;
  border-radius: 6px;
}
.rm-res-time {
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: monospace;
}

/* center states */
.rm-center {
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 80vh;
}
.rm-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid var(--line);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: rmspin .8s linear infinite;
}
@keyframes rmspin { to { transform: rotate(360deg); } }

/* responsive */
@media (max-width: 1000px) {
  .rm-milestone-grid { grid-template-columns: repeat(2, 1fr); }
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
  .rm-head { flex-direction: column; align-items: flex-start; }
  .rm-prog-box { width: 100%; }
}
@media (max-width: 600px) {
  .rm-title { font-size: 26px; }
  .rm-mod-top { flex-direction: column; align-items: flex-start; }
  .rm-milestone-grid { grid-template-columns: 1fr; }
}
`;

// ── Icons ──────────────────────────────────────────────────────────────────────
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  spark: 'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',
  arrowLeft: 'M19 12H5 M12 19l-7-7 7-7',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  book: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  video: 'm23 7-7 5 7 5V7z M1 5h15v14H1z',
  code: 'm16 18 6-6-6-6 M8 6l-6 6 6 6',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

const getResourceIconAndClass = (type) => {
  switch (type) {
    case 'video':
      return { icon: <Icon name="video" />, cls: 'video' };
    case 'problem':
      return { icon: <Icon name="code" />, cls: 'code' };
    case 'article':
    default:
      return { icon: <Icon name="book" />, cls: 'book' };
  }
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rawUser = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'high' | 'pending' | 'done'

  const user = {
    name: rawUser?.name || 'Candidate',
    email: rawUser?.email || '',
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  // Load roadmap by ID or auto-generate if `:id` is a source report ID
  useEffect(() => {
    let mounted = true;

    const loadOrGenerateRoadmap = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');

        // Step 1: Attempt to fetch existing roadmap by ID (or sourceReportId)
        try {
          const res = await roadmapService.getById(id);
          if (!mounted) return;
          const data = res.data?.data || res.data;
          if (data && data.id) {
            setRoadmap(data);
            setLoading(false);
            return;
          }
        } catch (fetchErr) {
          // If 404, it might be a Report ID that hasn't had a roadmap generated yet
          if (fetchErr?.response?.status !== 404) {
            throw fetchErr;
          }
        }

        // Step 2: If not found, attempt to generate roadmap for this Report ID
        setGenerating(true);
        const genRes = await roadmapService.generate({ reportId: id });
        if (!mounted) return;
        const genData = genRes.data?.data?.roadmap || genRes.data?.data || genRes.data;
        setRoadmap(genData);
      } catch (err) {
        if (!mounted) return;
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load or generate personalized learning roadmap.';
        setError(msg);
      } finally {
        if (mounted) {
          setLoading(false);
          setGenerating(false);
        }
      }
    };

    loadOrGenerateRoadmap();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Handle topic status changes
  const handleStatusChange = async (topicId, newStatus) => {
    if (updatingTopicId || !roadmap) return;
    setUpdatingTopicId(topicId);

    // Optimistic UI update
    const previousTopics = [...roadmap.topics];
    const updatedTopics = roadmap.topics.map((t) =>
      t.id === topicId ? { ...t, status: newStatus } : t
    );

    const totalTopics = updatedTopics.length;
    const completedTopics = updatedTopics.filter((t) => t.status === 'done').length;
    const progressPercentage =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    setRoadmap((prev) => ({
      ...prev,
      topics: updatedTopics,
      metrics: {
        ...prev.metrics,
        totalTopics,
        completedTopics,
        progressPercentage,
      },
    }));

    try {
      const res = await roadmapService.updateTopicStatus(topicId, newStatus);
      const data = res.data?.data || res.data;
      if (data?.roadmapMetrics) {
        setRoadmap((prev) => ({
          ...prev,
          metrics: data.roadmapMetrics,
        }));
      }
    } catch (err) {
      console.error('Failed to update topic status:', err);
      setRoadmap((prev) => ({
        ...prev,
        topics: previousTopics,
      }));
      alert('Failed to update topic status. Please try again.');
    } finally {
      setUpdatingTopicId(null);
    }
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dash" style={{ display: 'block' }}>
        <style>{STYLES}</style>
        <div className="rm-center">
          <div className="rm-spinner" />
          <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>
            {generating
              ? 'Synthesizing Personalized Learning Roadmap…'
              : 'Loading Learning Roadmap…'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: 0, maxWidth: 460, lineHeight: 1.55 }}>
            {generating
              ? 'Gemini AI is analyzing your mock interview diagnostics to formulate targeted curriculum modules and curated study resources.'
              : 'Retrieving your curated study curriculum and progress metrics.'}
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error || !roadmap) {
    return (
      <div className="dash" style={{ display: 'block' }}>
        <style>{STYLES}</style>
        <div className="rm-center">
          <div className="d-card" style={{ maxWidth: 460, width: '100%', textAlign: 'center', padding: '36px 24px' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>⚠️</span>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Roadmap Unavailable</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              {error || 'Could not find or generate the requested learning roadmap.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn dark" onClick={() => window.location.reload()}>
                Retry Generation
              </button>
              <button type="button" className="btn" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topics = Array.isArray(roadmap.topics) ? roadmap.topics : [];
  const metrics = roadmap.metrics || {};
  const progressPercent = metrics.progressPercentage ?? 0;
  const isCompleted = progressPercent === 100 && topics.length > 0;
  const shortRoadmapId = roadmap.id || id || '';

  const highPriorityCount = topics.filter((t) => t.priority === 'high').length;
  const inProgressCount = topics.filter((t) => t.status === 'in_progress').length;
  const completedCount = metrics.completedTopics || topics.filter((t) => t.status === 'done').length;

  // Filter topics based on active tab
  const filteredTopics = topics.filter((t) => {
    if (filterPriority === 'high') return t.priority === 'high';
    if (filterPriority === 'pending') return t.status !== 'done';
    if (filterPriority === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div className="dash">
      <style>{STYLES}</style>

      {/* ── Sidebar (Consistent with Dashboard, Resume, Setup, History, Report) ── */}
      <aside className="d-side">
        <div className="d-logo">
          <Logo to="/dashboard" />
        </div>

        <nav className="d-nav">
          <Link to="/dashboard">
            <Icon name="home" />
            <span>Dashboard</span>
          </Link>
          <Link to="/resume">
            <Icon name="file" />
            <span>Resume</span>
          </Link>
          <Link to="/interview/setup">
            <Icon name="mic" />
            <span>New Interview</span>
          </Link>
          <Link to="/interview/history" className="on">
            <Icon name="clock" />
            <span>History</span>
          </Link>
        </nav>

        <div className="d-user">
          <div className="d-me">
            <div className="d-av">{(user.name || 'C')[0]?.toUpperCase()}</div>
            <div>
              <b>{user.name}</b>
              <small title={user.email}>{user.email}</small>
            </div>
          </div>
          <button type="button" className="d-out" onClick={handleLogout} title="Sign out">
            <Icon name="out" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Personalized Roadmap Content ──────────────────────────────── */}
      <main className="d-main">

        {/* ── Top Bar / Breadcrumb ─────────────────────────────────────────── */}
        <div className="rm-bar">
          <Link
            to={roadmap.sourceReportId ? `/report/${roadmap.sourceReportId}` : '/interview/history'}
            className="rm-back"
            title="Return to Source Report"
          >
            <Icon name="arrowLeft" />
            <span>{roadmap.sourceReportId ? 'Back to Report' : 'Back to History'}</span>
          </Link>

          <div className="rm-meta-group">
            {roadmap.sourceReportId && (
              <Link to={`/report/${roadmap.sourceReportId}`} className="rm-report-btn">
                <span>View Diagnostic Report</span>
                <span style={{ fontSize: 14 }}>→</span>
              </Link>
            )}
            <span className="rm-id">
              Roadmap: <code>{shortRoadmapId.slice(0, 8)}…</code>
            </span>
          </div>
        </div>

        {/* ── Header Metadata & Progress Banner ────────────────────────────── */}
        <section className="d-card rm-head">
          <div className="rm-head-left">
            <div className="rm-badges">
              <span className="rm-pill dark">
                {roadmap.roleTarget ? roadmap.roleTarget.toUpperCase() : 'ENGINEERING'}
              </span>
              <span className="rm-pill gold">
                <Icon name="spark" />
                <span>AI-Tailored Skill Gap Curriculum</span>
              </span>
            </div>
            <h1 className="rm-title">Personalized Learning Roadmap</h1>
            <p className="rm-sub">
              Engineered from your mock interview diagnosis to eliminate skill gaps and prepare you for senior hiring bars.
            </p>
          </div>

          <div className="rm-prog-box">
            <div className="rm-prog-circle">
              <span className="rm-prog-pct">{progressPercent}%</span>
              <span className="rm-prog-label">Completed</span>
            </div>
            <div className="rm-prog-meta">
              <small>Curriculum Progress</small>
              <strong>
                {completedCount} of {metrics.totalTopics || topics.length} Modules Mastered
              </strong>
            </div>
          </div>
        </section>

        {/* ── Milestone Mini Metrics Strip ─────────────────────────────────── */}
        <div className="rm-milestone-grid">
          <div className="rm-ms-item">
            <div className="rm-ms-icon all">
              <Icon name="compass" />
            </div>
            <div className="rm-ms-text">
              <small>Total Modules</small>
              <strong>{topics.length}</strong>
            </div>
          </div>
          <div className="rm-ms-item">
            <div className="rm-ms-icon prio">
              <Icon name="flag" />
            </div>
            <div className="rm-ms-text">
              <small>High Priority</small>
              <strong>{highPriorityCount}</strong>
            </div>
          </div>
          <div className="rm-ms-item">
            <div className="rm-ms-icon prog">
              <Icon name="clock" />
            </div>
            <div className="rm-ms-text">
              <small>In Progress</small>
              <strong>{inProgressCount}</strong>
            </div>
          </div>
          <div className="rm-ms-item">
            <div className="rm-ms-icon done">
              <Icon name="check" />
            </div>
            <div className="rm-ms-text">
              <small>Mastered</small>
              <strong>{completedCount}</strong>
            </div>
          </div>
        </div>

        {/* ── Progress Bar Card ─────────────────────────────────────────────── */}
        <section className="d-card rm-progress-card">
          <div className="rm-track">
            <div
              className="rm-fill"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? 'var(--green)' : 'var(--ink)',
              }}
            />
          </div>

          {isCompleted && (
            <div className="rm-completion-banner">
              <Icon name="check" />
              <span>
                <strong>Roadmap Completed!</strong> You have addressed all diagnosed skill gaps for {roadmap.roleTarget}. You are ready for your next mock or live interview!
              </span>
            </div>
          )}
        </section>

        {/* ── Filter / Tab Controls ─────────────────────────────────────────── */}
        <div className="rm-filters">
          <button
            type="button"
            className={`rm-tab${filterPriority === 'all' ? ' active' : ''}`}
            onClick={() => setFilterPriority('all')}
          >
            All Modules ({topics.length})
          </button>
          <button
            type="button"
            className={`rm-tab${filterPriority === 'high' ? ' active' : ''}`}
            onClick={() => setFilterPriority('high')}
          >
            High Priority ({highPriorityCount})
          </button>
          <button
            type="button"
            className={`rm-tab${filterPriority === 'pending' ? ' active' : ''}`}
            onClick={() => setFilterPriority('pending')}
          >
            To Do ({topics.filter((t) => t.status !== 'done').length})
          </button>
          <button
            type="button"
            className={`rm-tab${filterPriority === 'done' ? ' active' : ''}`}
            onClick={() => setFilterPriority('done')}
          >
            Done ({completedCount})
          </button>
        </div>

        {/* ── Modules List ─────────────────────────────────────────────────── */}
        <div className="rm-modules">
          {filteredTopics.length === 0 ? (
            <div className="d-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
              <p style={{ margin: 0, fontSize: 15 }}>No modules found matching this filter.</p>
            </div>
          ) : (
            filteredTopics.map((topic, idx) => {
              const resources = Array.isArray(topic.resources) ? topic.resources : [];
              const isTopicUpdating = updatingTopicId === topic.id;
              const priorityClass = topic.priority === 'high' ? 'high' : topic.priority === 'medium' ? 'medium' : 'low';
              const priorityLabel = topic.priority === 'high' ? 'HIGH PRIORITY' : topic.priority === 'medium' ? 'MEDIUM PRIORITY' : 'FOUNDATIONAL';

              return (
                <div
                  key={topic.id || idx}
                  className={`rm-mod-card${topic.status === 'done' ? ' done' : ''}`}
                >
                  {/* Module Header */}
                  <div className="rm-mod-top">
                    <div className="rm-mod-left">
                      <span className="rm-mod-num">MODULE {topic.orderIndex + 1}</span>
                      <span className={`rm-prio-badge ${priorityClass}`}>
                        {priorityLabel}
                      </span>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="rm-status-seg" role="group" aria-label="Topic completion status">
                      <button
                        type="button"
                        disabled={isTopicUpdating}
                        onClick={() => handleStatusChange(topic.id, 'not_started')}
                        className={`rm-status-btn${topic.status === 'not_started' ? ' active-not_started' : ''}`}
                      >
                        Not Started
                      </button>
                      <button
                        type="button"
                        disabled={isTopicUpdating}
                        onClick={() => handleStatusChange(topic.id, 'in_progress')}
                        className={`rm-status-btn${topic.status === 'in_progress' ? ' active-in_progress' : ''}`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        disabled={isTopicUpdating}
                        onClick={() => handleStatusChange(topic.id, 'done')}
                        className={`rm-status-btn${topic.status === 'done' ? ' active-done' : ''}`}
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="rm-mod-info">
                    <h2>{topic.title}</h2>
                    <p>{topic.description}</p>
                  </div>

                  {/* Curated Resources Section */}
                  {resources.length > 0 && (
                    <div className="rm-res-wrap">
                      <div className="rm-res-head">
                        <Icon name="compass" />
                        <span>Curated Learning Resources ({resources.length})</span>
                      </div>

                      <div className="rm-res-grid">
                        {resources.map((res, rIdx) => {
                          const { icon: resIcon, cls: resCls } = getResourceIconAndClass(res.type);
                          return (
                            <a
                              key={res.id || rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rm-res-card"
                              title={`Open resource: ${res.title}`}
                            >
                              <div className={`rm-res-icon-tile ${resCls}`}>
                                {resIcon}
                              </div>
                              <div className="rm-res-meta">
                                <div className="rm-res-title-row">
                                  <span className="rm-res-title">{res.title}</span>
                                  <span className="rm-res-ext">
                                    <Icon name="external" />
                                  </span>
                                </div>
                                <div className="rm-res-subrow">
                                  <span className="rm-res-type">
                                    {res.type ? res.type.toUpperCase() : 'ARTICLE'}
                                  </span>
                                  {res.estimatedTime && (
                                    <span className="rm-res-time">
                                      <Icon name="clock" />
                                      <span>{res.estimatedTime}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
