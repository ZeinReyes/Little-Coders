import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { login as loginService } from '../../service/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginService({ email, password });
      const userWithOnboarding = {
        ...res.data.user,
        hasCompletedOnboarding: res.data.user.hasCompletedOnboarding ?? false,
      };
      login(userWithOnboarding, res.data.token);
      navigate(userWithOnboarding.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Login failed. Please try again.';
      alert(message);
    }
  };

  return (
    <>
      {/* 🌤️ Background elements (outside form) */}
      <div className="balloon"></div>
      <div className="land"></div>
    <img className='cloud-left' src='/assets/images/cloud.png' />
    <img className='cloud-right' src='/assets/images/cloud.png' />
    <img className='cloud-right1' src='/assets/images/cloud.png' />

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

        {/* 🪄 Logo that sits half in / half out of login box */}
        <img
          src=""
          alt="Little Coders Logo"
          className="logo-icon"
        />
      </div>

      {/* 🧩 Login container */}
      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
        <form
          className="form_container w-full max-w-md p-5 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <h2 className="title">Login</h2>

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

            <p className='text-end'>
              <a href="/forgot-password" className="note">Forgot Password?</a>
            </p>

          <button type="submit" className="sign-in_btn">Login</button>

          <div className="sign-in_footer">
            <p className='text-center fs-6'>
              Don't have an account?{' '}
              <a href="/register" className="note">Register</a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
