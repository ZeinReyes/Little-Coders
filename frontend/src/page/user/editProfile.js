import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";

function EditProfile() {
  const { _id } = useParams(); // user ID from URL
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // password management
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${_id}`);
        setUser({ name: res.data.name, email: res.data.email });
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
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage("❌ Failed to update profile. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <NavbarComponent />
      <Container className="d-flex justify-content-center align-items-center mt-5 mb-5">
        <Card style={{ width: "100%", maxWidth: "500px" }} className="shadow-sm p-4">
          <h3 className="text-center mb-4">Edit Profile</h3>
          <Form onSubmit={handleSubmit}>
            {/* Name */}
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={user.name}
                onChange={handleChange}
                required
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
                required
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
                    style={{ width: "80%" }}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
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
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={passwords.password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
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

            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-3"
              disabled={updating}
            >
              {updating ? "Updating..." : "Save Changes"}
            </Button>
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
      </Container>
      <UserFooter />
    </>
  );
}

export default EditProfile;
