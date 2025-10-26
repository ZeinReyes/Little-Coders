import React, { useState, useEffect } from "react";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import LoadingScreen from "../../component/LoadingScreen";
import axios from "axios";
import { Send } from "lucide-react";

function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    // Combine firstName + lastName for backend
    const payload = {
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email,
      message: form.message,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/contact", payload);
      if (res.status === 200) {
        setStatus("✅ Message sent successfully!");
        setForm({ firstName: "", lastName: "", email: "", message: "" });
        setTimeout(() => setStatus(""), 3000);
      }
    } catch {
      setStatus("❌ Failed to send message. Try again later.");
    }
  };

  if (loading) return <LoadingScreen fadeOut={fadeOut} />;

  return (
    <>
      <NavbarComponent />

      {/* Top Banner Section */}
      <section
        style={{
          backgroundImage:
            "linear-gradient( rgba(255,192,103,0.15),rgba(255,192,103,0.55)), url('https://img.freepik.com/free-photo/medium-shot-little-kids-studying-bible_23-2149613739.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "140px 20px",
          textAlign: "center",
          color: "#fff",
          height: "100vh",
        }}
      >
        <h1
          style={{
            fontFamily: "'Comic Neue', 'Poppins', cursive",
            fontSize: "4rem",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Contact
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            maxWidth: "700px",
            margin: "0 auto",
            color: "#fffbea",
          }}
        >
  This project was created by the students of the Technological Institute of the Philippines, Casal Campus, dedicated to promoting quality education and technological innovation for future innovators and leaders. Contact us to learn more or collaborate with our team of aspiring technologists.
  </p>
      </section>

      {/* Wave Transition */}
      <svg
        className="position-absolute"
        style={{ top: "530px", height: "390px", zIndex: "0" }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#ffc067"
          fillOpacity="1"
          d="M0,32L34.3,53.3C68.6,75,137,117,206,112C274.3,107,343,53,411,32C480,11,549,21,617,69.3C685.7,117,754,203,823,213.3C891.4,224,960,160,1029,149.3C1097.1,139,1166,181,1234,186.7C1302.9,192,1371,160,1406,144L1440,128V320H0Z"
        ></path>
      </svg>

      {/* Contact Section */}
      <section
        style={{
          background: "#ffc067",
          padding: "80px 20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "60px",
          zIndex: "1000",
        }}
      >
        {/* Left: Info */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            maxWidth: "400px",
            color: "#333",
            textAlign: "left",
            padding: "20px",
            zIndex: "10"
          }}
        >
          <h2
            style={{
              fontFamily: "'Comic Neue', 'Poppins', cursive",
              fontSize: "2.2rem",
              color: "#fff",
              marginBottom: "20px",
            }}
          >
            Get In Touch
          </h2>
          <p
            style={{
              color: "#fff8e1",
              fontSize: "1.1rem",
              marginBottom: "25px",
            }}
          >
           Little Coders
          </p>
          <p>📍 363 P. Casal St., Quiapo, Manila, Philippines</p>
          <p>📞 929-242-6868</p>
          <p>📧 LittleCoders@gmail.com</p>
        </div>

        {/* Right: Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: "1.2",
            minWidth: "420px",
            maxWidth: "700px",
            background: "#fff",
            borderRadius: "25px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: "10"
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              name="firstName"
              placeholder="First"
              value={form.firstName}
              onChange={handleChange}
              required
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "20px",
                border: "2px solid #ffc067",
                fontSize: "16px",
                outline: "none",
              }}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last"
              value={form.lastName}
              onChange={handleChange}
              required
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "20px",
                border: "2px solid #ffc067",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              padding: "14px",
              borderRadius: "20px",
              border: "2px solid #ffc067",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <textarea
            name="message"
            placeholder="Message"
            value={form.message}
            onChange={handleChange}
            required
            style={{
              padding: "14px",
              borderRadius: "20px",
              border: "2px solid #ffc067",
              fontSize: "16px",
              height: "120px",
              resize: "none",
              outline: "none",
            }}
          />

          <button
            type="submit"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              backgroundColor: hover ? "#ffb347" : "#ffc067",
              color: "#fff",
              border: "none",
              padding: "14px",
              borderRadius: "25px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              transition: "0.3s",
            }}
          >
            <Send size={20} /> Send
          </button>

          {status && (
            <p
              style={{
                color: status.includes("✅") ? "green" : "red",
                fontWeight: "bold",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              {status}
            </p>
          )}
        </form>
      </section>

      <UserFooter />
    </>
  );
}

export default ContactPage;