import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import api from '../api/client';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/auth/login', { username: username.trim(), password });
      if (!data?.token || !data?.user?.role) throw new Error('The server returned an incomplete login response.');
      if (!['TEACHER', 'HOD'].includes(data.user.role)) throw new Error('This account does not have dashboard access.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      toast.success(`Welcome, ${data.user.name}`);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message || (error.code === 'ECONNABORTED' || !error.response ? 'Cannot reach the server. Check that the API is running and try again.' : 'Unable to sign in. Check your credentials and try again.'))
        : error.message || 'Unable to sign in.';
      toast.error(message);
    } finally { setSubmitting(false); }
  };

  return <main className="login-shell">
    <section className="login-aside">
      <div className="brand-mark">CM</div>
      <p className="eyebrow">ACADEMIC PERFORMANCE</p>
      <h1>Every student’s progress, clearly in view.</h1>
      <p className="aside-copy">A focused workspace for teachers and academic leaders to record and review student outcomes.</p>
      <div className="aside-foot"><span className="status-dot" /> Academic workspace</div>
    </section>
    <section className="login-panel">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-heading"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your account</h2><p>Use the username and password provided by your institution.</p></div>
        <label htmlFor="username">Username</label>
        <input id="username" autoComplete="username" autoFocus value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
        <button className="login-submit" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" /> Signing in…</> : 'Sign in'}<span aria-hidden="true">→</span></button>
        <p className="secure-note"><span aria-hidden="true">◆</span> Secure access for authorised staff</p>
      </form>
    </section>
  </main>;
}
