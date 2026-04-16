const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // ── new field names (used by the React frontend) ──
    registerNo: { type: String, trim: true },
    name:       { type: String, trim: true },
    department: { type: String, trim: true },
    semester:   { type: mongoose.Schema.Types.Mixed }, // accepts string or number
    email:      { type: String, trim: true, lowercase: true },
    phone:      { type: String, trim: true },

    // ── old field names (kept so existing documents still show up) ──
    studentId:  { type: String, trim: true },
    program:    { type: String, trim: true },
    batch:      { type: String, trim: true },
  },
  {
    strict: false,   // allow any extra fields already in the DB to pass through
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);