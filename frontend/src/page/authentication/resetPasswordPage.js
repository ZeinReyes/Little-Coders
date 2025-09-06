import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../service/auth';

function ResetPasswordPage() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await resetPassword(token, { password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
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
                <img src="/logo-gold.png" style={{ width: '100px' }} alt="Logo" />

                <div className="title_container">
                    <p className="title">Reset Password</p>
                    <span className="subtitle">
                        Enter and confirm your new password.
                    </span>
                </div>

                <div className="input_container">
                    <label className="input_label" htmlFor="password_field">
                        New Password
                    </label>
                    <input
                        placeholder="New Password"
                        name="password"
                        type="password"
                        className="input_field"
                        id="password_field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input_container">
                    <label className="input_label" htmlFor="confirm_password_field">
                        Confirm Password
                    </label>
                    <input
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        className="input_field"
                        id="confirm_password_field"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="sign-in_btn">
                    <span>Reset Password</span>
                </button>

                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default ResetPasswordPage;
