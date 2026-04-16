import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .subj-root {
    min-height: 100vh;
    background: #f7f6f3;
    font-family: 'Sora', sans-serif;
    padding: 2.5rem 2rem;
  }

  .subj-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .subj-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #a09e97;
    margin: 0 0 4px;
  }
  .subj-title {
    font-size: 28px;
    font-weight: 600;
    color: #1a1916;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .subj-controls {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .subj-search-wrap {
    position: relative;
  }
  .subj-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: #a09e97;
    pointer-events: none;
  }
  .subj-search {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    padding: 9px 14px 9px 36px;
    border: 1px solid #e0ded8;
    border-radius: 10px;
    background: #fff;
    color: #1a1916;
    width: 240px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .subj-search:focus {
    border-color: #b4a9f0;
    box-shadow: 0 0 0 3px rgba(180,169,240,0.18);
  }
  .subj-search::placeholder { color: #b5b2ab; }

  .subj-count-badge {
    font-size: 12px;
    font-weight: 500;
    color: #7f77dd;
    background: #eeedfe;
    padding: 5px 12px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .subj-sort-btn {
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #5f5e5a;
    background: #fff;
    border: 1px solid #e0ded8;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.12s, border-color 0.12s;
    white-space: nowrap;
  }
  .subj-sort-btn:hover { background: #f3f2ee; border-color: #c8c5be; }
  .subj-sort-btn.active { background: #eeedfe; border-color: #b4a9f0; color: #534ab7; }

  .subj-table-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8e6e0;
    overflow: hidden;
  }

  .subj-table-scroll {
    overflow-x: auto;
  }

  .subj-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }

  .subj-table thead tr {
    border-bottom: 1px solid #eeece6;
    background: #faf9f6;
  }
  .subj-table thead th {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888780;
    padding: 13px 18px;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: color 0.12s;
  }
  .subj-table thead th:hover { color: #534ab7; }
  .subj-table thead th.sorted { color: #534ab7; }
  .subj-sort-arrow { margin-left: 4px; opacity: 0.6; font-style: normal; font-size: 10px; }

  .subj-table tbody tr {
    border-bottom: 1px solid #f3f2ee;
    transition: background 0.1s;
  }
  .subj-table tbody tr:last-child { border-bottom: none; }
  .subj-table tbody tr:hover { background: #faf9f6; }

  .subj-table td {
    padding: 13px 18px;
    color: #2c2c2a;
    vertical-align: middle;
  }

  .subj-td-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #888780;
  }

  .subj-highlight {
    background: #fef3b4;
    border-radius: 3px;
    padding: 0 2px;
  }

  .subj-empty {
    text-align: center;
    padding: 4rem 2rem;
    color: #b5b2ab;
  }
  .subj-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }
  .subj-empty p { margin: 0; font-size: 14px; }

  .subj-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid #f3f2ee;
    background: #faf9f6;
    font-size: 12px;
    color: #a09e97;
    gap: 8px;
    flex-wrap: wrap;
  }

  .subj-pagination {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .subj-pg-btn {
    font-family: 'Sora', sans-serif;
    font-size: 12px;
    font-weight: 500;
    min-width: 30px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #e0ded8;
    border-radius: 7px;
    background: #fff;
    cursor: pointer;
    color: #5f5e5a;
    transition: all 0.1s;
    display: flex; align-items: center; justify-content: center;
  }
  .subj-pg-btn:hover { background: #f3f2ee; }
  .subj-pg-btn.active { background: #7f77dd; border-color: #7f77dd; color: #fff; }
  .subj-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .subj-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    gap: 16px;
  }
  .subj-spinner {
    width: 32px; height: 32px;
    border: 2px solid #e0ded8;
    border-top-color: #7f77dd;
    border-radius: 50%;
    animation: subj-spin 0.7s linear infinite;
  }
  @keyframes subj-spin { to { transform: rotate(360deg); } }
  .subj-loading p { font-size: 13px; color: #a09e97; margin: 0; }

  .subj-error-box {
    background: #fcebeb;
    border: 1px solid #f09595;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    color: #a32d2d;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
  }

  @media (max-width: 600px) {
    .subj-root { padding: 1.25rem 1rem; }
    .subj-header { flex-direction: column; align-items: flex-start; }
    .subj-search { width: 100%; }
    .subj-controls { width: 100%; }
  }
`;

const PAGE_SIZE = 10;

function highlight(text, query) {
  if (!query) return String(text);
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return str;
  return [
    str.slice(0, idx),
    React.createElement("mark", { className: "subj-highlight", key: "hl" }, str.slice(idx, idx + query.length)),
    str.slice(idx + query.length),
  ];
}

function Subjects() {
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setAllSubjects(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (!allSubjects.length) return [];
    return Object.keys(allSubjects[0]).filter((c) => c !== "_id" && c !== "__v");
  }, [allSubjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allSubjects;
    const q = search.toLowerCase();
    return allSubjects.filter((s) =>
      JSON.stringify(s).toLowerCase().includes(q)
    );
  }, [allSubjects, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const pageNums = () => {
    const pages = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="subj-root">

        <div className="subj-header">
          <div>
            <p className="subj-eyebrow">Academic</p>
            <h1 className="subj-title">Subjects</h1>
          </div>

          <div className="subj-controls">
            <div className="subj-search-wrap">
              <svg className="subj-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" />
              </svg>
              <input
                className="subj-search"
                placeholder="Search subjects..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            {sortCol && (
              <button
                className="subj-sort-btn active"
                onClick={() => { setSortCol(null); setSortDir("asc"); }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="1" x2="11" y2="11" />
                  <line x1="11" y1="1" x2="1" y2="11" />
                </svg>
                Clear sort
              </button>
            )}

            <span className="subj-count-badge">
              {sorted.length} {sorted.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>

        {loading && (
          <div className="subj-loading">
            <div className="subj-spinner" />
            <p>Loading subjects…</p>
          </div>
        )}

        {error && !loading && (
          <div className="subj-error-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" />
              <line x1="8" y1="5" x2="8" y2="8.5" />
              <circle cx="8" cy="11" r="0.8" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="subj-table-card">
            <div className="subj-table-scroll">
              <table className="subj-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className={sortCol === col ? "sorted" : ""}
                        onClick={() => handleSort(col)}
                      >
                        {col}
                        <em className="subj-sort-arrow">
                          {sortCol === col ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </em>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length || 1}>
                        <div className="subj-empty">
                          <div className="subj-empty-icon">◎</div>
                          <p>
                            {search
                              ? `No subjects match "${search}"`
                              : "No subjects found"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paged.map((subject) => (
                      <tr key={subject._id}>
                        {columns.map((col) => {
                          const val =
                            typeof subject[col] === "object"
                              ? JSON.stringify(subject[col])
                              : subject[col];
                          const isCode =
                            col.toLowerCase().includes("id") ||
                            col.toLowerCase().includes("code");
                          return (
                            <td key={col} className={isCode ? "subj-td-mono" : ""}>
                              {highlight(val ?? "—", search)}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {sorted.length > PAGE_SIZE && (
              <div className="subj-footer">
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
                </span>
                <div className="subj-pagination">
                  <button
                    className="subj-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {pageNums().map((n) => (
                    <button
                      key={n}
                      className={`subj-pg-btn${n === currentPage ? " active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="subj-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}

export default Subjects;