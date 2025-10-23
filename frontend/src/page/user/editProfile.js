import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Settings, User } from "lucide-react";

function EditProfile() {
  const { _id } = useParams();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${_id}`);
        setUser({
          name: res.data.name,
          email: res.data.email,
          password: res.data.password,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [_id]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setUpdating(true);
    setMessage("");

    if (showPasswordFields && passwords.password !== passwords.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      setUpdating(false);
      return;
    }

    try {
      const updatedData = { ...user };
      if (showPasswordFields && passwords.password) {
        updatedData.password = passwords.password;
      }
      await axios.put(`http://localhost:5000/api/users/${_id}`, updatedData);
      setMessage("✅ Profile updated successfully!");
      setShowPasswordFields(false);
      setPasswords({ password: "", confirmPassword: "" });
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error("Error updating user:", err);
      if (err.response?.data?.error) {
        setMessage(`❌ ${err.response.data.error}: Email already exists`);
      } else {
        setMessage("❌ Failed to update profile. Try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline-warning"
        className="m-3"
        style={{
          width: "15%",
          fontWeight: "bold",
          borderRadius: "8px",
        }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <Container
        fluid
        className="d-flex justify-content-center align-items-center mt-3 mb-4"
      >
        <div
          className="d-flex shadow-lg rounded-4"
          style={{
            background: "#fffaf3",
            maxWidth: "950px",
            width: "100%",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: "230px",
              background: "linear-gradient(180deg, #ff914d, #ffb347)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              color: "#fff",
            }}
          >
            <h5
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "600",
                marginBottom: "1.5rem",
                textAlign: "center",
                letterSpacing: "1px",
              }}
            >
              My Profile
            </h5>

            <Button
              variant={activeTab === "edit" ? "light" : "outline-light"}
              className="mb-3 d-flex align-items-center gap-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "500",
                borderRadius: "10px",
                background: activeTab === "edit" ? "#fff" : "transparent",
                color: activeTab === "edit" ? "#ff914d" : "#fff",
                border: "none",
                transition: "0.3s",
              }}
              onClick={() => setActiveTab("edit")}
            >
              <User size={18} /> Edit Profile
            </Button>

            <Button
              variant={activeTab === "settings" ? "light" : "outline-light"}
              className="d-flex align-items-center gap-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "500",
                borderRadius: "10px",
                background: activeTab === "settings" ? "#fff" : "transparent",
                color: activeTab === "settings" ? "#ff914d" : "#fff",
                border: "none",
                transition: "0.3s",
              }}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={18} /> Settings
            </Button>
          </div>

          {/* Main Content */}
          <div
            style={{
              flexGrow: 1,
              background: "#fffdf8",
              padding: "2.5rem",
            }}
          >
            {activeTab === "edit" ? (
              <Card
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  margin: "0 auto",
                  borderRadius: "15px",
                  border: "1px solid #ffe0b2",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
                }}
                className="p-4"
              >
                <h3
                  className="text-center mb-4"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#ff914d",
                    fontWeight: "600",
                  }}
                >
                  Edit Profile
                </h3>

                <Form>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={user.name}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      required
                      style={{
                        borderRadius: "10px",
                        padding: "10px",
                        border: "1px solid #ffd8a8",
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={user.email}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      required
                      style={{
                        borderRadius: "10px",
                        padding: "10px",
                        border: "1px solid #ffd8a8",
                      }}
                    />
                  </Form.Group>

                  {!showPasswordFields ? (
                    <div className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Control
                          type="password"
                          value="********"
                          disabled
                          style={{
                            width: "80%",
                            borderRadius: "10px",
                            border: "1px solid #ffd8a8",
                          }}
                        />
                        <Button
                          variant="outline-warning"
                          size="sm"
                          disabled={!isEditing}
                          onClick={() => setShowPasswordFields(true)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPasswords.password ? "text" : "password"}
                            name="password"
                            placeholder="Enter new password"
                            value={passwords.password}
                            onChange={handlePasswordChange}
                            required
                            style={{
                              borderRadius: "10px",
                              padding: "10px",
                              border: "1px solid #ffd8a8",
                            }}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                password: !prev.password,
                              }))
                            }
                          >
                            {showPasswords.password ? <EyeOff /> : <Eye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            style={{
                              borderRadius: "10px",
                              padding: "10px",
                              border: "1px solid #ffd8a8",
                            }}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                confirmPassword: !prev.confirmPassword,
                              }))
                            }
                          >
                            {showPasswords.confirmPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <div className="d-flex justify-content-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setShowPasswordFields(false);
                            setPasswords({ password: "", confirmPassword: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {!isEditing ? (
                    <Button
                      variant="warning"
                      className="w-100 mt-3"
                      style={{
                        borderRadius: "10px",
                        fontWeight: "bold",
                        padding: "10px",
                      }}
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-100 mt-3"
                      disabled={updating}
                      style={{
                        backgroundColor: "#ff914d",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        padding: "10px",
                      }}
                      onClick={handleSubmit}
                    >
                      {updating ? "Updating..." : "💾 Save Changes"}
                    </Button>
                  )}
                </Form>

                {message && (
                  <div
                    className={`mt-3 text-center ${
                      message.startsWith("✅") ? "text-success" : "text-danger"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </Card>
            ) : (
              <div
                className="text-center p-5"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#555",
                }}
              >
                <h3 style={{ color: "#ff914d" }}>⚙️ Settings</h3>
                <p>Settings section coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default EditProfile;