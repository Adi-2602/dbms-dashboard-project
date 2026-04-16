const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB()
  .then(() => console.log("✅ DB connection function executed"))
  .catch((err) => console.error("❌ DB connection failed:", err));

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"]
}));

app.use(express.json());

// Routes
app.use("/students", require("./routes/studentRoutes"));
app.use("/faculty", require("./routes/facultyRoutes"));
app.use("/subjects", require("./routes/subjectRoutes"));

// Start server
app.listen(5001, () => {
  console.log ("Server running on port 5001");
});