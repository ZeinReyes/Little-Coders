import React, { useState } from "react";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import axios from "axios";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await axios.post("http://localhost:5000/api/contact", form);
      if (res.data.success) {
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      }
    } catch (error) {
      setStatus("❌ Failed to send message. Try again later.");
    }
  };

  const container = {
    marginTop: "100px",
    padding: "40px",
    maxWidth: "600px",
    margin: "100px auto",
    backgroundColor: "#fff",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  const buttonStyle = {
    backgroundColor: "#1e88e5",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  };

  return (
    <>
      <NavbarComponent />
      <div style={container}>
        <h2>📬 Contact Us</h2>
        <p style={{ color: "#555" }}>
          Have questions or ideas? Send us a message! We love hearing from our Little Coders.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <textarea
            name="message"
            placeholder="Write your message here..."
            rows="5"
            value={form.message}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>
            Send Message
          </button>
        </form>

        {status && (
          <p style={{ marginTop: "15px", color: status.includes("✅") ? "green" : "red" }}>
            {status}
          </p>
        )}
      </div>
      <UserFooter />
    </>
  );
}

export default ContactPage;
