import { useState } from 'react';
import { forgotPassword } from '../../service/auth';
import AuthBackground from './AuthBackground';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="loginContainer">
        <form className="form_container-forgot" onSubmit={handleSubmit}>
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
          <h2 className="title">Forgot Password</h2>
          <p style={{ textAlign: 'center', marginBottom: '16px', fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#444' }}>
            Enter your email and we'll send you a reset link.
          </p>

          <div className="input_container">
            <label className="input_label" htmlFor="email_field">Email</label>
            <input
              placeholder="name@mail.com"
              name="email"
              type="email"
              className="input_field"
              id="email_field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in_btn" disabled={loading}>
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
          </button>

          {message && <p style={{ color: 'green', marginTop: '10px', fontSize: 'clamp(12px, 2vw, 14px)' }}>✅ {message}</p>}
          {error && <p style={{ color: 'red', marginTop: '10px', fontSize: 'clamp(12px, 2vw, 14px)' }}>❌ {error}</p>}

          <div className="sign-in_footer" style={{ marginTop: '12px' }}>
            <p>Remembered your password?{' '}<a href="/login" className="note">Back to Login</a></p>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgotPasswordPage;