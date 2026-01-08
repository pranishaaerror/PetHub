import express from "express";
import Groomer from "../models/Groomer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { groomerId, groomerName } = req.body;

    if (!groomerId || !groomerName) {
      return res
        .status(400)
        .json({ message: "Groomer ID and Groomer Name are required" });
    }

    const newGroomer = new Groomer({
      groomerId,
      groomerName,
    });

    await newGroomer.save();

    res.status(201).json({
      message: "Groomer created successfully",
      groomer: newGroomer,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
