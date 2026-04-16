const mongoose = require("mongoose");

// const subjectSchema = new mongoose.Schema({
//   subjectName: String,
//   subjectCode: String,
//   semester: Number
// });
const subjectSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model("Subject", subjectSchema);