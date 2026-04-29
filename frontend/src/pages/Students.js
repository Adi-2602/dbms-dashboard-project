import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .stud-root {
    min-height: 100vh;
    background-color: #fafafa;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 3rem 2.5rem;
    color: #111827;
  }

  /* Header Section */
  .stud-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
  .stud-header-info h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.04em;
    color: #111827;
  }
  .stud-header-info p {
    color: #6b7280;
    margin: 6px 0 0;
    font-size: 15px;
    font-weight: 400;
  }

  .stud-btn-primary {
    background: #000000;
    color: #ffffff;
    border: 1px solid #000000;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .stud-btn-primary:hover {
    background: #374151;
    border-color: #374151;
  }

  /* Stats Bar */
  .stud-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 2.5rem;
  }
  .stud-stat-card {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }
  .stud-stat-label {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 8px;
  }
  .stud-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.02em;
  }

  /* Controls Section */
  .stud-controls {
    display: flex;
    margin-bottom: 1.5rem;
  }
  .stud-search-wrap {
    flex: 1;
    position: relative;
  }
  .stud-search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9ca3af;
  }
  .stud-search {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: #111827;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    box-sizing: border-box;
  }
  .stud-search::placeholder { color: #9ca3af; }
  .stud-search:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 1px #000000;
  }

  /* Table Styling */
  .stud-card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  .stud-table-container { overflow-x: auto; }
  .stud-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    text-align: left;
  }
  .stud-table th {
    background: #f9fafb;
    padding: 14px 20px;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .stud-table td {
    padding: 14px 20px;
    border-bottom: 1px solid #f3f4f6;
    color: #111827;
    vertical-align: middle;
  }
  .stud-table tr:last-child td { border-bottom: none; }
  .stud-table tr:hover { background: #f9fafb; }

  .stud-avatar {
    width: 32px; height: 32px;
    background: #f3f4f6;
    color: #374151;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 12px;
    border: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .stud-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #4b5563;
    background: #f3f4f6;
    padding: 4px 6px;
    border-radius: 4px;
  }

  .stud-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }
  .stud-badge-emerald { background: #ecfdf5; color: #059669; }

  /* Actions */
  .stud-row-actions { display: flex; gap: 8px; }
  .stud-btn-icon {
    width: 32px; height: 32px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; color: #6b7280;
  }
  .stud-btn-icon:hover {
    background: #f3f4f6; color: #111827;
    border-color: #e5e7eb;
  }
  .stud-btn-icon.del:hover {
    background: #fef2f2; color: #dc2626; border-color: #fca5a5;
  }

  /* Modal */
  .stud-overlay {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: stud-fade-in 0.2s ease-out;
  }
  @keyframes stud-fade-in { from { opacity: 0; } to { opacity: 1; } }

  .stud-modal {
    background: #ffffff;
    width: 100%; max-width: 600px;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    animation: stud-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes stud-modal-in {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .stud-modal-head {
    padding: 24px 32px;
    border-bottom: 1px solid #e5e7eb;
    display: flex; justify-content: space-between; align-items: center;
  }
  .stud-modal-head h2 { font-size: 18px; font-weight: 600; margin: 0; color: #111827;}
  .stud-modal-body { padding: 32px; max-height: 65vh; overflow-y: auto; }
  .stud-field { margin-bottom: 20px; }
  .stud-label { 
    font-size: 13px; font-weight: 500; color: #374151; display: block; margin-bottom: 6px;
  }
  .stud-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px; font-size: 14px;
    box-sizing: border-box; font-family: inherit;
    background: #fff;
    transition: all 0.2s ease;
  }
  .stud-input:focus { 
    outline: none; border-color: #000000; box-shadow: 0 0 0 1px #000000; 
  }
  
  .stud-modal-foot {
    padding: 20px 32px; background: #f9fafb;
    display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e5e7eb;
  }
  .stud-btn-secondary {
    background: #fff; color: #374151; border: 1px solid #d1d5db;
    padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  }
  .stud-btn-secondary:hover { background: #f9fafb; color: #111827; }

  /* Pagination */
  .stud-pagination {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    padding: 16px; background: #ffffff; border-top: 1px solid #e5e7eb;
  }
  .stud-pg-btn {
    min-width: 36px; height: 36px; border-radius: 6px;
    border: 1px solid transparent; background: transparent;
    color: #4b5563; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .stud-pg-btn:hover:not(:disabled) { background: #f3f4f6; color: #111827; }
  .stud-pg-btn.active { background: #f3f4f6; color: #111827; font-weight: 600; border: 1px solid #e5e7eb; }
  .stud-pg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Empty State */
  .stud-empty { padding: 5rem 2rem; text-align: center; color: #6b7280; }
  .stud-empty-icon { font-size: 40px; margin-bottom: 1rem; opacity: 0.5; }

  @media (max-width: 640px) {
    .stud-root { padding: 1.5rem 1rem; }
    .stud-header { flex-direction: column; align-items: flex-start; }
    .stud-btn-primary { width: 100%; justify-content: center; }
  }
`;

function Students() {
  const PAGE_SIZE = 30;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch Students Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const CORE_FIELDS = ["registerNo", "name", "department", "semester", "email", "phone"];

  const findVal = (obj, possibleKeys) => {
    if (!obj) return undefined;
    for (let k of possibleKeys) {
      if (obj[k] !== undefined) return obj[k];
    }
    const normalized = Object.keys(obj).reduce((acc, k) => {
      acc[k.toLowerCase().replace(/\s/g, "")] = k;
      return acc;
    }, {});
    for (let pk of possibleKeys) {
      const nk = pk.toLowerCase().replace(/\s/g, "");
      if (normalized[nk]) return obj[normalized[nk]];
    }
    return undefined;
  };

  const TABLE_COLUMNS = [
    { label: "Reg No", keys: ["registerNo", "Register No", "Reg No", "Registration Number", "registerNumber"] },
    { label: "Name", keys: ["name", "Name", "Student Name", "studentName"] },
    { label: "Dept", keys: ["department", "Dept", "Department", "Branch"] },
    { label: "Sem", keys: ["semester", "Sem", "Semester"] },
    { label: "Email", keys: ["email", "Email", "Official Email", "New Official Email"] },
    { label: "Phone", keys: ["phone", "Phone", "Mobile No", "Mobile Number", "Contact Number"] }
  ];

  // Dynamically determine columns based on data + core fields
  const columns = useMemo(() => {
    const keys = new Set(CORE_FIELDS);
    students.forEach(s => {
      Object.keys(s).forEach(k => {
        if (!["_id", "__v", "createdAt", "updatedAt"].includes(k)) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys);
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      Object.values(s).some(v => String(v).toLowerCase().includes(q))
    );
  }, [students, search]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const pagedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  useEffect(() => {
    setPage(1); // Reset to first page on search
  }, [search]);

  const openModal = (student = null) => {
    if (student) {
      setForm(student);
      setEditingId(student._id);
    } else {
      // Default form with common keys if any, or empty
      const defaultForm = {};
      columns.forEach(c => defaultForm[c] = "");
      setForm(defaultForm);
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await API.put(`/students/${editingId}`, form);
      } else {
        await API.post("/students", form);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving student data");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const renderVal = (v) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "object") {
      const keys = Object.keys(v);
      if (keys.length > 0) return String(v[keys[0]]); // Extracts phone from {" (FA)":8940830755}
      return JSON.stringify(v);
    }
    return String(v);
  };

  const getInitials = (name) => {
    const n = renderVal(name);
    return n.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="stud-root">
      <style>{styles}</style>

      {/* Header */}
      <header className="stud-header">
        <div className="stud-header-info">
          <h1>Students Dashboard</h1>
          <p>Manage student records, enrollment, and academic details.</p>
        </div>
        <div className="stud-actions">
          <button className="stud-btn-primary" onClick={() => openModal()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Student
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stud-stats">
        <div className="stud-stat-card">
          <div className="stud-stat-label">Total Enrollment</div>
          <div className="stud-stat-value">{students.length}</div>
        </div>
        <div className="stud-stat-card">
          <div className="stud-stat-label">Matching Results</div>
          <div className="stud-stat-value">{filteredStudents.length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="stud-controls">
        <div className="stud-search-wrap">
          <svg className="stud-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            className="stud-search"
            placeholder="Search by any field (name, register no, department...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="stud-card">
        <div className="stud-table-container">
          {loading ? (
            <div className="stud-empty">
              <div className="stud-empty-icon">⏳</div>
              <p>Fetching student database...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="stud-empty">
              <div className="stud-empty-icon">📂</div>
              <p>No student records found in the database.</p>
            </div>
          ) : (
            <>
              <table className="stud-table">
                <thead>
                <tr>
                  <th>#</th>
                  {TABLE_COLUMNS.map(col => <th key={col.label}>{col.label}</th>)}
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    {TABLE_COLUMNS.map(col => {
                      const val = findVal(s, col.keys);
                      const isName = col.label === 'Name';
                      const isCode = col.label === 'Reg No';
                      const isEmail = col.label === 'Email';
                      const isSem = col.label === 'Sem';

                      return (
                        <td key={col.label}>
                          {isName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="stud-avatar">{getInitials(val)}</div>
                              <span style={{ fontWeight: '600' }}>{renderVal(val)}</span>
                            </div>
                          ) : isCode ? (
                            <span className="stud-mono">{renderVal(val)}</span>
                          ) : isSem ? (
                            <span className="stud-badge stud-badge-emerald">Sem {renderVal(val)}</span>
                          ) : isEmail ? (
                            <span style={{ color: '#6366f1', textDecoration: 'underline', fontSize: '13px' }}>{renderVal(val)}</span>
                          ) : (
                            <span>{renderVal(val)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'right' }}>
                      <div className="stud-row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="stud-btn-icon" title="Edit" onClick={() => openModal(s)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="stud-btn-icon del" title="Delete" onClick={() => handleDelete(s._id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pagedStudents.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length + 2} className="stud-empty">
                      No students match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="stud-pagination">
                <button 
                  className="stud-pg-btn" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .map((n, i, arr) => (
                    <React.Fragment key={n}>
                      {i > 0 && arr[i-1] !== n - 1 && <span style={{ color: '#94a3b8' }}>...</span>}
                      <button 
                        className={`stud-pg-btn ${page === n ? 'active' : ''}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))
                }

                <button 
                  className="stud-pg-btn" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="stud-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="stud-modal">
            <div className="stud-modal-head">
              <h2>{editingId ? "Edit Student Details" : "Register New Student"}</h2>
              <button className="stud-btn-icon" onClick={() => setShowModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="stud-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {columns.map((field) => (
                  <div className="stud-field" key={field} style={{ gridColumn: field.toLowerCase().includes('name') || field.toLowerCase().includes('email') ? 'span 2' : 'span 1', marginBottom: 0 }}>
                    <label className="stud-label">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input
                      className="stud-input"
                      placeholder={`Enter ${field}`}
                      value={form[field] || ""}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="stud-modal-foot">
              <button className="stud-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="stud-btn-primary" onClick={handleSave}>
                {editingId ? "Update Record" : "Save Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;