import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../service/auth';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await resetPassword(token, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
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

      <img className='cloud-left clone' src='/assets/images/cloud.png' />
      <img className='cloud-right clone' src='/assets/images/cloud.png' />
      <img className='cloud-right1 clone' src='/assets/images/cloud.png' />
      <div className="balloon clone"></div>


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

        {/* 🪄 Half-in/half-out logo */}
        <img
          src=""
          alt="Little Coders Logo"
          className="logo-icon"
        />
      </div>

      {/* 🔐 Reset Password Form */}
      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
        <form
          className="form_container w-full max-w-md p-5 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="title">Reset Password</h2>
          <p className="text-center mb-4" style={{ fontSize: '16px', color: '#444' }}>
            Enter and confirm your new password.
          </p>

          <div className="input_container">
            <label className="input_label" htmlFor="password_field">
              New Password
            </label>
            <input
              placeholder="New Password"
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
            <label className="input_label" htmlFor="confirm_password_field">
              Confirm Password
            </label>
            <input
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              className="input_field"
              id="confirm_password_field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in_btn">
            <span>Reset Password</span>
          </button>

          {message && (
            <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>
          )}
          {error && (
            <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
          )}

          <div className="sign-in_footer mt-3 text-center">
            <p>
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

export default ResetPasswordPage;
