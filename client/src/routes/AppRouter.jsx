// src/routes/AppRouter.jsx
// Central routing definition.
// Authenticated routes are wrapped in AppLayout (sidebar + shell).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import { lazy, Suspense } from 'react';

// ── Pages ──────────────────────────────────────────────────────────────────────
const LandingPage         = lazy(() => import('../pages/LandingPage'));
const LoginPage            = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage         = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage        = lazy(() => import('../pages/DashboardPage'));
const InterviewSetupPage   = lazy(() => import('../pages/interview/InterviewSetupPage'));
const InterviewSessionPage = lazy(() => import('../pages/interview/InterviewSessionPage'));
const InterviewHistoryPage = lazy(() => import('../pages/interview/InterviewHistoryPage'));
const ReportPage           = lazy(() => import('../pages/ReportPage'));
const RoadmapPage          = lazy(() => import('../pages/RoadmapPage'));
const ResumePage           = lazy(() => import('../pages/ResumePage'));

// ── Loading fallback ───────────────────────────────────────────────────────────
const Loader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  }}>
    <div className="spinner" />
  </div>
);

// ── Auth shell (no sidebar) ────────────────────────────────────────────────────
const AuthShell = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

// ── Protected + layout ────────────────────────────────────────────────────────
const App = ({ children }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — with standalone sidebar layout */}
        <Route path="/dashboard"          element={<AuthShell><DashboardPage /></AuthShell>} />
        <Route path="/resume"             element={<AuthShell><ResumePage /></AuthShell>} />
        <Route path="/interview/history"  element={<AuthShell><InterviewHistoryPage /></AuthShell>} />
        <Route path="/report/:id"         element={<AuthShell><ReportPage /></AuthShell>} />
        <Route path="/roadmap/:id"        element={<AuthShell><RoadmapPage /></AuthShell>} />

        {/* Interview pages */}
        <Route path="/interview/setup"       element={<AuthShell><InterviewSetupPage /></AuthShell>} />
        <Route path="/interview/new"         element={<Navigate to="/interview/setup" replace />} />
        <Route path="/interview/:id"         element={<AuthShell><InterviewSessionPage /></AuthShell>} />
        <Route path="/interview/session/:id" element={<AuthShell><InterviewSessionPage /></AuthShell>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
