

import React, { useEffect, useState } from "react";
import API from "../services/api";

// ── helper ──────────────────────────────────────────────────────────────────
function initials(name = "") {
  const parts = name.replace(/Dr\.\s*/i, "").split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function DesignationBadge({ des = "" }) {
  let cls = "badge-prof";
  let label = "Professor";
  if (des.includes("Head") || des.includes("Dean") || des.includes("Director")) { cls = "badge-head"; label = "Admin"; }
  else if (des.includes("Adjunct")) { cls = "badge-adj"; label = "Adjunct"; }
  else if (des.includes("Emeritus")) { cls = "badge-adj"; label = "Emeritus"; }
  return <span className={`faculty-badge ${cls}`}>{label}</span>;
}

// ── component ────────────────────────────────────────────────────────────────
export default function Faculty() {
  const [faculty, setFaculty]     = useState([]);
  const [search, setSearch]       = useState("");
  const [filterDes, setFilterDes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: "", designation: "", mobile: "", email: "" });
  const [editId, setEditId]       = useState(null);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchFaculty(); }, []);

  const fetchFaculty = async () => {
    const res = await API.get("/faculty");
    setFaculty(res.data);
  };

  // ── CRUD ──
  const saveFaculty = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await API.put(`/faculty/${editId}`, form);
    } else {
      await API.post("/faculty", form);
    }
    closeModal();
    fetchFaculty();
  };

  const deleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty member?")) return;
    await API.delete(`/faculty/${id}`);
    fetchFaculty();
  };

  const openEdit = (f) => {
    setEditId(f._id);
    setForm({ name: f.name ?? "", designation: f.designation ?? "", mobile: f.mobile ?? "", email: f.email ?? "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: "", designation: "", mobile: "", email: "" });
  };

  // ── derived data ──
  const filtered = faculty.filter((f) =>
    (!search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(f.facultyId ?? "").includes(search)) &&
    (!filterDes || f.designation === filterDes)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:    faculty.length,
    prof:     faculty.filter((f) => f.designation?.includes("Professor") && !f.designation?.includes("Adjunct")).length,
    adjunct:  faculty.filter((f) => f.designation?.includes("Adjunct")).length,
    admin:    faculty.filter((f) => f.designation?.includes("Head") || f.designation?.includes("Dean") || f.designation?.includes("Director")).length,
  };

  // ── dynamic columns (your existing logic, kept intact) ──
  const columns = faculty.length
    ? Object.keys(faculty[0]).filter((c) => c !== "_id" && c !== "__v")
    : [];

  if (faculty.length === 0) {
    return <h3 className="text-center mt-4">No Faculty Data</h3>;
  }

  return (
    <>
      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style>{`
        .faculty-page { padding: 2rem 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        /* top bar */
        .faculty-topbar { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem; }
        .faculty-title  { font-size:22px; font-weight:600; margin:0; }
        .faculty-sub    { font-size:13px; color:#6b7280; margin:2px 0 0; }
        .faculty-add-btn { padding:8px 18px; background:#111; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; white-space:nowrap; }
        .faculty-add-btn:hover { background:#333; }

        /* stat cards */
        .faculty-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:10px; margin-bottom:1.5rem; }
        .faculty-stat  { background:#f3f4f6; border-radius:8px; padding:12px 14px; }
        .faculty-stat.hl { background:#eff6ff; }
        .faculty-stat-label { font-size:11px; color:#6b7280; margin-bottom:4px; }
        .faculty-stat.hl .faculty-stat-label { color:#3b82f6; }
        .faculty-stat-val { font-size:22px; font-weight:600; }
        .faculty-stat.hl .faculty-stat-val { color:#2563eb; }

        /* toolbar */
        .faculty-toolbar { display:flex; gap:10px; margin-bottom:1rem; flex-wrap:wrap; align-items:center; }
        .faculty-search  { flex:1; min-width:180px; padding:8px 12px 8px 32px; border:1px solid #e5e7eb; border-radius:8px; font-size:13px; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 10px center; }
        .faculty-search:focus { outline:none; border-color:#6366f1; }
        .faculty-filter  { padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; font-size:13px; background:#fff; cursor:pointer; }

        /* table */
        .faculty-table-wrap { border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
        .faculty-table { width:100%; border-collapse:collapse; font-size:13px; }
        .faculty-table thead { background:#f9fafb; }
        .faculty-table th { padding:10px 12px; text-align:left; font-weight:500; font-size:12px; color:#6b7280; border-bottom:1px solid #e5e7eb; white-space:nowrap; }
        .faculty-table td { padding:10px 12px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
        .faculty-table tr:last-child td { border-bottom:none; }
        .faculty-table tr:hover td { background:#fafafa; }

        /* avatar + name */
        .faculty-name-cell { display:flex; align-items:center; gap:8px; }
        .faculty-avatar { width:28px; height:28px; border-radius:50%; background:#dbeafe; color:#1d4ed8; display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:600; flex-shrink:0; }

        /* badges */
        .faculty-badge { display:inline-block; padding:2px 8px; border-radius:100px; font-size:11px; font-weight:500; }
        .badge-prof { background:#dbeafe; color:#1d4ed8; }
        .badge-adj  { background:#fef9c3; color:#854d0e; }
        .badge-head { background:#dcfce7; color:#166534; }

        /* action buttons */
        .faculty-btn-edit { padding:3px 10px; border:1px solid #e5e7eb; border-radius:6px; background:#fff; color:#374151; font-size:11px; cursor:pointer; margin-right:4px; }
        .faculty-btn-edit:hover { background:#f3f4f6; }
        .faculty-btn-del  { padding:3px 10px; border:1px solid #fecaca; border-radius:6px; background:#fff; color:#dc2626; font-size:11px; cursor:pointer; }
        .faculty-btn-del:hover { background:#fef2f2; }

        /* pagination */
        .faculty-pagination { display:flex; align-items:center; justify-content:space-between; margin-top:1rem; font-size:13px; color:#6b7280; flex-wrap:wrap; gap:8px; }
        .faculty-pg-btn { padding:4px 10px; border:1px solid #e5e7eb; border-radius:6px; background:#fff; color:#374151; font-size:12px; cursor:pointer; }
        .faculty-pg-btn:hover,.faculty-pg-btn.active { background:#f3f4f6; font-weight:500; }

        /* modal */
        .faculty-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:1000; display:flex; align-items:center; justify-content:center; }
        .faculty-modal { background:#fff; border-radius:12px; padding:1.5rem; width:380px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.15); }
        .faculty-modal-title { font-size:16px; font-weight:600; margin-bottom:1rem; }
        .faculty-form-group { margin-bottom:12px; }
        .faculty-form-label { font-size:12px; color:#6b7280; display:block; margin-bottom:4px; }
        .faculty-form-input { width:100%; padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; font-size:13px; box-sizing:border-box; }
        .faculty-form-input:focus { outline:none; border-color:#6366f1; }
        .faculty-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:1.25rem; }
        .faculty-cancel-btn { padding:7px 14px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; color:#374151; font-size:13px; cursor:pointer; }
        .faculty-save-btn { padding:7px 14px; background:#111; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; }
        .faculty-save-btn:hover { background:#333; }
      `}</style>

      <div className="faculty-page">

        {/* Top bar */}
        <div className="faculty-topbar">
          <div>
            <h2 className="faculty-title">Faculty</h2>
            <p className="faculty-sub">Department Directory</p>
          </div>
          <button className="faculty-add-btn" onClick={() => setShowModal(true)}>
            + Add Faculty
          </button>
        </div>

        {/* Stats */}
        <div className="faculty-stats">
          <div className="faculty-stat hl">
            <div className="faculty-stat-label">Total Faculty</div>
            <div className="faculty-stat-val">{stats.total}</div>
          </div>
          <div className="faculty-stat">
            <div className="faculty-stat-label">Professors</div>
            <div className="faculty-stat-val">{stats.prof}</div>
          </div>
          <div className="faculty-stat">
            <div className="faculty-stat-label">Adjunct</div>
            <div className="faculty-stat-val">{stats.adjunct}</div>
          </div>
          <div className="faculty-stat">
            <div className="faculty-stat-label">Admin Roles</div>
            <div className="faculty-stat-val">{stats.admin}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="faculty-toolbar">
          <input
            className="faculty-search"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="faculty-filter"
            value={filterDes}
            onChange={(e) => { setFilterDes(e.target.value); setPage(1); }}
          >
            <option value="">All designations</option>
            <option value="Professor">Professor</option>
            <option value="Adjunct Professor">Adjunct Professor</option>
            <option value="Professor & Head">Professor &amp; Head</option>
          </select>
        </div>

        {/* Table */}
        <div className="faculty-table-wrap">
          <table className="faculty-table">
            <thead>
              <tr>
                <th>#</th>
                {columns.map((col) => <th key={col}>{col}</th>)}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={columns.length + 2} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>No results found</td></tr>
              ) : paginated.map((f, i) => (
                <tr key={f._id}>
                  <td style={{ color: "#9ca3af" }}>{(page - 1) * PER_PAGE + i + 1}</td>
                  {columns.map((col) => (
                    <td key={col}>
                      {col === "name" ? (
                        <div className="faculty-name-cell">
                          <div className="faculty-avatar">{initials(f[col])}</div>
                          <span>{f[col]}</span>
                        </div>
                      ) : col === "designation" ? (
                        <><DesignationBadge des={f[col]} /> <span style={{ fontSize: 11, color: "#6b7280" }}>{f[col]}</span></>
                      ) : (
                        f[col]
                      )}
                    </td>
                  ))}
                  <td>
                    <button className="faculty-btn-edit" onClick={() => openEdit(f)}>Edit</button>
                    <button className="faculty-btn-del"  onClick={() => deleteFaculty(f._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="faculty-pagination">
          <span>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`faculty-pg-btn${p === page ? " active" : ""}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="faculty-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="faculty-modal">
            <div className="faculty-modal-title">{editId ? "Edit Faculty" : "Add Faculty"}</div>

            {[
              { label: "Faculty Name", key: "name",        placeholder: "Dr. Full Name" },
              { label: "Designation",  key: "designation", placeholder: "e.g. Professor" },
              { label: "Mobile No",    key: "mobile",      placeholder: "10-digit number" },
              { label: "Email ID",     key: "email",       placeholder: "name@srmist.edu.in" },
            ].map(({ label, key, placeholder }) => (
              <div className="faculty-form-group" key={key}>
                <label className="faculty-form-label">{label}</label>
                <input
                  className="faculty-form-input"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div className="faculty-modal-actions">
              <button className="faculty-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="faculty-save-btn"   onClick={saveFaculty}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


