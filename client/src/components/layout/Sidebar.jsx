// src/components/layout/Sidebar.jsx
// Premium persistent sidebar navigation for authenticated pages.

import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Logo from '../Logo';

// ── Icons ──────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);



const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_LINKS = [
  { to: '/dashboard',          label: 'Dashboard',  Icon: HomeIcon,    exact: true },
  { to: '/resume',             label: 'Resume',     Icon: FileIcon,    exact: false },
  { to: '/interview/setup',    label: 'New Interview', Icon: MicIcon,  exact: false },
  { to: '/interview/history',  label: 'History',    Icon: ClockIcon,   exact: false },
];

export const Sidebar = () => {
  const navigate  = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user      = useAuthStore((s) => s.user);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <aside style={styles.aside}>
      {/* Logo */}
      <Logo to="/dashboard" style={{ padding: '0 6px 24px', display: 'flex' }} />

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_LINKS.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ ...styles.linkIcon, ...(isActive ? styles.linkIconActive : {}) }}>
                  <Icon />
                </span>
                <span>{label}</span>
                {isActive && <span style={styles.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User + Logout */}
      <div style={styles.footer}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name || 'Candidate'}</p>
            <p style={styles.userEmail}>{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">
          <LogOutIcon />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

// ── Mobile bottom tab bar ──────────────────────────────────────────────────────
export const BottomNav = () => (
  <nav style={styles.bottomNav}>
    {NAV_LINKS.map(({ to, label, Icon, exact }) => (
      <NavLink
        key={to}
        to={to}
        end={exact}
        style={({ isActive }) => ({
          ...styles.bottomLink,
          ...(isActive ? styles.bottomLinkActive : {}),
        })}
      >
        <Icon />
        <span style={{ fontSize: '10px', marginTop: '2px' }}>{label}</span>
      </NavLink>
    ))}
  </nav>
);

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = {
  aside: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '220px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '0 20px 24px 20px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '8px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  logoAI: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
    padding: '2px 6px',
    borderRadius: 'var(--r-full)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px 12px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: 'var(--r-md)',
    fontSize: '13.5px',
    fontWeight: 500,
    color: 'var(--text-2)',
    transition: 'background var(--t-fast), color var(--t-fast)',
    textDecoration: 'none',
    position: 'relative',
  },
  linkActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-3)',
    transition: 'color var(--t-fast)',
  },
  linkIconActive: {
    color: 'var(--accent)',
  },
  activeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: 'var(--accent)',
    marginLeft: 'auto',
  },
  footer: {
    padding: '16px 16px 4px 16px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-glow)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: 'var(--text-3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: 'var(--r-md)',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-3)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background var(--t-fast), color var(--t-fast), border-color var(--t-fast)',
    width: '100%',
  },
  // Mobile bottom nav
  bottomNav: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    zIndex: 100,
    padding: '0 8px',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 12px',
    borderRadius: 'var(--r-md)',
    color: 'var(--text-3)',
    fontSize: '11px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color var(--t-fast)',
  },
  bottomLinkActive: {
    color: 'var(--accent)',
  },
};

export default Sidebar;
