const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// CREATE
router.post("/", async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error("POST SUBJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error("GET SUBJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(subject);
  } catch (error) {
    console.error("PUT SUBJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE SUBJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;