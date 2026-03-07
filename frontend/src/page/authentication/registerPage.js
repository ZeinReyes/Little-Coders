import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../service/auth';
import AuthBackground from './AuthBackground';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return; }
    if (password.length < 6) { setErrorMessage('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await registerService({ name, email, password });
      setSuccessMessage(res.data?.message || 'Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="loginContainer">
        {successMessage ? (
          <div className="form_container-register" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(2rem, 7vw, 3rem)', marginBottom: '0.75rem' }}>📧</div>
            <h2 className="title">Check your email!</h2>
            <p style={{ color: '#555', marginBottom: '1rem', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>{successMessage}</p>
            <p style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: '#888' }}>
              Didn't receive it?{' '}<a href="/register" className="note">Try registering again</a>
            </p>
            <button className="sign-in_btn" style={{ marginTop: '16px' }} onClick={() => navigate('/login')}>
              <span>Go to Login</span>
            </button>
          </div>
        ) : (
          <form className="form_container-register" onSubmit={handleSubmit}>
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
            <h2 className="title">Create an Account</h2>

            {errorMessage && (
              <div className="alert alert-danger text-center py-2 mb-3" role="alert">{errorMessage}</div>
            )}

            <div className="input_container">
              <label className="input_label" htmlFor="name_field">Name</label>
              <input placeholder="Your name" name="name" type="text" className="input_field" id="name_field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="input_container">
              <label className="input_label" htmlFor="email_field">Email</label>
              <input placeholder="name@mail.com" name="email" type="email" className="input_field" id="email_field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input_container">
              <label className="input_label" htmlFor="password_field">Password</label>
              <input placeholder="Password (min. 6 characters)" name="password" type="password" className="input_field" id="password_field" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="input_container">
              <label className="input_label" htmlFor="confirm_password_field">Confirm Password</label>
              <input
                placeholder="Re-enter your password"
                name="confirmPassword"
                type="password"
                className="input_field"
                id="confirm_password_field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  borderColor: confirmPassword && password !== confirmPassword ? '#e53935'
                    : confirmPassword && password === confirmPassword ? '#43a047' : '',
                }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ color: '#e53935', fontSize: 'clamp(11px, 2vw, 13px)', marginTop: '4px' }}>Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p style={{ color: '#43a047', fontSize: 'clamp(11px, 2vw, 13px)', marginTop: '4px' }}>✓ Passwords match</p>
              )}
            </div>

            <button type="submit" className="sign-in_btn" disabled={loading}>
              <span>{loading ? 'Registering...' : 'Register'}</span>
            </button>

            <div className="sign-in_footer">
              <p>Already have an account?{' '}<a href="/login" className="note">Login</a></p>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default Register;