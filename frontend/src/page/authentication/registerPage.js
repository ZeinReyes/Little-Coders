import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../service/auth';

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

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerService({ name, email, password });
      const message = res.data?.message || 'Registration successful! Please check your email to verify your account.';
      setSuccessMessage(message);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🌤️ Background elements */}
      <img className='land' src='/assets/images/land.png' />
      <div className="balloon"></div>
      <div className="land"></div>
      <img className="cloud-left" src="/assets/images/cloud.png" alt="Cloud Left" />
      <img className="cloud-right" src="/assets/images/cloud.png" alt="Cloud Right" />
      <img className="cloud-right1" src="/assets/images/cloud.png" alt="Cloud Right 2" />
      <img className='cloud-left clone' src='/assets/images/cloud.png' />
      <img className='cloud-right clone' src='/assets/images/cloud.png' />
      <img className='cloud-right1 clone' src='/assets/images/cloud.png' />
      <div className="balloon clone"></div>

      {/* 🎨 Branding */}
      <div className="branding">
        <svg viewBox="0 0 500 150" className="curve-text">
          <path id="curve" d="M 50 100 Q 250 -35 450 100" fill="transparent" />
          <text
            width="500"
            textAnchor="middle"
            fontSize="36"
            fontWeight="bold"
            stroke="#111"
            strokeWidth="2"
            paintOrder="stroke"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
          >
            <textPath href="#curve" startOffset="50%" className="little-coders">
              <tspan fill="#e53935">L</tspan>
              <tspan fill="#43a047">i</tspan>
              <tspan fill="#1e88e5">t</tspan>
              <tspan fill="#fb8c00">t</tspan>
              <tspan fill="#8e24aa">l</tspan>
              <tspan fill="#fdd835">e</tspan>
              <tspan>&nbsp;</tspan>
              <tspan fill="#3949ab">C</tspan>
              <tspan fill="#43a047">o</tspan>
              <tspan fill="#f4511e">d</tspan>
              <tspan fill="#1e88e5">e</tspan>
              <tspan fill="#8e24aa">r</tspan>
              <tspan fill="#f4b400">s</tspan>
            </textPath>
          </text>
        </svg>
        <div className="logo-icon"></div>
      </div>

      {/* 🧩 Register container */}
      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">

        {/* ── Success state: show email sent message instead of form ── */}
        {successMessage ? (
          <div
            className="form_container-register w-full max-w-md p-5 rounded-lg shadow-md"
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 className="title">Check your email!</h2>
            <p style={{ color: '#555', marginBottom: '1.5rem' }}>
              {successMessage}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              Didn't receive it?{' '}
              <a href="/register" className="note">Try registering again</a>
            </p>
            <button
              className="sign-in_btn mt-3"
              onClick={() => navigate('/login')}
            >
              <span>Go to Login</span>
            </button>
          </div>
        ) : (
          <form
            className="form_container-register w-full max-w-md p-5 rounded-lg shadow-md"
            onSubmit={handleSubmit}
          >
            <h2 className="title">Create an Account</h2>

            {errorMessage && (
              <div className="alert alert-danger text-center py-2 mb-3" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="input_container">
              <label className="input_label" htmlFor="name_field">Name</label>
              <input
                placeholder="Your name"
                name="name"
                type="text"
                className="input_field"
                id="name_field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className="input_container">
              <label className="input_label" htmlFor="password_field">Password</label>
              <input
                placeholder="Password (min. 6 characters)"
                name="password"
                type="password"
                className="input_field"
                id="password_field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
                  borderColor:
                    confirmPassword && password !== confirmPassword
                      ? '#e53935'
                      : confirmPassword && password === confirmPassword
                      ? '#43a047'
                      : '',
                }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p style={{ color: '#e53935', fontSize: '0.8rem', marginTop: '4px' }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p style={{ color: '#43a047', fontSize: '0.8rem', marginTop: '4px' }}>
                  ✓ Passwords match
                </p>
              )}
            </div>

            <button type="submit" className="sign-in_btn" disabled={loading}>
              <span>{loading ? 'Registering...' : 'Register'}</span>
            </button>

            <div className="sign-in_footer mt-3">
              <p className="text-center fs-6">
                Already have an account?{' '}
                <a href="/login" className="note">Login</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default Register;