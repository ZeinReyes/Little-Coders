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

        <img
          src=""
          alt="Little Coders Logo"
          className="logo-icon"
        />
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
