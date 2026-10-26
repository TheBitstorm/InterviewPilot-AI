// src/components/layout/AppLayout.jsx
// Authenticated application shell — sidebar + main content area.
// Wrap every protected page in this instead of duplicating nav per page.

import { useEffect, useState } from 'react';
import { Sidebar, BottomNav } from './Sidebar';

const AppLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={styles.shell}>
      {/* Sidebar — hidden on mobile via CSS */}
      {!isMobile && <Sidebar />}

      {/* Main content */}
      <main style={{ ...styles.main, marginLeft: isMobile ? 0 : '220px' }}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNavStyled />}
    </div>
  );
};

// Inject CSS for bottom nav display on mobile
const BottomNavStyled = () => (
  <nav style={styles.bottomNav}>
    <BottomNav />
  </nav>
);

// The BottomNav itself already has the right styles; we use the exported component directly
// AppLayout just decides when to render it.

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
};

export default AppLayout;
