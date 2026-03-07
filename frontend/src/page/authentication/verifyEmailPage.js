import { useParams, useNavigate } from 'react-router-dom';
import AuthBackground from './AuthBackground';

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const success = token === 'success';

  return (
    <>
      <AuthBackground />
      <div className="loginContainer">
        <div className="form_container-register" style={{ textAlign: 'center' }}>
        <div className="auth-brand-title">
            <span style={{ color: '#e53935' }}>L</span>
            <span style={{ color: '#43a047' }}>i</span>
            <span style={{ color: '#1e88e5' }}>t</span>
            <span style={{ color: '#fb8c00' }}>t</span>
            <span style={{ color: '#8e24aa' }}>l</span>
            <span style={{ color: '#fdd835', WebkitTextStroke: '1px #999' }}>e</span>
            <span>&nbsp;</span>
            <span style={{ color: '#3949ab' }}>C</span>
            <span style={{ color: '#43a047' }}>o</span>
            <span style={{ color: '#f4511e' }}>d</span>
            <span style={{ color: '#1e88e5' }}>e</span>
            <span style={{ color: '#8e24aa' }}>r</span>
            <span style={{ color: '#f4b400' }}>s</span>
          </div>
          <div class="divider"></div>
          {success ? (
            <>
              <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '8px', display: 'inline-block', animation: 'bounceIn 0.6s ease forwards, floatBob 3s ease-in-out 0.6s infinite' }}>
                🎉
              </div>
              <h2 className="title">You're Verified!</h2>
              <p style={{ color: '#555', marginBottom: '8px', fontSize: 'clamp(13px, 2.5vw, 15px)', lineHeight: 1.7 }}>
                Woohoo! Your account is now active.<br />
                Time to start your coding adventure! 🚀
              </p>
              <div style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', letterSpacing: '6px', margin: '8px 0 16px' }}>
                ⭐🌟✨🌟⭐
              </div>
              <button className="sign-in_btn" onClick={() => navigate('/login')}>
                <span>Let's Go! →</span>
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '8px', display: 'inline-block', animation: 'shakeHead 0.8s ease forwards' }}>
                😕
              </div>
              <h2 className="title" style={{ color: '#e53935' }}>Oops! Link Expired</h2>
              <p style={{ color: '#555', marginBottom: '8px', fontSize: 'clamp(13px, 2.5vw, 15px)', lineHeight: 1.7 }}>
                This link is no longer valid or has already been used.<br />
                Don't worry — just register again to get a new one! 💪
              </p>
              <div style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', letterSpacing: '6px', margin: '8px 0 16px' }}>
                💫🔄💫
              </div>
              <button className="sign-in_btn" onClick={() => navigate('/register')}>
                <span>Try Again →</span>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.3); opacity: 0; }
          50%  { transform: scale(1.15); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes shakeHead {
          0%, 100% { transform: rotate(0deg); }
          20%  { transform: rotate(-10deg); }
          40%  { transform: rotate(10deg); }
          60%  { transform: rotate(-8deg); }
          80%  { transform: rotate(8deg); }
        }
      `}</style>
    </>
  );
}

export default VerifyEmailPage;