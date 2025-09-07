import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerService } from '../../service/auth';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await registerService({ name, email, password });

            if (res.data?.message) {
            alert(res.data.message);
            } else {
            alert('Registration successful!');
            }

            navigate('/login');
        } catch (err) {
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

                <div className="input_container">
                    <label className="input_label" htmlFor="name_field">
                        Name
                    </label>
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

                <button type="submit" className="sign-in_btn">
                    <span>Register</span>
                </button>

                <div className="sign-in_footer mt-3">
                    <p>
                        Already have an account?{' '}
                        <a href="/login" className="signup_link">
                            Login
                        </a>
                    </p>
                </div>

                <div className="mt-2">
                    <a href="/home" className="note">
                        Continue as Guest
                    </a>
                </div>
            </form>
        </div>
    );
}

export default Register;
