import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/users",
        { name, email, password, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding user");
    }
  };

  return (
    <div className="p-2">
      <div>
        <Button
              variant="outline-primary px-5 mb-3"
              onClick={() => navigate("/admin/users")}
            >
              Back
        </Button>
        <h3 className="text-white mb-3">Add New User</h3>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow-sm"
        >
          {error && <p className="text-danger">{error}</p>}

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/admin/users")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Add User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
