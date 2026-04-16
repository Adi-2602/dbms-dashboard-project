const mongoose = require("mongoose");

// const facultySchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   department: String
// });

const facultySchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model("Faculty", facultySchema);