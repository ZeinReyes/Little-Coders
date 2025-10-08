
import { Link, useNavigate } from "react-router-dom";

const UserFooter = () => {
   const footerStyle = {
    backgroundColor: "#222",
    color: "#fff",
    padding: "40px 0",
    width: "100%",
    textAlign: "center",
    marginTop: "auto",
  };

  return (
    <footer style={footerStyle}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5>Little Coders</h5>
              <p>Inspiring young learners to code, create, and explore technology.</p>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link className="text-white text-decoration-none" to="/">Home</Link></li>
                <li><Link className="text-white text-decoration-none" to="/module-list">Lessons</Link></li>
                <li><Link className="text-white text-decoration-none" to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Follow Us</h5>
              <p>
                <a href="#" className="text-white text-decoration-none me-2">Facebook</a>
                <a href="#" className="text-white text-decoration-none me-2">Instagram</a>
                <a href="#" className="text-white text-decoration-none">YouTube</a>
              </p>
            </div>
          </div>
          <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />
          <p className="mb-0">© {new Date().getFullYear()} Little Coders. All Rights Reserved.</p>
        </div>
      </footer>
  );
};

export default UserFooter;