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
import { Eye, EyeOff } from "lucide-react"; // 👁️ eye icons

function EditProfile() {
  const { _id } = useParams();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false); // ✏️ for toggling edit mode

  // password management
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${_id}`);
        setUser({ name: res.data.name, email: res.data.email, password: res.data.password });
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [_id]);

  // Handle input
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Handle submit
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
      setIsEditing(false); // back to view mode
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }catch (err) {
      console.error("Error updating user:", err);

      if (err.response && err.response.data && err.response.data.error) {
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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        className="m-3"
        style={{ width: "15%" }}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Container
        fluid
        className="d-flex justify-content-center align-items-center mt-3 mb-3"
      >
        <div
          className="d-flex shadow rounded"
          style={{
            background: "#fff",
            maxWidth: "900px",
            width: "100%",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: "220px",
              background: "linear-gradient(180deg, #ffb6c1, #87cefa)",
              borderRight: "4px dashed #ff6f61",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Button
              variant={activeTab === "edit" ? "warning" : "light"}
              className="mb-3"
              style={{
                fontFamily: "Comic Sans MS, cursive",
                fontSize: "1.1rem",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={() => setActiveTab("edit")}
            >
              ✏️ Edit Profile
            </Button>
            <Button
              variant={activeTab === "settings" ? "info" : "light"}
              style={{
                fontFamily: "Comic Sans MS, cursive",
                fontSize: "1.1rem",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </Button>
          </div>

          {/* Main Content */}
          <div
            style={{
              flexGrow: 1,
              background: "linear-gradient(145deg, #fff, #ffe4e1)",
              padding: "2rem",
              border: "1px dashed #ff6f61",
              borderLeft: "none",
            }}
          >
            {activeTab === "edit" ? (
              <Card
                style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
                className="shadow-sm p-4"
              >
                <h3
                  className="text-center mb-4"
                  style={{
                    fontFamily: "Comic Sans MS, cursive",
                    color: "#ff6f61",
                  }}
                >
                  Edit Profile
                </h3>

                <Form>
                  {/* Name */}
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
                      style={{ borderRadius: "10px", padding: "10px" }}
                    />
                  </Form.Group>

                  {/* Email */}
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
                      style={{ borderRadius: "10px", padding: "10px" }}
                    />
                  </Form.Group>

                  {/* Password Section */}
                  {!showPasswordFields ? (
                    <div className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Control
                          type="password"
                          value="********"
                          disabled
                          style={{ width: "80%", borderRadius: "10px" }}
                        />
                        <Button
                          variant="outline-secondary"
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
                      {/* New Password with eye toggle */}
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
                            style={{ borderRadius: "10px", padding: "10px" }}
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

                      {/* Confirm Password with eye toggle */}
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
                            style={{ borderRadius: "10px", padding: "10px" }}
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
                            setPasswords({
                              password: "",
                              confirmPassword: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Buttons */}
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
                  fontFamily: "Comic Sans MS, cursive",
                  color: "#555",
                }}
              >
                <h3 style={{ color: "#ff6f61" }}>⚙️ Settings</h3>
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
