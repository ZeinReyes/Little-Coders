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
            login(res.data.user, res.data.token);
            localStorage.setItem('token', res.data.token);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/home');
        } catch (err) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Login failed. Please try again.';
            alert(message);
        }
    };

    return (
        <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
            <form
                className="form_container w-full max-w-md p-6 rounded-lg shadow-md"
                onSubmit={handleSubmit}
            >
                <img src="logo-gold.png" style={{ width: '100px' }} alt="Logo" />

                <div className="title_container">
                    <p className="title">Login to your Account</p>
                </div>

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

                <div className="input_container">
                    <label className="input_label" htmlFor="password_field">
                        Password
                    </label>
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

                <div className="text-end mb-3">
                    <a href="/forgot-password" className="note">
                        Forgot Password?
                    </a>
                </div>

                <button type="submit" className="sign-in_btn">
                    <span>Login</span>
                </button>

                <div className="sign-in_footer my-3">
                    <p>
                        Don't have an account?{' '}
                        <a href="/register" className="signup_link">
                            Register
                        </a>
                    </p>
                </div>

                <div className="my-2">
                    <a href="/home" className="note">
                        Continue as Guest
                    </a>
                </div>
            </form>
        </div>
    );
}

export default Login;
