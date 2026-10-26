// src/pages/ReportPage.jsx
// Redesigned Performance Analysis & Interview Report UI
// Visually consistent with the warm cream, black, and orange design system (Landing Page, Dashboard, New Interview).
// Preserves 100% of existing reportService, useParams, Gemini feedback, scores, transcripts, and Roadmap navigation.

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { reportService } from '../services/reportService';
import Logo from '../components/Logo';

// ── Styles (Warm Cream, Ink, Yellow, Orange design system) ─────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap');

.dash {
  --bg: #F2EEE6;
  --card: #fff;
  --ink: #0A0A0A;
  --muted: #6B675F;
  --line: #E3DED2;
  --yellow: #F4CF63;
  --orange: #FF5A1F;
  --green: #15803d;
  --green-bg: #dcfce7;
  --green-line: #86efac;
  --red: #b91c1c;
  --red-bg: #fee2e2;
  --red-line: #fca5a5;
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
  background: var(--orange);
  margin-left: auto;
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
  gap: 24px;
  padding: 40px clamp(20px, 4vw, 56px) 64px;
  max-width: 980px;
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
  transition: background .15s, border-color .15s, transform .15s;
}
.btn:hover { border-color: var(--ink); }
.btn.dark { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.btn.dark:hover { background: #262626; }
.btn.yellow { background: var(--yellow); border-color: var(--yellow); color: var(--ink); }
.btn.yellow:hover { background: #efc650; }
.btn.sm { height: 38px; padding: 0 16px; font-size: 13px; }

/* cards */
.d-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03);
}

/* top breadcrumb bar */
.r-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}
.r-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
  transition: border-color .15s, background .15s;
}
.r-back:hover { border-color: var(--ink); background: #FBFAF7; }
.r-meta-group { display: flex; align-items: center; gap: 10px; }
.r-sid {
  font-size: 12px;
  color: var(--muted);
  background: #fff;
  border: 1px solid var(--line);
  padding: 6px 12px;
  border-radius: 999px;
}
.r-sid code { font-family: monospace; font-weight: 600; color: var(--ink); }

/* header metadata banner */
.r-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}
.r-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.r-pill {
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
.r-pill.gold {
  background: rgba(244,207,99,.35);
  border: 1px solid rgba(244,207,99,.8);
  color: var(--ink);
}
.r-pill.dark { background: var(--ink); color: var(--bg); }
.r-date { font-size: 13px; color: var(--muted); margin-left: 4px; }
.r-role {
  margin: 0;
  font-size: 32px;
  letter-spacing: -.02em;
  line-height: 1.1;
  font-weight: 700;
  color: var(--ink);
}
.r-sub { margin: 6px 0 0; color: var(--muted); font-size: 15px; }

/* hero score card */
.r-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
  padding: 30px;
}
.r-score-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
}
.r-big-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.r-big-score strong {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -.03em;
  line-height: 1;
  color: var(--ink);
}
.r-big-score span {
  font-size: 20px;
  font-weight: 700;
  color: var(--muted);
}
.r-tier-info { display: flex; flex-direction: column; gap: 6px; }
.r-tier-pill {
  display: inline-block;
  width: fit-content;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 999px;
  letter-spacing: .02em;
}
.r-tier-pill.strong {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green-line);
}
.r-tier-pill.hire {
  background: rgba(244,207,99,.4);
  color: #854d0e;
  border: 1px solid rgba(244,207,99,.85);
}
.r-tier-pill.needs {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid var(--red-line);
}
.r-tier-hint { font-size: 12px; color: var(--muted); }

/* metrics grid */
.r-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.r-metric-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #FBFAF7;
  border: 1px solid var(--line);
  border-radius: 12px;
}
.r-metric-box small {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}
.r-metric-box strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* section headers */
.r-sec-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.r-tile {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(244,207,99,.35);
  color: var(--ink);
  display: grid;
  place-items: center;
  flex: none;
}
.r-tile.orange { background: rgba(255,90,31,.12); color: var(--orange); }
.r-tile.green { background: #dcfce7; color: var(--green); }
.r-sec-title h2 { margin: 0; font-size: 20px; letter-spacing: -.01em; color: var(--ink); }
.r-sec-title p { margin: 3px 0 0; color: var(--muted); font-size: 14px; }

/* summary text */
.r-summary-box {
  background: #FBFAF7;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px 24px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0;
}

/* comparison grid */
.r-comp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}
.r-comp-card {
  border-radius: 18px;
  padding: 24px;
  background: #fff;
  border: 1px solid var(--line);
}
.r-comp-card.strengths {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.05);
}
.r-comp-card.weaknesses {
  border-color: rgba(255, 90, 31, 0.35);
  box-shadow: 0 2px 6px rgba(255, 90, 31, 0.05);
}
.r-comp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.r-comp-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}
.r-comp-card.strengths .r-comp-head h3 { color: var(--green); }
.r-comp-card.weaknesses .r-comp-head h3 { color: #c2410c; }
.r-points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.r-point-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.55;
}
.r-comp-card.strengths .r-point-item {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #14532d;
}
.r-comp-card.weaknesses .r-point-item {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #7c2d12;
}
.r-point-icon { flex: none; margin-top: 2px; }

/* topics */
.r-topics-list { display: flex; flex-direction: column; gap: 12px; }
.r-topic-row {
  background: #FBFAF7;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.r-topic-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.r-topic-name { font-size: 15px; font-weight: 700; color: var(--ink); }
.r-topic-badge {
  background: var(--yellow);
  color: var(--ink);
  font-weight: 700;
  font-size: 13px;
  padding: 3px 12px;
  border-radius: 999px;
  font-family: inherit;
}
.r-track {
  height: 8px;
  background: #E3DED2;
  border-radius: 999px;
  overflow: hidden;
  width: 100%;
}
.r-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ink);
  transition: width .4s ease;
}
.r-topic-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}
.r-topic-bottom b { text-transform: uppercase; font-size: 11px; letter-spacing: .04em; }

/* strategic roadmap CTA banner */
.r-cta {
  background: var(--ink);
  color: var(--bg);
  border-radius: 18px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}
.r-cta-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 280px;
}
.r-cta-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(244,207,99,.25);
  color: var(--yellow);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 8px;
}
.r-cta-left h2 {
  margin: 0 0 8px;
  font-size: 21px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -.01em;
}
.r-cta-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #b9b4a8;
}
.r-cta-act {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.r-cta-act .btn.yellow {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  box-shadow: 0 4px 14px rgba(244,207,99,.25);
}
.r-cta-hint {
  font-size: 12px;
  color: #8a857b;
  max-width: 260px;
}

/* question accordions */
.r-accordions { display: flex; flex-direction: column; gap: 12px; }
.r-acc-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color .15s;
}
.r-acc-card:hover { border-color: rgba(10,10,10,.3); }
.r-acc-head {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 14px;
  background: #fff;
  transition: background .15s;
}
.r-acc-head:hover { background: #FBFAF7; }
.r-acc-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.r-q-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--bg);
  background: var(--ink);
  padding: 4px 10px;
  border-radius: 8px;
  flex: none;
}
.r-q-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.r-q-topic {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--muted);
  letter-spacing: .04em;
}
.r-q-snippet {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.r-acc-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}
.r-score-tag {
  background: var(--yellow);
  color: var(--ink);
  font-weight: 700;
  font-size: 13px;
  padding: 3px 12px;
  border-radius: 999px;
}
.r-chevron {
  color: var(--muted);
  display: grid;
  place-items: center;
}
.r-acc-body {
  padding: 20px;
  background: #FBFAF7;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.r-resp-box {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.r-resp-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--muted);
}
.r-resp-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink);
  white-space: pre-wrap;
}
.r-resp-time {
  font-size: 12px;
  color: var(--muted);
  font-family: monospace;
  margin-top: 4px;
}
.r-fb-box {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.r-fb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.r-fb-col { display: flex; flex-direction: column; gap: 4px; }
.r-fb-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--ink);
}
.r-fb-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--muted);
}
.r-impr-box {
  background: rgba(244,207,99,.15);
  border: 1px solid rgba(244,207,99,.5);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.r-impr-box ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink);
}

/* center states */
.r-center {
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 80vh;
}
.r-spinner {
  width: 38px;
  height: 38px;
  border: 3px solid var(--line);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: rspin .8s linear infinite;
}
@keyframes rspin { to { transform: rotate(360deg); } }

/* print rules */
@media print {
  .dash { display: block; background: #fff; color: #000; }
  .d-side, .r-bar, .r-cta-act, .btn { display: none !important; }
  .d-main { max-width: 100%; padding: 0; margin: 0; }
  .d-card, .r-acc-card, .r-comp-card { border: 1px solid #ccc; box-shadow: none !important; page-break-inside: avoid; }
}

/* responsive */
@media (max-width: 1000px) {
  .r-metrics { grid-template-columns: repeat(2, 1fr); }
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
@media (max-width: 600px) {
  .r-metrics { grid-template-columns: 1fr; }
  .r-hero { flex-direction: column; align-items: flex-start; }
  .r-score-wrap { flex-direction: column; align-items: flex-start; gap: 12px; }
  .r-role { font-size: 26px; }
}
`;

// ── Icons ──────────────────────────────────────────────────────────────────────
const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  award: 'M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M8.5 14 7 22l5-3 5 3-1.5-8',
  spark: 'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',
  alert: 'M12 2 1 21h22L12 2zm0 7v5m0 3v1',
  arrowLeft: 'M19 12H5 M12 19l-7-7 7-7',
  arrowRight: 'M5 12h14 M12 5l7 7-7 7',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M18 15l-6-6-6 6',
  print: 'M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const getScoreTier = (score) => {
  if (score >= 8.5) return { label: 'Strong Hire', className: 'strong' };
  if (score >= 7.0) return { label: 'Hire', className: 'hire' };
  return { label: 'Needs Preparation', className: 'needs' };
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rawUser = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({ 0: true });

  const user = {
    name: rawUser?.name || 'Candidate',
    email: rawUser?.email || '',
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    let mounted = true;

    const fetchReport = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const res = await reportService.getById(id);
        if (!mounted) return;
        const data = res.data?.data || res.data;
        setReport(data);
        setExpandedQuestions({ 0: true });
      } catch (err) {
        if (!mounted) return;
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to load interview report.';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (loading) {
    return (
      <div className="dash" style={{ display: 'block' }}>
        <style>{STYLES}</style>
        <div className="r-center">
          <div className="r-spinner" />
          <p style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 500, margin: 0 }}>
            Loading interview performance analytics…
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="dash" style={{ display: 'block' }}>
        <style>{STYLES}</style>
        <div className="r-center">
          <div className="d-card" style={{ maxWidth: 460, width: '100%', textAlign: 'center', padding: '36px 24px' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>⚠️</span>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Report Unavailable</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              {error || 'Could not find the requested interview report.'}
            </p>
            <button type="button" className="btn dark" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const session = report.session || {};
  const metrics = report.metrics || {};
  const topicScores = Array.isArray(report.topicScores) ? report.topicScores : [];
  const questions = session.questions || [];
  const scoreTier = getScoreTier(report.overallScore);
  const shortSessionId = session.id || id || '';

  return (
    <div className="dash">
      <style>{STYLES}</style>

      {/* ── Sidebar (Consistent with Dashboard, Resume, Setup, History) ─────── */}
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

      {/* ── Main Performance Analysis Content ──────────────────────────────── */}
      <main className="d-main">

        {/* ── Top Bar / Breadcrumbs ─────────────────────────────────────────── */}
        <div className="r-bar">
          <Link to="/interview/history" className="r-back" title="Return to History">
            <Icon name="arrowLeft" />
            <span>Back to History</span>
          </Link>
          <div className="r-meta-group">
            <span className="r-sid">
              Session: <code>{shortSessionId.slice(0, 10)}…</code>
            </span>
            <button
              type="button"
              className="btn sm"
              onClick={() => window.print()}
              title="Print or save as PDF"
            >
              <Icon name="print" />
              <span>Export / Print</span>
            </button>
          </div>
        </div>

        {/* ── Header Metadata Banner ────────────────────────────────────────── */}
        <section className="d-card r-head">
          <div>
            <div className="r-badges">
              <span className="r-pill dark">
                {session.type ? session.type.toUpperCase() : 'TECHNICAL'} INTERVIEW
              </span>
              <span className="r-pill">
                {session.difficulty ? session.difficulty.toUpperCase() : 'MEDIUM'} DIFFICULTY
              </span>
              <span className="r-date">
                {new Date(report.generatedAt || Date.now()).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="r-role">{session.roleTarget || 'Technical Role'}</h1>
            <p className="r-sub">
              Final Performance Evaluation &amp; Comprehensive Skill Gap Diagnosis
            </p>
          </div>

          <span className="r-pill gold">
            <Icon name="spark" />
            <span>Evaluated by Google Gemini AI</span>
          </span>
        </section>

        {/* ── Hero Performance Score & Metrics Card ─────────────────────────── */}
        <section className="d-card r-hero">
          <div className="r-score-wrap">
            <div className="r-big-score">
              <strong>{report.overallScore}</strong>
              <span>/ 10</span>
            </div>
            <div className="r-tier-info">
              <span className={`r-tier-pill ${scoreTier.className}`}>
                {scoreTier.label}
              </span>
              <span className="r-tier-hint">Calibrated hiring bar rating</span>
            </div>
          </div>

          <div className="r-metrics">
            <div className="r-metric-box">
              <small>Total Questions</small>
              <strong>{metrics.totalQuestions || questions.length || 0}</strong>
            </div>
            <div className="r-metric-box">
              <small>Answered</small>
              <strong>{metrics.answeredCount || questions.length || 0}</strong>
            </div>
            <div className="r-metric-box">
              <small>Completion</small>
              <strong style={{ color: 'var(--green)' }}>{metrics.completionRate || 100}%</strong>
            </div>
            <div className="r-metric-box">
              <small>Total Duration</small>
              <strong>
                <Icon name="clock" />
                <span>{formatDuration(metrics.totalDuration || session.totalDuration)}</span>
              </strong>
            </div>
          </div>
        </section>

        {/* ── AI Executive Summary ──────────────────────────────────────────── */}
        <section className="d-card">
          <div className="r-sec-title">
            <div className="r-tile">
              <Icon name="award" />
            </div>
            <div>
              <h2>Executive Performance Summary</h2>
              <p>Holistic assessment of technical execution and problem-solving delivery</p>
            </div>
          </div>
          <p className="r-summary-box">{report.summary}</p>
        </section>

        {/* ── Strengths & Weaknesses Comparison Grid ────────────────────────── */}
        <div className="r-comp-grid">
          {/* Demonstrated Strengths */}
          <div className="r-comp-card strengths">
            <div className="r-comp-head">
              <div className="r-tile green" style={{ width: 32, height: 32, borderRadius: 8 }}>
                <Icon name="check" />
              </div>
              <h3>Demonstrated Strengths</h3>
            </div>
            <ul className="r-points">
              {report.strengths && report.strengths.map((item, idx) => (
                <li key={idx} className="r-point-item">
                  <span className="r-point-icon">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Areas for Improvement */}
          <div className="r-comp-card weaknesses">
            <div className="r-comp-head">
              <div className="r-tile orange" style={{ width: 32, height: 32, borderRadius: 8 }}>
                <Icon name="alert" />
              </div>
              <h3>Key Areas for Improvement</h3>
            </div>
            <ul className="r-points">
              {report.weaknesses && report.weaknesses.map((item, idx) => (
                <li key={idx} className="r-point-item">
                  <span className="r-point-icon">▲</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Topic-by-Topic Performance Breakdown ──────────────────────────── */}
        {topicScores.length > 0 && (
          <section className="d-card">
            <div className="r-sec-title">
              <div className="r-tile">
                <Icon name="award" />
              </div>
              <div>
                <h2>Topic Performance Breakdown</h2>
                <p>Deterministic evaluation by domain and targeted competencies</p>
              </div>
            </div>

            <div className="r-topics-list">
              {topicScores.map((t, idx) => {
                const percent = Math.min(Math.round(((t.score || 0) / 10) * 100), 100);
                return (
                  <div key={idx} className="r-topic-row">
                    <div className="r-topic-top">
                      <span className="r-topic-name">{t.topic}</span>
                      <span className="r-topic-badge">{t.score} / 10</span>
                    </div>
                    <div className="r-track">
                      <div className="r-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="r-topic-bottom">
                      <b>{(t.difficulty || 'medium').toUpperCase()} DIFFICULTY</b>
                      {t.timeTaken != null && (
                        <span>Time spent: {formatDuration(t.timeTaken)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Skill Gap & Learning Roadmap CTA (Day 7 Bridge) ──────────────── */}
        <section className="r-cta">
          <div className="r-cta-left">
            <div className="r-tile orange" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Icon name="compass" />
            </div>
            <div>
              <span className="r-cta-badge">Skill Gap Bridge · Personalized Roadmap</span>
              <h2>Strategic Recommendations &amp; Next Steps</h2>
              <p className="r-cta-text">{report.recommendation}</p>
            </div>
          </div>

          <div className="r-cta-act">
            <button
              type="button"
              className="btn yellow"
              onClick={() => navigate(`/roadmap/${report.id}`)}
            >
              <span>Generate Personalized Roadmap</span>
              <Icon name="arrowRight" />
            </button>
            <span className="r-cta-hint">
              Tailors interactive learning modules directly to your diagnosed weaknesses
            </span>
          </div>
        </section>

        {/* ── Detailed Question & Answer Transcript Accordions ─────────────── */}
        {questions.length > 0 && (
          <section className="d-card">
            <div className="r-sec-title">
              <div className="r-tile">
                <Icon name="award" />
              </div>
              <div>
                <h2>Full Interview Transcript &amp; Evaluations</h2>
                <p>Review question-by-question candidate responses, scores, and Gemini critiques</p>
              </div>
            </div>

            <div className="r-accordions">
              {questions.map((q, idx) => {
                const isExpanded = expandedQuestions[idx];
                const feedback = q.answer?.feedback;
                const score = feedback?.score;

                return (
                  <div key={q.id || idx} className="r-acc-card">
                    <div
                      className="r-acc-head"
                      onClick={() => toggleQuestion(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleQuestion(idx);
                        }
                      }}
                    >
                      <div className="r-acc-left">
                        <span className="r-q-num">Q{idx + 1}</span>
                        <div className="r-q-info">
                          <span className="r-q-topic">{q.topic || 'General'}</span>
                          <span className="r-q-snippet">{q.questionText}</span>
                        </div>
                      </div>

                      <div className="r-acc-right">
                        {score != null && (
                          <span className="r-score-tag">{score} / 10</span>
                        )}
                        <span className="r-chevron">
                          <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} />
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="r-acc-body">
                        {/* Candidate Answer Box */}
                        <div className="r-resp-box">
                          <span className="r-resp-label">Candidate Response</span>
                          <p className="r-resp-text">
                            {q.answer?.answerText || 'No response recorded.'}
                          </p>
                          {q.answer?.timeTaken != null && (
                            <span className="r-resp-time">
                              Time taken: {formatDuration(q.answer.timeTaken)}
                            </span>
                          )}
                        </div>

                        {/* AI Feedback Box */}
                        {feedback && (
                          <div className="r-fb-box">
                            <div className="r-fb-grid">
                              <div className="r-fb-col">
                                <span className="r-fb-title">Technical Accuracy &amp; Depth</span>
                                <p className="r-fb-desc">{feedback.correctness}</p>
                              </div>
                              <div className="r-fb-col">
                                <span className="r-fb-title">Communication &amp; Clarity</span>
                                <p className="r-fb-desc">{feedback.communication}</p>
                              </div>
                            </div>

                            {feedback.improvements && feedback.improvements.length > 0 && (
                              <div className="r-impr-box">
                                <span className="r-fb-title">Key Recommendations for 10/10:</span>
                                <ul>
                                  {feedback.improvements.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
