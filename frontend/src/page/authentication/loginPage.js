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
    <img className='land' src='/assets/images/land.png' />
    <img className='cloud-left' src='/assets/images/cloud.png' />
    <img className='cloud-right' src='/assets/images/cloud.png' />
    <img className='cloud-right1' src='/assets/images/cloud.png' />

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
