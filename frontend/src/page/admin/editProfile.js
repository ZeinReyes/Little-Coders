import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

function EditProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Prefer user._id (Mongoose default) then user.id, then localStorage fallback
  const userId = user?._id || user?.id || localStorage.getItem("userId");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        // GET /api/users/:id  → controller returns the user object directly (no wrapper)
        const res = await axios.get(
          `https://little-coders-production.up.railway.app/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormData({
          name:     res.data.name  || "",
          email:    res.data.email || "",
          password: "",
          role:     res.data.role  || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Only send password if the user actually typed one
    const payload = {
      name:  formData.name,
      email: formData.email,
      role:  formData.role,
      ...(formData.password.trim() !== "" && { password: formData.password }),
    };

    try {
      const token = localStorage.getItem("token");
      // PUT /api/users/:id  → controller now returns { message, user }
      const res = await axios.put(
        `https://little-coders-production.up.railway.app/api/users/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ res.data.user is the updated user returned by the fixed controller
      if (res.data.user) {
        setUser(res.data.user);
      }

      // Keep form in sync (clear password, update name/email/role from server)
      setFormData((prev) => ({
        ...prev,
        name:     res.data.user?.name  || prev.name,
        email:    res.data.user?.email || prev.email,
        role:     res.data.user?.role  || prev.role,
        password: "",
      }));

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      const serverMsg = err.response?.data?.error;
      setMessage(serverMsg || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes("success");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .ep-wrapper {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2.5rem 1rem;
        }
        .ep-card {
          width: 100%;
          max-width: 680px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* ── Header ── */
        .ep-header {
          background: linear-gradient(135deg, #1a2236 0%, #243150 100%);
          padding: 2rem 2.25rem 1.75rem;
          position: relative;
          overflow: hidden;
        }
        .ep-header::after {
          content: '';
          position: absolute;
          right: -40px; top: -40px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          pointer-events: none;
        }
        .ep-header-icon {
          width: 48px; height: 48px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }
        .ep-header-icon svg { width: 22px; height: 22px; stroke: #a8c4f0; }
        .ep-header h2 {
          color: #ffffff; font-size: 1.35rem; font-weight: 600;
          margin: 0 0 0.25rem; letter-spacing: -0.02em;
        }
        .ep-header p { color: rgba(255,255,255,0.5); font-size: 0.82rem; margin: 0; }

        /* ── Role badge ── */
        .ep-role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,179,237,0.15);
          border: 1px solid rgba(99,179,237,0.3);
          color: #90cdf4;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 20px; margin-top: 0.75rem;
        }
        .ep-role-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #63b3ed; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .ep-divider { height: 1px; background: #e8ecf1; }

        /* ── Body ── */
        .ep-body { padding: 2rem 2.25rem 2.25rem; }
        .ep-section-label {
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #8a94a6; margin-bottom: 1.25rem;
        }
        .ep-form-group { margin-bottom: 1.35rem; }
        .ep-label {
          font-size: 0.8rem; font-weight: 500; color: #374151;
          margin-bottom: 0.45rem;
          display: flex; align-items: center; gap: 6px;
        }
        .ep-label svg { width: 14px; height: 14px; stroke: #9ca3af; }
        .ep-input {
          display: block; width: 100%;
          padding: 0.6rem 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; color: #111827;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb; border-radius: 8px;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          outline: none;
        }
        .ep-input::placeholder { color: #c1c8d4; }
        .ep-input:focus {
          border-color: #3b82f6; background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .ep-input-hint { font-size: 0.73rem; color: #9ca3af; margin-top: 0.35rem; }

        .ep-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 540px) {
          .ep-grid-2 { grid-template-columns: 1fr; }
          .ep-body    { padding: 1.5rem 1.25rem; }
          .ep-header  { padding: 1.5rem 1.25rem 1.25rem; }
        }

        /* ── Alert ── */
        .ep-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 0.75rem 1rem; border-radius: 8px;
          font-size: 0.83rem; font-weight: 500; margin-bottom: 1.5rem;
        }
        .ep-alert svg { width: 16px; height: 16px; flex-shrink: 0; }
        .ep-alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .ep-alert-error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }

        /* ── Footer ── */
        .ep-footer {
          border-top: 1px solid #f1f3f7;
          padding: 1.25rem 2.25rem;
          display: flex; justify-content: flex-end; gap: 0.75rem;
          background: #fafbfc;
        }
        .ep-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; font-weight: 500;
          padding: 0.55rem 1.35rem; border-radius: 8px; border: none;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
          transition: all 0.15s; line-height: 1.4;
        }
        .ep-btn svg { width: 15px; height: 15px; }
        .ep-btn-ghost {
          background: transparent;
          border: 1.5px solid #d1d5db; color: #6b7280;
        }
        .ep-btn-ghost:hover { background: #f3f4f6; border-color: #9ca3af; color: #374151; }
        .ep-btn-primary { background: #1a2236; color: #fff; border: 1.5px solid transparent; }
        .ep-btn-primary:hover:not(:disabled) {
          background: #243150;
          box-shadow: 0 4px 12px rgba(26,34,54,0.25);
          transform: translateY(-1px);
        }
        .ep-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .ep-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ep-wrapper">
        <div className="ep-card">

          {/* Header */}
          <div className="ep-header">
            <div className="ep-header-icon">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h2>Edit Profile</h2>
            <p>Manage your administrator account settings</p>
            {formData.role && (
              <div className="ep-role-badge">
                <span className="ep-role-dot" />
                {formData.role}
              </div>
            )}
          </div>

          <div className="ep-divider" />

          {/* Body */}
          <div className="ep-body">

            {message && (
              <div className={`ep-alert ${isSuccess ? "ep-alert-success" : "ep-alert-error"}`}>
                {isSuccess ? (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                )}
                {message}
              </div>
            )}

            <div className="ep-section-label">Account Information</div>

            <form onSubmit={handleSubmit}>
              {/* Name + Email */}
              <div className="ep-grid-2">
                <div className="ep-form-group">
                  <label className="ep-label">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Full Name
                  </label>
                  <input
                    type="text" name="name" className="ep-input"
                    value={formData.name} onChange={handleChange}
                    placeholder="Enter full name" required
                  />
                </div>

                <div className="ep-form-group">
                  <label className="ep-label">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    Email Address
                  </label>
                  <input
                    type="email" name="email" className="ep-input"
                    value={formData.email} onChange={handleChange}
                    placeholder="Enter email address" required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="ep-form-group">
                <label className="ep-label">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  New Password
                </label>
                <input
                  type="password" name="password" className="ep-input"
                  value={formData.password} onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                />
                <div className="ep-input-hint">
                  Only fill this in if you want to change your password.
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="ep-footer">
            <button type="button" className="ep-btn ep-btn-ghost" onClick={() => navigate(-1)}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit" className="ep-btn ep-btn-primary"
              disabled={loading} onClick={handleSubmit}
            >
              {loading ? (
                <><span className="ep-spinner" /> Saving…</>
              ) : (
                <>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default EditProfile;