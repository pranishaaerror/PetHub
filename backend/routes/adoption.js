import express from "express";
import Adoption from "../models/Adoption.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      petName,
      breed,
      age,
      gender,
      intakeDate,
      status,
    } = req.body;


    if (!petName || !breed || !age || !gender) {
      return res.status(400).json({
        message: "Pet Name, Breed, Age, and Gender are required",
      });
    }

    // Validate gender
    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be either 'Male' or 'Female'",
      });
    }

    // Validate status if provided
    if (status && !['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({
        message: "Status must be 'Available', 'Pending', or 'Adopted'",
      });
    }

    const newAdoption = new Adoption({
      petName,
      breed,
      age,
      gender,
      intakeDate: intakeDate || Date.now(),
      status: status || 'Available',
    });

    await newAdoption.save();

    res.status(201).json({
      message: "Pet added to adoption center successfully",
      adoption: newAdoption,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const pets = await Adoption.find().sort({ intakeDate: -1 });
    
    res.status(200).json({
      message: "Pets retrieved successfully",
      count: pets.length,
      pets,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;

    if (!['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'Available', 'Pending', or 'Adopted'",
      });
    }

    const pets = await Adoption.find({ status }).sort({ intakeDate: -1 });

    res.status(200).json({
      message: `${status} pets retrieved successfully`,
      count: pets.length,
      pets,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pet = await Adoption.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    
    res.status(200).json({
      message: "Pet retrieved successfully",
      pet,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const {
      petName,
      breed,
      age,
      gender,
      intakeDate,
      status,
    } = req.body;

  
    if (gender && !['Male', 'Female'].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be either 'Male' or 'Female'",
      });
    }

    if (status && !['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({
        message: "Status must be 'Available', 'Pending', or 'Adopted'",
      });
    }

    const updatedPet = await Adoption.findByIdAndUpdate(
      req.params.id,
      {
        petName,
        breed,
        age,
        gender,
        intakeDate,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json({
      message: "Pet updated successfully",
      pet: updatedPet,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedPet = await Adoption.findByIdAndDelete(req.params.id);

    if (!deletedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json({
      message: "Pet removed from adoption center successfully",
      pet: deletedPet,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
