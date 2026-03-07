import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../service/auth';
import AuthBackground from './AuthBackground';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
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
          <h2 className="title">Reset Password</h2>
          <p style={{ textAlign: 'center', marginBottom: '16px', fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#444' }}>
            Enter and confirm your new password.
          </p>

          <div className="input_container">
            <label className="input_label" htmlFor="password_field">New Password</label>
            <input placeholder="New Password" name="password" type="password" className="input_field" id="password_field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="input_container">
            <label className="input_label" htmlFor="confirm_password_field">Confirm Password</label>
            <input placeholder="Confirm Password" name="confirmPassword" type="password" className="input_field" id="confirm_password_field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <button type="submit" className="sign-in_btn" disabled={loading}>
            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
          </button>

          {message && <p style={{ color: 'green', marginTop: '10px', fontSize: 'clamp(12px, 2vw, 14px)' }}>✅ {message}</p>}
          {error && <p style={{ color: 'red', marginTop: '10px', fontSize: 'clamp(12px, 2vw, 14px)' }}>❌ {error}</p>}

          <div className="sign-in_footer" style={{ marginTop: '12px' }}>
            <p><a href="/login" className="note">Back to Login</a></p>
          </div>
        </form>
      </div>
    </>
  );
}

export default ResetPasswordPage;