import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../service/auth';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Registration started', { name, email });

    try {
      const res = await registerService({ name, email, password });
      console.log('✅ Register response:', res.data);

      const message =
        res.data?.message || 'Registration successful! Redirecting to login...';
      setSuccessMessage(message);

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error('❌ Registration error:', err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      alert(message);
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

      {/* 🧩 Register container */}
      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
        <form
          className="form_container-register w-full max-w-md p-5 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="title">Create an Account</h2>

          {successMessage && (
            <div className="alert alert-success text-center py-2 mb-3" role="alert">
              {successMessage}
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
              placeholder="Password"
              name="password"
              type="password"
              className="input_field"
              id="password_field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in_btn">
            <span>Register</span>
          </button>

          <div className="sign-in_footer mt-3">
            <p className="text-center fs-6">
              Already have an account?{' '}
              <a href="/login" className="note">Login</a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Register;
