const XLSX = require("xlsx");
const mongoose = require("mongoose");

const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
const Subject = require("./models/Subject");

mongoose.connect("mongodb://127.0.0.1:27017/dbms_dashboard")
.then(() => console.log("MongoDB Connected"));


// -------- STUDENTS --------

const studentWorkbook = XLSX.readFile("../dataset/Student Master Report_2nd year 2023-2027 batch.xlsx");

const studentSheet = studentWorkbook.Sheets[studentWorkbook.SheetNames[0]];

const studentData = XLSX.utils.sheet_to_json(studentSheet);


// -------- FACULTY --------

const facultyWorkbook = XLSX.readFile("../dataset/CTech_Faculty_Namelist (2).xlsx");

const facultySheet = facultyWorkbook.Sheets[facultyWorkbook.SheetNames[0]];

const facultyData = XLSX.utils.sheet_to_json(facultySheet);


// -------- SUBJECTS --------

const subjectWorkbook = XLSX.readFile("../dataset/CTech_Subject_Even_25-26_Display.xlsx");

const subjectSheet = subjectWorkbook.Sheets[subjectWorkbook.SheetNames[0]];

const subjectData = XLSX.utils.sheet_to_json(subjectSheet);


const importData = async () => {

  try {

    await Student.insertMany(studentData);
    await Faculty.insertMany(facultyData);
    await Subject.insertMany(subjectData);

    console.log("All Excel data imported");

    process.exit();

  } catch (error) {

    console.error(error);

  }

};

importData();