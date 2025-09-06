import { useState } from 'react';
import { forgotPassword } from '../../service/auth';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await forgotPassword({ email });
            setMessage(res.data.message);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Something went wrong. Try again.';
            setError(msg);
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
                    <p className="title">Forgot Password</p>
                    <span className="subtitle">
                        Enter your email and we'll send you a reset link.
                    </span>
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

                <button type="submit" className="sign-in_btn">
                    <span>Send Reset Link</span>
                </button>

                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div className="sign-in_footer">
                    <p>
                        Remembered your password?{' '}
                        <a href="/login" className="signup_link">
                            Back to Login
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default ForgotPasswordPage;
