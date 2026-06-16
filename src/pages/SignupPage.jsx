import BrandLogo from '../components/BrandLogo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { post, setToken } from '../utils/apiClient.js';

function SignupPage() {
  const [role, setRole] = useState('Student');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = form.get('name');
    const email = form.get('email');
    const registrationId = form.get('registrationId');
    const roomNumber = form.get('roomNumber');
    const password = form.get('password');
    const normalizedRole = role.toLowerCase();

    try {
      const payload = {
        fullName,
        email,
        password,
      };

      if (normalizedRole === 'student') {
        payload.rollNumber = registrationId;
        payload.roomNumber = roomNumber ? Number(roomNumber) : roomNumber;
      }

      const res = await post(
        normalizedRole === 'admin' ? '/auth/admin/register' : '/auth/register',
        payload
      );
      setToken(res.token);
      const target = normalizedRole === 'admin' ? '/admin-dashboard' : '/student-dashboard';
      navigate(target);
    } catch (err) {
      alert(err.message || 'Signup failed');
    }
  };

  return (
    <main className="login-page signup-page">
      <section className="login-panel reveal">
        <Link className="brand login-brand" to="/" aria-label="Resolvio home">
          <BrandLogo />
          <span>Resolvio</span>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Create account</p>
          <h1>Start managing hostel complaints with one clear workspace.</h1>
          <p>Register your campus profile to submit, track, and review complaint updates securely.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input type="text" name="name" placeholder="Enter your name" autoComplete="name" />
          </label>

          <label>
            Email address
            <input type="email" name="email" placeholder="student@college.edu" autoComplete="email" />
          </label>

          <div className="form-grid">
            <label>
              Registration ID
              <input type="text" name="registrationId" placeholder="22CS101" autoComplete="off" />
            </label>

            <label>
              Role
              <select
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option>Student</option>
                <option>Admin</option>
              </select>
            </label>
          </div>

            {role === 'Student' && (
              <div className="form-grid">
                <label>
                  Hostel block
                  <input type="text" name="hostelBlock" placeholder="Block A" autoComplete="organization" />
                </label>

                <label>
                  Room number
                  <input type="text" name="roomNumber" placeholder="204" autoComplete="off" />
                </label>
              </div>
            )}

          <label>
            Password
            <input type="password" name="password" placeholder="Create password" autoComplete="new-password" />
          </label>

          <label className="remember terms-row">
            <input type="checkbox" required />
            I agree to receive complaint status updates from Resolvio
          </label>

          <button className="button primary full" type="submit">
            Create account
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>

      <section className="login-aside reveal delay-1" aria-label="Signup benefits">
        <div className="aside-card signup-aside">
          <span className="status-pill">Student-ready access</span>
          <h2>Bring hostel reports, assignments, and updates into one accountable flow.</h2>
          <div className="mini-timeline">
            <span>Register with campus details</span>
            <span>Submit hostel complaints faster</span>
            <span>Receive transparent status updates</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
