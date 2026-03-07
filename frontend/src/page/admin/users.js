import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;gap:1rem;flex-wrap:wrap;}
.ds-topbar h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-topbar p{font-size:.78rem;color:#94a3b8;margin-top:2px;}
.ds-search-wrap{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;}
.ds-search{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;transition:border-color .15s;min-width:260px;}
.ds-search:focus-within{border-color:#2563eb;}
.ds-search svg{flex-shrink:0;color:#94a3b8;}
.ds-search input{border:none;outline:none;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:transparent;width:100%;}
.ds-search input::placeholder{color:#c1c8d4;}
.ds-btn-add{display:inline-flex;align-items:center;gap:6px;background:#1e293b;color:#fff;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.2rem;border-radius:9px;border:none;cursor:pointer;text-decoration:none;transition:all .15s;}
.ds-btn-add:hover{background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);transform:translateY(-1px);color:#fff;}
.ds-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;}
.ds-table{width:100%;border-collapse:collapse;}
.ds-table thead tr{border-bottom:1px solid #f1f5f9;}
.ds-table th{text-align:left;font-size:.65rem;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;padding:.9rem 1.25rem;font-weight:500;}
.ds-table td{padding:.85rem 1.25rem;font-size:.8rem;color:#64748b;border-bottom:1px solid #f8fafc;vertical-align:middle;}
.ds-table tr:last-child td{border-bottom:none;}
.ds-table td:first-child{color:#0f172a;font-weight:500;}
.ds-table tbody tr:hover{background:#f8fafc;}
.ds-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:.72rem;flex-shrink:0;}
.ds-user-cell{display:flex;align-items:center;gap:10px;}
.ds-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:99px;font-size:.65rem;font-family:'DM Mono',monospace;letter-spacing:.04em;text-transform:uppercase;font-weight:500;}
.ds-badge-admin{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
.ds-badge-user{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;}
.ds-action-btn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1.5px solid;cursor:pointer;transition:all .15s;background:none;}
.ds-action-btn.edit{border-color:#fde68a;color:#d97706;}
.ds-action-btn.edit:hover{background:#fffbeb;}
.ds-action-btn.del{border-color:#fecaca;color:#dc2626;}
.ds-action-btn.del:hover{background:#fef2f2;}
.ds-empty{text-align:center;padding:2.5rem;color:#94a3b8;font-size:.82rem;}

/* Modal overlay */
.ds-overlay{position:fixed;inset:0;background:rgba(15,23,42,.4);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;}
.ds-modal{background:#fff;border-radius:16px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:fadeUp .2s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.ds-modal-head{padding:1.2rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;}
.ds-modal-head h3{font-size:.95rem;font-weight:600;color:#0f172a;}
.ds-modal-close{width:28px;height:28px;border-radius:7px;border:1.5px solid #e2e8f0;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;transition:all .15s;}
.ds-modal-close:hover{background:#f1f5f9;}
.ds-modal-body{padding:1.5rem;}
.ds-modal-foot{padding:1rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;background:#fafbfc;}
.ds-label{font-size:.72rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#94a3b8;font-family:'DM Mono',monospace;margin-bottom:.5rem;display:block;}
.ds-input,.ds-select{width:100%;padding:.6rem .9rem;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s;margin-bottom:1rem;}
.ds-input:focus,.ds-select:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.5rem 1.25rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;color:#374151;}
.ds-btn-primary{background:#1e293b;color:#fff;}
.ds-btn-primary:hover{background:#0f172a;}
.ds-btn-danger{background:#dc2626;color:#fff;}
.ds-btn-danger:hover{background:#b91c1c;}
.ds-confirm-icon{width:48px;height:48px;border-radius:12px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}
.ds-confirm-icon svg{width:22px;height:22px;stroke:#dc2626;}
.ds-confirm-text{text-align:center;font-size:.85rem;color:#64748b;line-height:1.6;}
.ds-confirm-text strong{color:#0f172a;display:block;margin-bottom:.35rem;font-size:.92rem;}
`;

function Avatar({ name = "?" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = name.charCodeAt(0) * 37 % 360;
  return (
    <div className="ds-avatar" style={{ background: `hsl(${hue},55%,48%)` }}>{initials}</div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://little-coders-production.up.railway.app/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://little-coders-production.up.railway.app/api/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== deleteUserId));
      setShowDeleteModal(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://little-coders-production.up.railway.app/api/users/${editUser._id}`,
        { name: editUser.name, email: editUser.email, role: editUser.role },
        { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map((u) => (u._id === editUser._id ? editUser : u)));
      setShowEditModal(false);
    } catch (err) { console.error(err); }
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-topbar">
          <div>
            <h1>Users</h1>
            <p>{users.length} total accounts</p>
          </div>
          <div className="ds-search-wrap">
            <div className="ds-search">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
              <input type="text" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>
            <Link to="/admin/users/add" className="ds-btn-add">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Add User
            </Link>
          </div>
        </div>

        <div className="ds-panel">
          <table className="ds-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((user, index) => (
                <tr key={user._id}>
                  <td>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:".7rem",color:"#94a3b8"}}>{String(index+1).padStart(2,"0")}</span>
                  </td>
                  <td>
                    <div className="ds-user-cell">
                      <Avatar name={user.name}/>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td style={{fontFamily:"'DM Mono',monospace",fontSize:".75rem"}}>{user.email}</td>
                  <td><span className={`ds-badge ds-badge-${user.role}`}>{user.role}</span></td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="ds-action-btn edit" onClick={() => { setEditUser(user); setShowEditModal(true); }}
                        title="Edit">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"/>
                        </svg>
                      </button>
                      <button className="ds-action-btn del" onClick={() => { setDeleteUserId(user._id); setShowDeleteModal(true); }}
                        title="Delete">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5"><div className="ds-empty">No users found.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirm Modal */}
        {showDeleteModal && (
          <div className="ds-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ds-modal-head">
                <h3>Delete User</h3>
                <button className="ds-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
              </div>
              <div className="ds-modal-body">
                <div className="ds-confirm-icon">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                  </svg>
                </div>
                <div className="ds-confirm-text">
                  <strong>Are you sure?</strong>
                  This will permanently remove the user and all their data.
                </div>
              </div>
              <div className="ds-modal-foot">
                <button className="ds-btn ds-btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="ds-btn ds-btn-danger" onClick={handleDelete}>Delete User</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editUser && (
          <div className="ds-overlay" onClick={() => setShowEditModal(false)}>
            <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ds-modal-head">
                <h3>Edit User</h3>
                <button className="ds-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              <div className="ds-modal-body">
                <label className="ds-label">Full Name</label>
                <input className="ds-input" type="text" value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}/>
                <label className="ds-label">Email Address</label>
                <input className="ds-input" type="email" value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}/>
                <label className="ds-label">Role</label>
                <select className="ds-select" value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="ds-modal-foot">
                <button className="ds-btn ds-btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="ds-btn ds-btn-primary" onClick={handleUpdateUser}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}