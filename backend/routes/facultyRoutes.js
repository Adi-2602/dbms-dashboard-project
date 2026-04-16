const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");

// CREATE
router.post("/", async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    console.error("POST FACULTY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (error) {
    console.error("GET FACULTY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(faculty);
  } catch (error) {
    console.error("PUT FACULTY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE FACULTY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;