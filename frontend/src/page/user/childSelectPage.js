import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Avatar map ───────────────────────────────────────────────────────────────
const AVATARS = {
  bear:   { emoji: "🐻", bg: "#FFF0D6", border: "#FFB347" },
  cat:    { emoji: "🐱", bg: "#FFF0F5", border: "#FF9EB5" },
  dog:    { emoji: "🐶", bg: "#F0F8FF", border: "#74B9FF" },
  fox:    { emoji: "🦊", bg: "#FFF4EC", border: "#FF7043" },
  panda:  { emoji: "🐼", bg: "#F5F5F5", border: "#90A4AE" },
  rabbit: { emoji: "🐰", bg: "#FDF0FF", border: "#CE93D8" },
};

const AVATAR_OPTIONS = Object.keys(AVATARS);

const GENDER_COLORS = {
  boy:   { bg: "#E3F2FD", accent: "#1976D2" },
  girl:  { bg: "#FCE4EC", accent: "#C2185B" },
  other: { bg: "#F3E5F5", accent: "#7B1FA2" },
};

const API = "https://little-coders-production.up.railway.app/api";

export default function ChildSelectPage() {
  const navigate  = useNavigate();
  const [user,     setUser]     = useState(null);
  const [children, setChildren] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(null); // child object being edited
  const [showDelete, setShowDelete] = useState(null); // child to confirm delete
  const [form, setForm] = useState({ name: "", age: "", gender: "boy", avatar: "bear" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // ── Load parent + children ─────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = localStorage.getItem("token");
    if (!stored || !token) { navigate("/login"); return; }

    const parent = JSON.parse(stored);
    setUser(parent);

    axios
      .get(`${API}/users/${parent.id || parent._id}/children`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setChildren(res.data))
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Select child → store in session, go home ──────────────────────────────
  const handleSelect = (child) => {
    sessionStorage.setItem("activeChild", JSON.stringify(child));
    navigate("/home");
  };

  // ── Add child ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    setError("");
    if (!form.name.trim() || !form.age || !form.gender) {
      setError("Please fill in all fields."); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/users/${user.id || user._id}/children`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => [...prev, res.data.child]);
      setShowAdd(false);
      setForm({ name: "", age: "", gender: "boy", avatar: "bear" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add child.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit child ─────────────────────────────────────────────────────────────
  const openEdit = (child, e) => {
    e.stopPropagation();
    setShowEdit(child);
    setForm({ name: child.name, age: child.age, gender: child.gender, avatar: child.avatar || "bear" });
    setError("");
  };

  const handleEdit = async () => {
    setError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API}/users/${user.id || user._id}/children/${showEdit._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => prev.map(c => c._id === showEdit._id ? res.data.child : c));
      setShowEdit(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update child.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete child ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API}/users/${user.id || user._id}/children/${showDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => prev.filter(c => c._id !== showDelete._id));
      setShowDelete(null);
    } catch {
      setError("Failed to delete child.");
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>Little Coders</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.parentName}>Hi, {user?.name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* Title */}
      <div style={styles.titleWrap}>
        <h1 style={styles.title}>Who's playing today?</h1>
        <p style={styles.subtitle}>Pick your profile to start your coding adventure!</p>
      </div>

      {/* Profiles grid */}
      <div style={styles.grid}>
        {children.map(child => {
          const av  = AVATARS[child.avatar] || AVATARS.bear;
          const gc  = GENDER_COLORS[child.gender] || GENDER_COLORS.other;
          return (
            <div
              key={child._id}
              style={{ ...styles.card, background: gc.bg, borderColor: gc.accent }}
              onClick={() => handleSelect(child)}
            >
              {/* Edit / Delete buttons */}
              <div style={styles.cardActions}>
                <button
                  style={styles.iconBtn}
                  onClick={e => openEdit(child, e)}
                  title="Edit"
                >✏️</button>
                <button
                  style={{ ...styles.iconBtn, background: "#FFEBEE" }}
                  onClick={e => { e.stopPropagation(); setShowDelete(child); }}
                  title="Delete"
                >🗑️</button>
              </div>

              {/* Avatar */}
              <div style={{ ...styles.avatarCircle, background: av.bg, border: `4px solid ${av.border}` }}>
                <span style={styles.avatarEmoji}>{av.emoji}</span>
              </div>

              <div style={styles.childName}>{child.name}</div>
              <div style={{ ...styles.childMeta, color: gc.accent }}>
                Age {child.age} · {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
              </div>

              {/* Play button */}
              <button
                style={{ ...styles.playBtn, background: gc.accent }}
                onClick={e => { e.stopPropagation(); handleSelect(child); }}
              >
                ▶ Play
              </button>
            </div>
          );
        })}

        {/* Add child card */}
        <div
          style={styles.addCard}
          onClick={() => { setShowAdd(true); setForm({ name: "", age: "", gender: "boy", avatar: "bear" }); setError(""); }}
        >
          <div style={styles.addIcon}>＋</div>
          <div style={styles.addLabel}>Add Child</div>
        </div>
      </div>

      {/* ── Add Modal ── */}
      {showAdd && (
        <Modal title="Add a Child Profile" onClose={() => setShowAdd(false)}>
          <ChildForm form={form} setForm={setForm} error={error} />
          <ModalFooter
            onCancel={() => setShowAdd(false)}
            onConfirm={handleAdd}
            confirmLabel={saving ? "Saving..." : "Add Profile 🎉"}
            disabled={saving}
          />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && (
        <Modal title="Edit Child Profile" onClose={() => setShowEdit(null)}>
          <ChildForm form={form} setForm={setForm} error={error} />
          <ModalFooter
            onCancel={() => setShowEdit(null)}
            onConfirm={handleEdit}
            confirmLabel={saving ? "Saving..." : "Save Changes ✅"}
            disabled={saving}
          />
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDelete && (
        <Modal title="Remove Profile?" onClose={() => setShowDelete(null)}>
          <p style={{ textAlign: "center", color: "#555", fontSize: "1rem" }}>
            Are you sure you want to remove <strong>{showDelete.name}</strong>'s profile?<br />
            <span style={{ color: "#e53935", fontSize: "0.9rem" }}>
              All their progress will be lost.
            </span>
          </p>
          <ModalFooter
            onCancel={() => setShowDelete(null)}
            onConfirm={handleDelete}
            confirmLabel="Yes, Remove"
            danger
          />
        </Modal>
      )}
    </div>
  );
}

// ── Child Form ────────────────────────────────────────────────────────────────
function ChildForm({ form, setForm, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Name */}
      <div>
        <label style={styles.label}>Child's Name</label>
        <input
          style={styles.input}
          placeholder="e.g. Alex"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Age */}
      <div>
        <label style={styles.label}>Age</label>
        <input
          style={styles.input}
          type="number"
          min={3}
          max={17}
          placeholder="e.g. 8"
          value={form.age}
          onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
        />
      </div>

      {/* Gender */}
      <div>
        <label style={styles.label}>Gender</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {["boy", "girl", "other"].map(g => (
            <button
              key={g}
              onClick={() => setForm(f => ({ ...f, gender: g }))}
              style={{
                flex: 1, padding: "10px", borderRadius: "12px", border: "2px solid",
                cursor: "pointer", fontWeight: "700", fontSize: "0.9rem",
                fontFamily: "inherit",
                borderColor: form.gender === g ? GENDER_COLORS[g].accent : "#ddd",
                background:  form.gender === g ? GENDER_COLORS[g].bg     : "#fafafa",
                color:       form.gender === g ? GENDER_COLORS[g].accent  : "#888",
              }}
            >
              {g === "boy" ? "👦 Boy" : g === "girl" ? "👧 Girl" : "🧒 Other"}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div>
        <label style={styles.label}>Choose Avatar</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {Object.entries(AVATARS).map(([key, av]) => (
            <button
              key={key}
              onClick={() => setForm(f => ({ ...f, avatar: key }))}
              style={{
                width: "60px", height: "60px", borderRadius: "50%",
                border: `3px solid ${form.avatar === key ? av.border : "#ddd"}`,
                background: av.bg, cursor: "pointer", fontSize: "1.8rem",
                transition: "transform 0.15s",
                transform: form.avatar === key ? "scale(1.2)" : "scale(1)",
              }}
            >
              {av.emoji}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ color: "#e53935", fontSize: "0.88rem", textAlign: "center", margin: 0 }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ── Reusable Modal ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmLabel, disabled, danger }) {
  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
      <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      <button
        style={{
          ...styles.confirmBtn,
          background: danger
            ? "linear-gradient(135deg, #e53935, #c62828)"
            : "linear-gradient(135deg, #43e97b, #38f9d7)",
          color: danger ? "#fff" : "#1a5c3a",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={onConfirm}
        disabled={disabled}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ ...styles.page, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}>🎮</div>
      <p style={{ fontFamily: "'Comic Sans MS', cursive", color: "#667eea", marginTop: "12px" }}>
        Loading profiles…
      </p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #e0f7fa 0%, #fce4ec 50%, #ede7f6 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 1rem 3rem",
  },
  blob1: {
    position: "absolute", top: "-80px", left: "-80px",
    width: "320px", height: "320px", borderRadius: "50%",
    background: "rgba(255,183,77,0.18)", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: "-60px", right: "-60px",
    width: "280px", height: "280px", borderRadius: "50%",
    background: "rgba(102,126,234,0.15)", pointerEvents: "none",
  },
  blob3: {
    position: "absolute", top: "40%", left: "60%",
    width: "200px", height: "200px", borderRadius: "50%",
    background: "rgba(67,233,123,0.1)", pointerEvents: "none",
  },
  header: {
    width: "100%", maxWidth: "960px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1.2rem 0",
  },
  headerLeft: { display: "flex", alignItems: "center" },
  headerRight: { display: "flex", alignItems: "center", gap: "14px" },
  logo: { fontSize: "1.3rem", fontWeight: "700", color: "#667eea" },
  parentName: { color: "#555", fontSize: "0.95rem" },
  logoutBtn: {
    background: "transparent", border: "2px solid #ccc",
    borderRadius: "50px", padding: "5px 16px",
    cursor: "pointer", color: "#888", fontSize: "0.88rem",
    fontFamily: "inherit",
  },
  titleWrap: { textAlign: "center", margin: "1.5rem 0 2.5rem" },
  title: {
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
    fontWeight: "700", color: "#3d2c8d",
    margin: 0, textShadow: "2px 3px 0 rgba(102,126,234,0.15)",
  },
  subtitle: { color: "#777", fontSize: "1rem", marginTop: "6px" },
  grid: {
    display: "flex", flexWrap: "wrap",
    gap: "24px", justifyContent: "center",
    maxWidth: "960px", width: "100%",
  },
  card: {
    position: "relative",
    width: "180px", minHeight: "240px",
    borderRadius: "24px", border: "3px solid",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "1.5rem 1rem 1rem",
    cursor: "pointer", gap: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardActions: {
    position: "absolute", top: "10px", right: "10px",
    display: "flex", gap: "4px",
  },
  iconBtn: {
    background: "#fff8", border: "none", borderRadius: "8px",
    width: "28px", height: "28px", cursor: "pointer",
    fontSize: "0.85rem", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  avatarCircle: {
    width: "90px", height: "90px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarEmoji: { fontSize: "3rem" },
  childName: {
    fontSize: "1.15rem", fontWeight: "700",
    color: "#333", textAlign: "center",
  },
  childMeta: { fontSize: "0.8rem", fontWeight: "600" },
  playBtn: {
    marginTop: "6px", color: "#fff", border: "none",
    borderRadius: "50px", padding: "8px 24px",
    fontWeight: "700", cursor: "pointer",
    fontSize: "0.95rem", fontFamily: "inherit",
    boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
    transition: "transform 0.1s",
  },
  addCard: {
    width: "180px", minHeight: "240px",
    borderRadius: "24px", border: "3px dashed #bbb",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", gap: "12px",
    background: "rgba(255,255,255,0.6)",
    transition: "border-color 0.2s, background 0.2s",
  },
  addIcon: { fontSize: "2.5rem", color: "#aaa" },
  addLabel: { fontSize: "1rem", color: "#aaa", fontWeight: "700" },
  label: {
    display: "block", marginBottom: "6px",
    fontSize: "0.9rem", fontWeight: "700", color: "#555",
  },
  input: {
    width: "100%", padding: "10px 14px",
    borderRadius: "12px", border: "2px solid #ddd",
    fontSize: "1rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  },
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)", zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    background: "#fff", borderRadius: "24px",
    padding: "0", maxWidth: "480px", width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  modalTitle: {
    color: "#fff", fontWeight: "700", fontSize: "1.15rem",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)", border: "none",
    color: "#fff", borderRadius: "50%", width: "30px", height: "30px",
    cursor: "pointer", fontSize: "0.9rem",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modalBody: { padding: "24px" },
  cancelBtn: {
    background: "#f5f5f5", border: "2px solid #ddd",
    borderRadius: "50px", padding: "8px 20px",
    cursor: "pointer", color: "#666",
    fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem",
  },
  confirmBtn: {
    border: "none", borderRadius: "50px", padding: "8px 24px",
    fontWeight: "700", fontSize: "0.9rem",
    fontFamily: "inherit", cursor: "pointer",
    boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
  },
};