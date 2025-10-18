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

      // Show success message
      const message = res.data?.message || 'Registration successful! Redirecting to login...';
      setSuccessMessage(message);

      // Redirect to login after short delay
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
    <div className="registerContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
      <form
        className="form_container w-full max-w-md p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <img src="logo-gold.png" style={{ width: '100px' }} alt="Logo" />
        <div className="title_container">
          <p className="title">Create an Account</p>
        </div>

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
          <p>
            Already have an account? <a href="/login" className="signup_link">Login</a>
          </p>
        </div>

        <div className="mt-2">
          <a href="/home" className="note">Continue as Guest</a>
        </div>
      </form>
    </div>
  );
}

export default Register;
