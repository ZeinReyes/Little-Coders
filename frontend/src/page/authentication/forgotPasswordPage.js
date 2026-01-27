import { useState } from 'react';
import { forgotPassword } from '../../service/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await forgotPassword({ email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong. Try again.";
      setError(msg);
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


           {/* 🎨 Branding with curve text + logo */}
<div className="branding">
  <svg viewBox="0 0 500 150" className="curve-text">
    <path
      id="curve"
      d="M 50 100 Q 250 -35 450 100"
      fill="transparent"
    />
    <text
      width="500"
      textAnchor="middle"
      fontSize="36"
      fontWeight="bold"
      stroke="#111"           // outline color
      strokeWidth="2"         // outline thickness
      paintOrder="stroke"     // ensures stroke is drawn below fill
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

  <div className="logo-icon">  

  </div>
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
