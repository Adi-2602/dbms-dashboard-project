import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

// ── tiny SVG donut ────────────────────────────────────────────────────────────
function Donut({ slices, size = 120, thickness = 22 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap  = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.6s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ── bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, color = "#6366f1", height = 140 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 500 }}>{d.value}</span>
          <div
            style={{
              width: "100%",
              background: color,
              borderRadius: "4px 4px 0 0",
              height: `${Math.max((d.value / max) * (height - 32), 4)}px`,
              transition: "height 0.6s ease",
              opacity: 0.85,
            }}
          />
          <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color = "#6366f1", width = 80, height = 32 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

const PALETTE = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#ec4899", "#14b8a6"];

// FIX: safely convert any value (including nested objects / ObjectIds) to a renderable string
function safeVal(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") {
    // MongoDB ObjectId or any nested doc — show its string form or JSON
    return v.toString?.() !== "[object Object]" ? v.toString() : JSON.stringify(v);
  }
  return String(v);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [faculty,  setFaculty]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [now,      setNow]      = useState(new Date());

  useEffect(() => {
    Promise.all([
      API.get("/students").then((r) => setStudents(r.data)).catch(() => {}),
      API.get("/faculty").then((r) => setFaculty(r.data)).catch(() => {}),
      API.get("/subjects").then((r) => setSubjects(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));

    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  // ── derived ──
  const deptData = useMemo(() => {
    const g = groupBy(students, "department");
    return Object.entries(g).map(([label, value]) => ({ label: label.length > 8 ? label.slice(0, 8) + "…" : label, value }));
  }, [students]);

  const semData = useMemo(() => {
    const g = groupBy(students, "semester");
    return Object.entries(g).sort((a,b) => Number(a[0]) - Number(b[0])).map(([label, value]) => ({ label: `Sem ${label}`, value }));
  }, [students]);

  const desData = useMemo(() => {
    const g = groupBy(faculty, "designation");
    return Object.entries(g).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  }, [faculty]);

  const subjectCols = useMemo(() => {
    if (!subjects.length) return [];
    return Object.keys(subjects[0]).filter((c) => c !== "_id" && c !== "__v");
  }, [subjects]);

  // FIX: compute avg sem load as a plain string to avoid rendering 0 (falsy number) as a React child
  const avgSemLoad = useMemo(() => {
    if (subjects.length > 0 && semData.length > 0) {
      return (subjects.length / semData.length).toFixed(1);
    }
    return "—";
  }, [subjects, semData]);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{CSS}</style>
      <div className="db-root">

        {/* ── Welcome bar ── */}
        <div className="db-welcome">
          <div>
            <div className="db-greeting">{greeting()} 👋</div>
            <h1 className="db-title">DBMS Academic Dashboard</h1>
            <div className="db-date">{dateStr} · {timeStr}</div>
          </div>
          <div className="db-nav-pills">
            <Link to="/students" className="db-pill db-pill-indigo">Students</Link>
            <Link to="/faculty"  className="db-pill db-pill-cyan">Faculty</Link>
            <Link to="/subjects" className="db-pill db-pill-amber">Subjects</Link>
          </div>
        </div>

        {loading ? (
          <div className="db-loading">
            <div className="db-spinner" />
            <p>Fetching live data…</p>
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="db-stats">
              <StatCard label="Total Students" value={students.length} sub={`${deptData.length} departments`} color="#6366f1" spark={semData.map(d=>d.value)} />
              <StatCard label="Faculty Members" value={faculty.length}  sub={`${desData.length} designations`}  color="#06b6d4" spark={desData.map(d=>d.value)} />
              <StatCard label="Subjects Listed" value={subjects.length} sub={`${subjectCols.length} data fields`} color="#f59e0b" spark={subjects.slice(0,8).map((_,i)=>i+1)} />
              {/* FIX: use pre-computed avgSemLoad string instead of inline && expression */}
              <StatCard label="Avg Sem Load" value={avgSemLoad} sub="subjects per semester" color="#10b981" spark={[2,4,3,5,4,6,5,7]} />
            </div>

            <div className="db-grid">

              {/* ── Students by Dept bar chart ── */}
              <div className="db-card db-card-wide">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Students</div>
                    <div className="db-card-title">By Department</div>
                  </div>
                  <span className="db-badge db-badge-indigo">{students.length} total</span>
                </div>
                {deptData.length > 0
                  ? <BarChart data={deptData} color="#6366f1" height={150} />
                  : <Empty />}
              </div>

              {/* ── Students by Semester ── */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Students</div>
                    <div className="db-card-title">By Semester</div>
                  </div>
                  <span className="db-badge db-badge-purple">{semData.length} sems</span>
                </div>
                {semData.length > 0
                  ? <BarChart data={semData} color="#8b5cf6" height={150} />
                  : <Empty />}
              </div>

              {/* ── Faculty donut ── */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Faculty</div>
                    <div className="db-card-title">By Designation</div>
                  </div>
                  <span className="db-badge db-badge-cyan">{faculty.length} total</span>
                </div>
                {desData.length > 0 ? (
                  <div className="db-donut-wrap">
                    <Donut slices={desData} size={120} thickness={20} />
                    <div className="db-legend">
                      {desData.map((d, i) => (
                        <div key={i} className="db-legend-item">
                          <span className="db-legend-dot" style={{ background: d.color }} />
                          <span className="db-legend-label">{d.label}</span>
                          <span className="db-legend-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <Empty />}
              </div>

              {/* ── Recent Students ── */}
              <div className="db-card db-card-wide">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Latest</div>
                    <div className="db-card-title">Recent Students</div>
                  </div>
                  <Link to="/students" className="db-link">View all →</Link>
                </div>
                <table className="db-mini-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Reg No</th><th>Dept</th><th>Sem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(-6).reverse().map((s) => (
                      <tr key={s._id}>
                        <td><span className="db-avatar">{safeVal(s.name?.[0]).toUpperCase()}</span>{safeVal(s.name)}</td>
                        <td className="db-mono">{safeVal(s.registerNo)}</td>
                        <td>{safeVal(s.department)}</td>
                        <td><span className="db-sem-badge">S{safeVal(s.semester)}</span></td>
                      </tr>
                    ))}
                    {students.length === 0 && <tr><td colSpan={4}><Empty /></td></tr>}
                  </tbody>
                </table>
              </div>

              {/* ── Faculty list ── */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Directory</div>
                    <div className="db-card-title">Faculty</div>
                  </div>
                  <Link to="/faculty" className="db-link">View all →</Link>
                </div>
                <div className="db-faculty-list">
                  {faculty.slice(0, 6).map((f) => (
                    <div key={f._id} className="db-faculty-row">
                      <div className="db-fac-avatar">
                        {/* FIX: guard against empty strings before accessing [0] */}
                        {safeVal(f.name)
                          .replace(/Dr\.\s*/i, "")
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map(w => w[0].toUpperCase())
                          .join("")}
                      </div>
                      <div className="db-fac-info">
                        <div className="db-fac-name">{safeVal(f.name)}</div>
                        <div className="db-fac-des">{safeVal(f.designation)}</div>
                      </div>
                    </div>
                  ))}
                  {faculty.length === 0 && <Empty />}
                </div>
              </div>

              {/* ── Subjects table ── */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <div className="db-card-label">Curriculum</div>
                    <div className="db-card-title">Subjects</div>
                  </div>
                  <Link to="/subjects" className="db-link">View all →</Link>
                </div>
                {subjects.length > 0 ? (
                  <table className="db-mini-table">
                    <thead>
                      <tr>{subjectCols.slice(0,3).map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {subjects.slice(0, 6).map((s, i) => (
                        <tr key={i}>
                          {subjectCols.slice(0,3).map(c => (
                            <td key={c} className={c.toLowerCase().includes("code") ? "db-mono" : ""}>{safeVal(s[c])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty />}
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, spark = [] }) {
  return (
    <div className="db-stat" style={{ borderTop: `3px solid ${color}` }}>
      <div className="db-stat-top">
        <div>
          <div className="db-stat-label">{label}</div>
          {/* FIX: coerce value to string so React never receives a raw 0 */}
          <div className="db-stat-val" style={{ color }}>{String(value)}</div>
          <div className="db-stat-sub">{sub}</div>
        </div>
        <Sparkline values={spark.length > 1 ? spark : [0, 1]} color={color} />
      </div>
    </div>
  );
}

function Empty() {
  return <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#d1d5db", fontSize: 13 }}>No data yet</div>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .db-root {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', sans-serif;
    padding: 2rem 2rem 3rem;
    box-sizing: border-box;
  }

  /* welcome */
  .db-welcome {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%);
    border-radius: 16px;
    padding: 1.75rem 2rem;
    color: #fff;
  }
  .db-greeting { font-size: 13px; color: #a5b4fc; font-weight: 500; margin-bottom: 4px; }
  .db-title    { font-size: 22px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.02em; }
  .db-date     { font-size: 12px; color: #c7d2fe; }

  .db-nav-pills { display: flex; gap: 8px; flex-wrap: wrap; align-self: center; }
  .db-pill {
    padding: 7px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: opacity 0.15s, transform 0.1s;
    display: inline-block;
  }
  .db-pill:hover { opacity: 0.85; transform: translateY(-1px); }
  .db-pill-indigo { background: rgba(99,102,241,0.25); color: #c7d2fe; border: 1px solid rgba(99,102,241,0.4); }
  .db-pill-cyan   { background: rgba(6,182,212,0.2);   color: #a5f3fc; border: 1px solid rgba(6,182,212,0.35); }
  .db-pill-amber  { background: rgba(245,158,11,0.2);  color: #fde68a; border: 1px solid rgba(245,158,11,0.35); }

  /* loading */
  .db-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 5rem 2rem; }
  .db-spinner { width: 32px; height: 32px; border: 2.5px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: db-spin 0.7s linear infinite; }
  @keyframes db-spin { to { transform: rotate(360deg); } }
  .db-loading p { font-size: 13px; color: #94a3b8; margin: 0; }

  /* stat cards */
  .db-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 1.5rem;
  }
  .db-stat {
    background: #fff;
    border-radius: 12px;
    padding: 1.25rem 1.25rem 1rem;
    border: 1px solid #e2e8f0;
  }
  .db-stat-top  { display: flex; align-items: flex-start; justify-content: space-between; }
  .db-stat-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
  .db-stat-val  { font-size: 30px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; margin-bottom: 4px; }
  .db-stat-sub  { font-size: 11px; color: #94a3b8; }

  /* grid */
  .db-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 14px;
  }
  .db-card {
    grid-column: span 4;
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    padding: 1.25rem;
    overflow: hidden;
  }
  .db-card-wide { grid-column: span 8; }

  @media (max-width: 900px) {
    .db-card, .db-card-wide { grid-column: span 12; }
  }
  @media (max-width: 600px) {
    .db-root { padding: 1rem; }
    .db-welcome { padding: 1.25rem; }
    .db-title { font-size: 18px; }
  }

  .db-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 8px;
  }
  .db-card-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 2px; }
  .db-card-title { font-size: 15px; font-weight: 600; color: #0f172a; }

  .db-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .db-badge-indigo { background: #eef2ff; color: #4f46e5; }
  .db-badge-cyan   { background: #ecfeff; color: #0891b2; }
  .db-badge-purple { background: #f5f3ff; color: #7c3aed; }
  .db-badge-amber  { background: #fffbeb; color: #d97706; }

  .db-link { font-size: 12px; color: #6366f1; text-decoration: none; font-weight: 500; white-space: nowrap; }
  .db-link:hover { text-decoration: underline; }

  /* donut */
  .db-donut-wrap { display: flex; align-items: center; gap: 1rem; }
  .db-legend { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .db-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .db-legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .db-legend-label { flex: 1; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .db-legend-val   { font-weight: 600; color: #0f172a; }

  /* mini table */
  .db-mini-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .db-mini-table th { font-size: 10.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; padding: 0 8px 8px 0; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
  .db-mini-table td { padding: 7px 8px 7px 0; color: #334155; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
  .db-mini-table tr:last-child td { border-bottom: none; }
  .db-mini-table tr:hover td { background: #f8fafc; }
  .db-avatar { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #eef2ff; color: #4f46e5; font-size: 9px; font-weight: 700; margin-right: 7px; flex-shrink: 0; }
  .db-mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; }
  .db-sem-badge { background: #f0fdf4; color: #15803d; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }

  /* faculty list */
  .db-faculty-list { display: flex; flex-direction: column; gap: 8px; }
  .db-faculty-row  { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
  .db-faculty-row:last-child { border-bottom: none; }
  .db-fac-avatar { width: 32px; height: 32px; border-radius: 50%; background: #ecfeff; color: #0891b2; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .db-fac-name { font-size: 13px; font-weight: 500; color: #0f172a; }
  .db-fac-des  { font-size: 11px; color: #94a3b8; }
`;