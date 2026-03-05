import { useParams, useNavigate } from 'react-router-dom';

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const success = token === 'success';

  return (
    <>
      <img className="land" src="/assets/images/land.png" alt="" />
      <div className="balloon"></div>
      <img className="cloud-left" src="/assets/images/cloud.png" alt="" />
      <img className="cloud-right" src="/assets/images/cloud.png" alt="" />

      <div className="loginContainer d-flex justify-content-center align-items-center w-100 min-vh-100">
        <div
          className="form_container-register w-full max-w-md p-5 rounded-lg shadow-md"
          style={{ textAlign: 'center' }}
        >
          {success ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h2 className="title">Email Verified!</h2>
              <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                Your account is now active. You can log in and start coding!
              </p>
              <button className="sign-in_btn" onClick={() => navigate('/login')}>
                <span>Go to Login →</span>
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
              <h2 className="title" style={{ color: '#e53935' }}>Verification Failed</h2>
              <p style={{ color: '#555', marginBottom: '1.5rem' }}>
                This link is invalid or has already been used. Please register again to get a new link.
              </p>
              <button className="sign-in_btn" onClick={() => navigate('/register')}>
                <span>Back to Register</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default VerifyEmailPage;