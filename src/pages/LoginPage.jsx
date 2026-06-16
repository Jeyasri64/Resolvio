import BrandLogo from "../components/BrandLogo.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { post, setToken } from '../utils/apiClient.js';

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('Student');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = form.get('identifier');
    const password = form.get('password');
    try {
      const normalizedRole = role.toLowerCase();
      const res = await post('/auth/login', { identifier, password, role: normalizedRole });
      setToken(res.token);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      const target = res?.user?.role?.toLowerCase() === 'admin'
        ? '/admin-dashboard'
        : '/student-dashboard';
      navigate(target);
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel reveal">
        <Link
          className="brand login-brand"
          to="/"
          aria-label="Resolvio home"
        >
          <BrandLogo />
          <span>Resolvio</span>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Welcome Back</p>
          <h1>Sign in to your complaint dashboard.</h1>
          <p>
            Access complaints, status updates, reports, and feedback from one
            secure workspace.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Username or Email
            <input
              type="text"
              name="identifier"
              placeholder="Enter username or email"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option>Student</option>
              <option>Admin</option>
            </select>
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="form-row">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#forgot-password">Forgot Password?</a>
          </div>

          <button className="button primary full" type="submit">
            Login
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </section>

      <section
        className="login-aside reveal delay-1"
        aria-label="Resolvio highlights"
      >
        <div className="aside-card">
          <span className="status-pill">Live Workflow</span>

          <h2>Track every issue from request to resolution.</h2>

          <div className="mini-timeline">
            <span>Complaint Submitted</span>
            <span>Assigned to Admin</span>
            <span>Issue Resolved</span>
            <span>Feedback Collected</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
