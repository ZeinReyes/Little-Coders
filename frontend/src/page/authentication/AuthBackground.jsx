// Shared background + branding for all auth pages
function AuthBackground() {
    return (
      <>
        <img className='land' src='/assets/images/land.png' alt="" />
        <div className="balloon"></div>
        <img className="cloud-left" src="/assets/images/cloud.png" alt="" />
        <img className="cloud-right" src="/assets/images/cloud.png" alt="" />
        <img className="cloud-right1" src="/assets/images/cloud.png" alt="" />
        <img className='cloud-left clone' src='/assets/images/cloud.png' alt="" />
        <img className='cloud-right clone' src='/assets/images/cloud.png' alt="" />
        <img className='cloud-right1 clone' src='/assets/images/cloud.png' alt="" />
        <div className="balloon clone"></div>
      </>
    );
  }
  
  export default AuthBackground;