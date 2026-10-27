// src/pages/auth/RegisterPage.jsx
// Updated UI based on design specifications with warm cream aesthetic.
// Preserves existing authService.register, useAuthStore, and dashboard redirect flow.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
.auth-hint{display:block;margin-top:4px;font-size:12px;color:var(--muted)}

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

export default function RegisterPage({ loginHref = '/login', homeHref = '/' }) {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const toggle = (key) => setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const trimmedName = (formData.get('fullName') ?? form.fullName ?? '').toString().trim();
    const trimmedEmail = (formData.get('email') ?? form.email ?? '').toString().trim().toLowerCase();
    const password = (formData.get('password') ?? form.password ?? '').toString();
    const confirm = (formData.get('confirm') ?? form.confirm ?? '').toString();

    if (!trimmedName) return setError('Please enter your full name.');
    if (trimmedName.length < 2) return setError('Name must be at least 2 characters.');
    if (!trimmedEmail) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError('Please enter a valid email address (e.g. name@example.com).');
    if (!password) return setError('Please enter a password.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password.length > 64) return setError('Password must not exceed 64 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    try {
      setLoading(true);
      const res = await authService.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });
      const { token, user } = res.data?.data || res.data;
      if (!token) throw new Error('Registration succeeded but no token received.');
      setAuth(token, user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errStatus = err?.response?.status;
      const errData = err?.response?.data?.error;
      const detailMsg = errData?.details && Array.isArray(errData.details) && errData.details.length > 0
        ? errData.details.map((d) => d.message).filter(Boolean).join('. ')
        : null;

      let fallbackMsg = 'Could not create your account. Please try again.';
      if (errStatus === 502 || errStatus === 503 || errStatus === 504 || err?.message?.includes('502')) {
        fallbackMsg = 'The server is waking up from idle. Please click Create account again in a few seconds.';
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

  const passwordField = (key, id, label, placeholder, hint) => (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input
          id={id}
          name={key}
          type={show[key] ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={key === 'password' ? 'new-password' : 'new-password'}
          value={form[key]}
          onChange={set(key)}
        />
        <button
          type="button"
          onClick={() => toggle(key)}
          aria-label={show[key] ? 'Hide password' : 'Show password'}
        >
          {show[key] ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && <span className="auth-hint">{hint}</span>}
    </>
  );

  return (
    <div className="auth">
      <style>{STYLES}</style>
      <main className="auth-card">
        <Logo to={homeHref} className="auth-logo" />

        <h1>Create your account</h1>
        <p className="auth-sub">Start preparing for your next interview today.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="reg-fullName">Full name</label>
          <input
            id="reg-fullName"
            name="fullName"
            placeholder="Alex Johnson"
            autoComplete="name"
            value={form.fullName}
            onChange={set('fullName')}
          />

          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
          />

          {passwordField('password', 'reg-password', 'Password', 'Min. 8 characters', 'Must be at least 8 characters')}
          {passwordField('confirm', 'reg-confirm', 'Confirm password', 'Repeat your password')}

          {error && <p id="register-error-alert" className="auth-error" role="alert">{error}</p>}

          <button id="register-submit-btn" type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot">Already have an account? <Link to={loginHref}>Sign in</Link></p>
      </main>
    </div>
  );
}
