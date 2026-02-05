import express from "express";
import Adoption from "../models/Adoption.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const {
      adoptionId,
      petName,
      adopterName,
      adopterContact,
      
    } = req.body;

   
    if (!adoptionId || !petName || !adopterName || !adopterContact) {
      return res.status(400).json({
        message: "Adoption ID, Pet Name, Adopter Name and Contact are required",
      });
    }

    const newAdoption = new Adoption({
      adoptionId,
      petName,
      adopterName,
      adopterContact,
     
    });

    await newAdoption.save();

    res.status(201).json({
      message: "Adoption created successfully",
      adoption: newAdoption,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
