import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { login as loginService } from '../../service/auth';
import AuthBackground from './AuthBackground';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginService({ email, password });
      const userWithOnboarding = {
        ...res.data.user,
        hasCompletedOnboarding: res.data.user.hasCompletedOnboarding ?? false,
      };
      login(userWithOnboarding, res.data.token);
      navigate(userWithOnboarding.role === 'admin' ? '/admin' : '/select-profile');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="loginContainer">
        <form className="form_container" onSubmit={handleSubmit}>
        <div className="auth-brand-title">
            <span style={{ color: '#e53935' }}>L</span>
            <span style={{ color: '#43a047' }}>i</span>
            <span style={{ color: '#1e88e5' }}>t</span>
            <span style={{ color: '#fb8c00' }}>t</span>
            <span style={{ color: '#8e24aa' }}>l</span>
            <span style={{ color: '#fdd835', WebkitTextStroke: '1px #999' }}>e</span>
            <span>&nbsp;</span>
            <span style={{ color: '#3949ab' }}>C</span>
            <span style={{ color: '#43a047' }}>o</span>
            <span style={{ color: '#f4511e' }}>d</span>
            <span style={{ color: '#1e88e5' }}>e</span>
            <span style={{ color: '#8e24aa' }}>r</span>
            <span style={{ color: '#f4b400' }}>s</span>
          </div>
          <div class="divider"></div>
          <h2 className="title">Login</h2>

          {error && (
            <div className="alert alert-danger text-center py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          <div className="input_container">
            <label className="input_label" htmlFor="email_field">Email</label>
            <input
              id="email_field"
              type="email"
              name="email"
              placeholder="name@mail.com"
              className="input_field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input_container">
            <label className="input_label" htmlFor="password_field">Password</label>
            <input
              id="password_field"
              type="password"
              name="password"
              placeholder="Password"
              className="input_field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <p style={{ textAlign: 'right', fontSize: 'clamp(12px, 2vw, 14px)', marginBottom: '4px' }}>
            <a href="/forgot-password" className="note">Forgot Password?</a>
          </p>

          <button type="submit" className="sign-in_btn" disabled={loading}>
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>

          <div className="sign-in_footer">
            <p>Don't have an account?{' '}<a href="/register" className="note">Register</a></p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;