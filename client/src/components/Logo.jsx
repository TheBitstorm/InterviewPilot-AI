// src/components/Logo.jsx
// Standardized reusable InterviewPilot AI logo component.
// Enforces exact specifications across desktop, tablet, and mobile:
// - Icon: 40px x 40px (flex: none)
// - Text: 20px, uppercase, Anton font, 'AI' in red (#EC4F5F)
// - Gap: 10px, white-space: nowrap, no shrinking

import React from 'react';
import { Link } from 'react-router-dom';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');

.ip-logo {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  text-decoration: none !important;
  color: var(--ink, #0A0A0A) !important;
  font-family: 'Anton', Impact, sans-serif !important;
  font-size: 20px !important;
  line-height: 1 !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  flex: none !important;
  transition: opacity .15s ease;
}

.ip-logo:hover {
  opacity: 0.92;
}

.ip-logo svg {
  width: 40px !important;
  height: 40px !important;
  flex: none !important;
  display: block !important;
}

.ip-logo em,
.ip-logo b {
  font-style: normal !important;
  font-weight: inherit !important;
  color: #EC4F5F !important;
}
`;

export default function Logo({
  to,
  href,
  className = '',
  style = {},
  onClick,
}) {
  const content = (
    <>
      <style>{STYLES}</style>
      <svg
        viewBox="0 0 44 44"
        aria-hidden="true"
        style={{ width: '40px', height: '40px', flex: 'none' }}
      >
        <rect x="3" y="3" width="38" height="38" rx="11" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="3" />
        <line x1="22" y1="3" x2="22" y2="9" stroke="#0A0A0A" strokeWidth="3" />
        <circle cx="22" cy="5" r="3.5" fill="#EC4F5F" stroke="#0A0A0A" strokeWidth="2" />
        <rect x="8" y="12" width="28" height="22" rx="9" fill="#0A0A0A" />
        <path
          d="M14 24 Q17 19 20 24 M24 24 Q27 19 30 24"
          fill="none"
          stroke="#F2EEE6"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="12.5" cy="29" r="1.8" fill="#F4CF63" />
        <circle cx="31.5" cy="29" r="1.8" fill="#F4CF63" />
      </svg>
      <span>
        InterviewPilot <em>AI</em>
      </span>
    </>
  );

  const combinedClassName = `ip-logo ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClassName} style={style} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClassName} style={style} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <div className={combinedClassName} style={style} onClick={onClick}>
      {content}
    </div>
  );
}
