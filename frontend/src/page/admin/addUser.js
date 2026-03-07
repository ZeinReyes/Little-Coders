import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://little-coders-production.up.railway.app/api";

export default function AddUser() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]       = useState("user");
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/users`, { name, email, password, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { font-family: 'Sora', sans-serif; background: #f8fafc; min-height: 100vh; color: #1e293b; padding: 2rem; }
        .pg-inner { max-width: 560px; margin: 0 auto; }
        .pg-back { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 12px; cursor: pointer; transition: all 0.15s; margin-bottom: 1.5rem; }
        .pg-back:hover { border-color: #cbd5e1; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .pg-heading { margin-bottom: 1.5rem; }
        .pg-heading h1 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.03em; color: #0f172a; }
        .pg-heading p  { font-size: 0.78rem; color: #94a3b8; margin-top: 4px; }
        .pg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem; }
        .pg-panel-head { padding: 1rem 1.5rem 0.9rem; border-bottom: 1px solid #f1f5f9; }
        .pg-panel-title { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .pg-panel-body  { padding: 1.5rem; }
        .pg-label { display: block; font-size: 0.72rem; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
        .pg-input, .pg-select { display: block; width: 100%; padding: 0.6rem 0.85rem; font-family: 'Sora', sans-serif; font-size: 0.845rem; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .pg-input::placeholder { color: #c1c8d4; }
        .pg-input:focus, .pg-select:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .pg-form-group { margin-bottom: 1.25rem; }
        .pg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 480px) { .pg-grid-2 { grid-template-columns: 1fr; } }
        .pg-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.8rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
        .pg-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; background: #fafbfc; }
        .pg-btn { display: inline-flex; align-items: center; gap: 7px; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500; padding: 0.55rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; line-height: 1.4; }
        .pg-btn-primary { background: #0f172a; color: #fff; }
        .pg-btn-primary:hover:not(:disabled) { background: #1e293b; box-shadow: 0 4px 12px rgba(15,23,42,0.25); transform: translateY(-1px); }
        .pg-btn-ghost { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
        .pg-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .pg-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: pg-spin 0.7s linear infinite; display: inline-block; }
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .pw-wrap { position: relative; }
        .pw-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; padding: 2px; }
        .pw-toggle:hover { color: #64748b; }
        .role-row { display: flex; gap: 0.75rem; }
        .role-pill { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; cursor: pointer; font-size: 0.8rem; font-weight: 500; font-family: 'DM Mono', monospace; letter-spacing: 0.03em; transition: all 0.15s; background: #f8fafc; color: #64748b; user-select: none; }
        .role-pill.active-user   { background: #eff6ff; border-color: #93c5fd; color: #2563eb; }
        .role-pill.active-admin  { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
        .role-pill input { display: none; }
        .role-dot { width: 7px; height: 7px; border-radius: 50%; }
        .role-dot-user  { background: #2563eb; }
        .role-dot-admin { background: #dc2626; }
      `}</style>
      <div className="pg-root">
        <div className="pg-inner">
          <button className="pg-back" onClick={() => navigate("/admin/users")}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
            Back to Users
          </button>

          <div className="pg-heading">
            <h1>Add New User</h1>
            <p>Create a new user account</p>
          </div>

          {error && (
            <div className="pg-error-banner">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.5-12.946c.866-1.5 3.032-1.5 3.898 0l6.314 10.938ZM12 15.75h.007v.008H12v-.008Z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Account Details</span></div>
              <div className="pg-panel-body">
                <div className="pg-grid-2">
                  <div className="pg-form-group">
                    <label className="pg-label">Full Name</label>
                    <input className="pg-input" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="pg-form-group">
                    <label className="pg-label">Email Address</label>
                    <input className="pg-input" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="pg-form-group">
                  <label className="pg-label">Password</label>
                  <div className="pw-wrap">
                    <input
                      className="pg-input" type={showPw ? "text" : "password"}
                      placeholder="Set a password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw
                        ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                        : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path strokeLinecap="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                      }
                    </button>
                  </div>
                </div>
                <div className="pg-form-group" style={{ marginBottom: 0 }}>
                  <label className="pg-label">Role</label>
                  <div className="role-row">
                    {["user", "admin"].map((r) => (
                      <label key={r} className={`role-pill ${role === r ? `active-${r}` : ""}`} onClick={() => setRole(r)}>
                        <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                        <span className={`role-dot role-dot-${r}`} style={{ background: role === r ? undefined : "#cbd5e1" }} />
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pg-panel">
              <div className="pg-footer">
                <button type="button" className="pg-btn pg-btn-ghost" onClick={() => navigate("/admin/users")}>Cancel</button>
                <button type="submit" className="pg-btn pg-btn-primary" disabled={saving}>
                  {saving ? <><span className="pg-spinner" /> Saving…</> : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Add User
                  </>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}