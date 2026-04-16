// 
// import React, { useEffect, useState } from "react";
// import API from "../services/api";

// function Students() {

//   const [students, setStudents] = useState([]);
//   const [name, setName] = useState("");

//   useEffect(() => {
//     fetchStudents();
//   }, []);


//   const fetchStudents = async () => {
//   try {
//     const res = await API.get("/students");
//     console.log(res.data);
//     setStudents(res.data);
//   } catch (err) {
//     console.error(err); // 👈 check error
//   }
// };

//   // const fetchStudents = async () => {
//   //   const res = await API.get("/students");
//   //   setStudents(res.data);
//   // };

//   const addStudent = async () => {
//     await API.post("/students", { name });
//     setName("");
//     fetchStudents();
//   };

//   const deleteStudent = async (id) => {
//     await API.delete(`/students/${id}`);
//     fetchStudents();
//   };

//   return (
//     <div className="container mt-4">

//       <h2>Students</h2>

//       {/* Add student */}
//       <div className="mb-3">
//         <input
//           className="form-control"
//           placeholder="Student Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <button className="btn btn-primary mt-2" onClick={addStudent}>
//           Add Student
//         </button>
//       </div>

//       <table className="table table-bordered">

//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {students.map((s) => (
//             <tr key={s._id}>
//               <td>{s.name}</td>
//               <td>
//                 <button
//                   className="btn btn-danger btn-sm"
//                   onClick={() => deleteStudent(s._id)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>

//       </table>

//     </div>
//   );
// }

// export default Students;


import React, { useEffect, useState } from "react";
import API from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    registerNo: "",
    name: "",
    department: "",
    semester: "",
    email: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter((s) =>
    [s.name, s.registerNo, s.department]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openModal = (student = null) => {
    if (student) {
      setForm(student);
      setEditingId(student._id);
    } else {
      setForm({ registerNo: "", name: "", department: "", semester: "", email: "", phone: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.registerNo) {
      alert("Name & Register No required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/students/${editingId}`, form);
      } else {
        await API.post("/students", form);
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/students/${id}`);
    fetchStudents();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Students Dashboard</h2>
        <button className="btn btn-success" onClick={() => openModal()}>
          + Add Student
        </button>
      </div>

      {/* Search */}
      <input
        className="form-control mb-3"
        placeholder="Search by name, register no, department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Dept</th>
                <th>Sem</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => (
                <tr key={s._id}>
                  <td>{i + 1}</td>
                  <td>{s.registerNo}</td>
                  <td className="fw-semibold">{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.semester}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openModal(s)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-3">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? "Edit Student" : "Add Student"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {Object.keys(form).map((field) => (
                  <input
                    key={field}
                    className="form-control mb-2"
                    placeholder={field}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;