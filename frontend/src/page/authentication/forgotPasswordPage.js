import { useState } from 'react';
import { forgotPassword } from '../../service/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Something went wrong. Try again.';
      setError(msg);
    }
  };

  return (
    <>
      {/* 🌤️ Background elements */}
      <div className="balloon"></div>
      <div className="land"></div>
      <img className="cloud-left" src="/assets/images/cloud.png" alt="Cloud Left" />
      <img className="cloud-right" src="/assets/images/cloud.png" alt="Cloud Right" />
      <img className="cloud-right1" src="/assets/images/cloud.png" alt="Cloud Right 2" />

      {/* 🎨 Branding with curve text + logo */}
      <div className="branding">
        <svg viewBox="0 0 500 150" className="curve-text">
          <path
            id="curve"
            d="M 50 100 Q 250 -35 450 100"
            fill="transparent"
          />
          <text width="500" textAnchor="middle">
            <textPath href="#curve" startOffset="50%" className="little-coders">
              Little Coders
            </textPath>
          </text>
        </svg>

        <img
          src=""
          alt="Little Coders Logo"
          className="logo-icon"
        />
      </div>

      {/* 🧩 Forgot Password container */}
      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
        <form
          className="form_container-forgot w-full max-w-md p-5 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="title">Forgot Password</h2>
          <p className="text-center mb-4" style={{ fontSize: '16px', color: '#444' }}>
            Enter your email and we’ll send you a reset link.
          </p>

          <div className="input_container">
            <label className="input_label" htmlFor="email_field">
              Email
            </label>
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

          <button type="submit" className="sign-in_btn">
            <span>Send Reset Link</span>
          </button>

          {message && (
            <p style={{ color: 'green', marginTop: '50px', position: 'fixed'}}>{message}</p>
          )}
          {error && (
            <p style={{ color: 'red', marginTop: '50px', position: 'fixed' }}>{error}</p>
          )}

          <div className="sign-in_footer mt-3 text-center">
            <p>
              Remembered your password?{' '}
              <a href="/login" className="note">
                Back to Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgotPasswordPage;
