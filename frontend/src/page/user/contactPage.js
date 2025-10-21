import React, { useState, useEffect } from "react";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import LoadingScreen from "../../component/LoadingScreen"
import axios from "axios";
import { Send } from "lucide-react";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

   useEffect(() => {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setLoading(false), 500);
      }, 500);
      return () => clearTimeout(timer);
    }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await axios.post("http://localhost:5000/api/contact", form);
      if (res.status === 200) {
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (error) {
      setStatus("❌ Failed to send message. Try again later.");
    }
  };

  const container = {
    marginTop: "120px",
    padding: "20px 40px",
    maxWidth: "650px",
    margin: "100px auto 50px",
    background: "linear-gradient(135deg, #ffecb3, #ffe4e1, #b3e5fc)",
    borderRadius: "30px",
    boxShadow: "0 8px 15px rgba(0,0,0,0.15)",
    textAlign: "center",
    border: "4px dashed #ff80ab",
    fontFamily: "'Comic Sans MS', 'Poppins', cursive",
  };

  const titleStyle = {
    fontSize: "2rem",
    color: "#ff6f61",
    fontWeight: "bold",
    marginBottom: "10px",
    textShadow: "1px 1px #fff",
  };

  const subtitleStyle = {
    color: "#555",
    marginBottom: "25px",
    fontSize: "1.1rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    margin: "10px 0",
    borderRadius: "20px",
    border: "2px solid #ffc1cc",
    fontSize: "16px",
    transition: "0.3s",
    outline: "none",
  };

  const buttonStyle = {
    backgroundColor: "#ff80ab",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    transition: "0.3s",
  };

  const buttonHover = {
    transform: "scale(1.05)",
    backgroundColor: "#ff4081",
  };

  const [hover, setHover] = useState(false);
  if (loading) return <LoadingScreen fadeOut={fadeOut} />;
  return (
    <>
      <NavbarComponent />
      <div style={container}>
        <h2 style={titleStyle}>💌 Contact Us</h2>
        <p style={subtitleStyle}>
          Hey there, Little Coder! 💻✨  
          Got questions, ideas, or just want to say hi? We’d love to hear from you!
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="👦 Your Name"
            value={form.name}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: form.name ? "#80deea" : "#ffc1cc",
            }}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="📧 Your Email"
            value={form.email}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: form.email ? "#ffcc80" : "#ffc1cc",
            }}
            required
          />

          <textarea
            name="message"
            placeholder="📝 Write your message here..."
            rows="3"
            value={form.message}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: form.message ? "#ce93d8" : "#ffc1cc",
              resize: "none",
            }}
            required
          />

          <button
            type="submit"
            style={hover ? { ...buttonStyle, ...buttonHover } : buttonStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Send size={20} /> Send Message
          </button>
        </form>

        {status && (
          <p
            style={{
              marginTop: "20px",
              color: status.includes("✅") ? "green" : "red",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            {status}
          </p>
        )}
      </div>
      <UserFooter />
    </>
  );
}

export default ContactPage;
