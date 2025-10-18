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
    console.log('🚀 Login started with:', { email, password });

    try {
        const res = await loginService({ email, password });
        console.log('✅ Login response:', res.data);

        // Include hasCompletedOnboarding from backend (or default to false if missing)
        const userWithOnboarding = {
            ...res.data.user,
            hasCompletedOnboarding: res.data.user.hasCompletedOnboarding ?? false
        };

        // Save user and token in context + localStorage
        login(userWithOnboarding, res.data.token);
        console.log('🔑 User & token saved in context/localStorage:', userWithOnboarding);

        // Navigate
        navigate(userWithOnboarding.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
        const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            'Login failed. Please try again.';
        alert(message);
    }
};


    // Page & navbar styles (unchanged)
    const pageStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
    const navBarStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' };

    return (
        <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
            <form className="form_container w-full max-w-md p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <div style={pageStyle}>
                    <nav style={navBarStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '800', fontSize: '22px', fontFamily: "'Poppins', sans-serif", marginBottom: '20px' }}>
                            <span style={{ color: '#e53935' }}>L</span>
                            <span style={{ color: '#43a047' }}>i</span>
                            <span style={{ color: '#1e88e5' }}>t</span>
                            <span style={{ color: '#fb8c00' }}>t</span>
                            <span style={{ color: '#8e24aa' }}>l</span>
                            <span style={{ color: '#fda635' }}>e</span>
                            <span style={{ width: '10px' }}></span>
                            <span style={{ color: '#3949ab' }}>C</span>
                            <span style={{ color: '#43a047' }}>o</span>
                            <span style={{ color: '#f4511e' }}>d</span>
                            <span style={{ color: '#1e88e5' }}>e</span>
                            <span style={{ color: '#8e24aa' }}>r</span>
                            <span style={{ color: '#f4b400' }}>s</span>
                        </div>
                    </nav>
                </div>

                <div className="title_container"><p className="title">Login to your Account</p></div>

                <div className="input_container">
                    <label className="input_label" htmlFor="email_field">Email</label>
                    <input placeholder="name@mail.com" name="email" type="email" className="input_field" id="email_field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="input_container">
                    <label className="input_label" htmlFor="password_field">Password</label>
                    <input placeholder="Password" name="password" type="password" className="input_field" id="password_field" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="ms-auto mb-3"><a href="/forgot-password" className="note">Forgot Password?</a></div>

                <button type="submit" className="sign-in_btn"><span>Login</span></button>

                <div className="sign-in_footer my-3">
                    <p>Don't have an account? <a href="/register" className="signup_link">Register</a></p>
                </div>

                <div className="my-2"><a href="/home" className="note">Continue as Guest</a></div>
            </form>
        </div>
    );
}

export default Login;
