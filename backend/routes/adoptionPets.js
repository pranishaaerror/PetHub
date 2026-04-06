import express from "express";
import Adoption from "../models/Adoption.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const pets = await Adoption.find().sort({ intakeDate: -1 });
    res.json({
      pets,
      count: pets.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pet = await Adoption.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Adoption pet not found." });
    }

    res.json({ pet });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
