// src/pages/auth/LoginPage.jsx
// Updated UI based on design specifications with warm cream aesthetic.
// Preserves existing authService.login, useAuthStore, redirect handling, and demo account flow.

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import Logo from '../../components/Logo';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap');

.auth{--bg:#F2EEE6;--card:#fff;--ink:#0A0A0A;--muted:#6B675F;--line:#E3DED2;--yellow:#F4CF63;--err:#B3323F;
  min-height:100vh;display:grid;place-items:center;padding:32px 16px;background:var(--bg);color:var(--ink);
  font-family:'Space Grotesk',system-ui,sans-serif;box-sizing:border-box}
.auth *,.auth *::before,.auth *::after{box-sizing:inherit}

.auth-card{width:100%;max-width:420px;background:var(--card);border:1px solid var(--line);border-radius:20px;
  padding:36px clamp(22px,5vw,36px);box-shadow:0 1px 2px rgba(0,0,0,.04),0 16px 40px rgba(0,0,0,.06)}

.auth-logo{display:inline-flex}

.auth h1{margin:28px 0 6px;font-size:26px;line-height:1.15;letter-spacing:-.02em;font-weight:700}
.auth-sub{margin:0 0 24px;color:var(--muted);font-size:15px}

.auth label{display:block;margin:16px 0 6px;font-size:13px;font-weight:500}
.auth-row{display:flex;justify-content:space-between;align-items:baseline}
.auth-row a{font-size:13px;color:var(--muted);text-decoration:none}.auth-row a:hover{color:var(--ink)}
.auth input{width:100%;height:46px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:#FBFAF7;
  font:inherit;font-size:15px;color:var(--ink);transition:border-color .15s,box-shadow .15s,background .15s}
.auth input::placeholder{color:#A39E93}
.auth input:focus{outline:none;border-color:var(--ink);background:#fff;box-shadow:0 0 0 4px rgba(244,207,99,.45)}

.pw{position:relative}.pw input{padding-right:64px}
.pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;font:inherit;font-size:13px;
  font-weight:500;color:var(--muted);padding:8px;cursor:pointer;border-radius:8px}
.pw button:hover{color:var(--ink)}

.auth-error{margin:16px 0 0;padding:10px 12px;border-radius:10px;background:#FBEBED;color:var(--err);font-size:13px}

.auth-btn{width:100%;height:48px;margin-top:24px;border:0;border-radius:999px;background:var(--ink);color:var(--bg);
  font:inherit;font-weight:600;font-size:15px;cursor:pointer;transition:background .15s,transform .15s}
.auth-btn:hover:not(:disabled){background:#262626}.auth-btn:active:not(:disabled){transform:scale(.99)}
.auth-btn:disabled{opacity:.6;cursor:not-allowed}

.auth-foot{margin:24px 0 0;text-align:center;font-size:14px;color:var(--muted)}
.auth-foot a{color:var(--ink);font-weight:500;text-decoration:underline;text-decoration-color:var(--yellow);text-decoration-thickness:2px;text-underline-offset:3px}

.auth :focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.auth input:focus-visible{outline:none}
@media (prefers-reduced-motion:reduce){.auth *{transition:none!important}}

/* "or" divider + secondary (demo) button */
.auth-or{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--muted);font-size:13px}
.auth-or::before,.auth-or::after{content:"";flex:1;height:1px;background:var(--line)}
.auth-btn.alt{margin-top:0;height:46px;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:var(--ink);border:1px solid var(--line);font-weight:500}
.auth-btn.alt:hover:not(:disabled){background:#FBFAF7;border-color:var(--ink)}
.auth-btn.alt svg{width:16px;height:16px}
`;

export default function LoginPage({
  registerHref = '/register',
  forgotHref = '/forgot-password',
  homeHref = '/',
}) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const setAuth   = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const trimmedEmail = (formData.get('email') ?? form.email ?? '').toString().trim().toLowerCase();
    const password = (formData.get('password') ?? form.password ?? '').toString();

    if (!trimmedEmail || !password) {
      return setError('Please enter your email and password.');
    }
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email: trimmedEmail, password });
      const { token, user } = res.data?.data || res.data;
      if (!token) throw new Error('No authentication token received.');
      setAuth(token, user);
      const dest = location.state?.from?.pathname || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      const errStatus = err?.response?.status;
      const errData = err?.response?.data?.error;
      const detailMsg = errData?.details && Array.isArray(errData.details) && errData.details.length > 0
        ? errData.details.map((d) => d.message).filter(Boolean).join('. ')
        : null;

      let fallbackMsg = 'Could not sign you in. Please check your credentials.';
      if (errStatus === 502 || errStatus === 503 || errStatus === 504 || err?.message?.includes('502')) {
        fallbackMsg = 'The server is waking up from idle. Please try again in a few seconds.';
      }

      setError(
        detailMsg ||
        errData?.message ||
        err?.response?.data?.message ||
        (err?.message && !err.message.includes('502') ? err.message : null) ||
        fallbackMsg
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setError('');
    setLoading(true);
    try {
      const testEmail = `pilot_${Date.now()}@example.com`;
      const testPass  = 'Password123!';
      const res = await authService.register({ name: 'Demo Candidate', email: testEmail, password: testPass });
      const { token, user } = res.data?.data || res.data;
      if (!token) throw new Error('No authentication token received.');
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not start the demo. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <style>{STYLES}</style>
      <main className="auth-card">
        <Logo to={homeHref} className="auth-logo" />

        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to continue your interview prep.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
          />

          <div className="auth-row">
            <label htmlFor="login-password">Password</label>
            <Link to={forgotHref}>Forgot password?</Link>
          </div>
          <div className="pw">
            <input
              id="login-password"
              name="password"
              type={show ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              value={form.password}
              onChange={set('password')}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p id="login-error-alert" className="auth-error" role="alert">{error}</p>}

          <button id="login-submit-btn" type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-or">or</div>
        <button
          id="quick-demo-login-btn"
          type="button"
          className="auth-btn alt"
          disabled={loading}
          onClick={handleDemo}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
          Create Demo Account &amp; Start
        </button>

        <p className="auth-foot">Don't have an account? <Link to={registerHref}>Create one</Link></p>
      </main>
    </div>
  );
}
