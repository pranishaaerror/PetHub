import express from "express";
import Adoption from "../models/Adoption.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { petPhotoUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add pets." });
    }

    const { petName, breed, age, gender, intakeDate, status, species, size,
            vaccinated, healthStatus, description, temperament, location,
            adoptionFee, imageGallery } = req.body;

    if (!petName || !breed || !age || !gender) {
      return res.status(400).json({ message: "Pet Name, Breed, Age, and Gender are required" });
    }
    if (!['Male', 'Female'].includes(gender)) {
      return res.status(400).json({ message: "Gender must be either 'Male' or 'Female'" });
    }
    if (status && !['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Available', 'Pending', or 'Adopted'" });
    }

    const newAdoption = await Adoption.create({
      petName, breed, age, gender, species, size, vaccinated, healthStatus,
      description, location, adoptionFee, imageGallery,
      temperament: Array.isArray(temperament) ? temperament : [],
      intakeDate: intakeDate || Date.now(),
      status: status || 'Available',
    });

    res.status(201).json({ message: "Pet added to adoption center successfully", adoption: newAdoption });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const pets = await Adoption.find().sort({ intakeDate: -1 });
    res.status(200).json({ message: "Pets retrieved successfully", count: pets.length, pets });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    if (!['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const pets = await Adoption.find({ status }).sort({ intakeDate: -1 });
    res.status(200).json({ message: `${status} pets retrieved successfully`, count: pets.length, pets });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pet = await Adoption.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json({ message: "Pet retrieved successfully", pet });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update pets." });
    }

    const { petName, breed, age, gender, intakeDate, status, species, size,
            vaccinated, healthStatus, description, temperament, location,
            adoptionFee, imageGallery } = req.body;

    if (gender && !['Male', 'Female'].includes(gender)) {
      return res.status(400).json({ message: "Gender must be either 'Male' or 'Female'" });
    }
    if (status && !['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Available', 'Pending', or 'Adopted'" });
    }

    const updatedPet = await Adoption.findByIdAndUpdate(
      req.params.id,
      { petName, breed, age, gender, intakeDate, status, species, size,
        vaccinated, healthStatus, description, location, adoptionFee,
        // Only update imageGallery if explicitly provided
        ...(imageGallery !== undefined ? { imageGallery } : {}),
        ...(Array.isArray(temperament) ? { temperament } : {}) },
      { new: true, runValidators: true }
    );

    if (!updatedPet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json({ message: "Pet updated successfully", pet: updatedPet });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete pets." });
    }
    const deletedPet = await Adoption.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json({ message: "Pet removed from adoption center successfully", pet: deletedPet });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Upload photo — registered last so POST / is matched first
router.post("/:id/photo", verifyToken, petPhotoUpload.single("photo"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can upload pet photos." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No photo file provided." });
    }

    const pet = await Adoption.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found." });

    const photoUrl = `/uploads/pets/${req.file.filename}`;
    if (pet.imageGallery.length > 0) {
      pet.imageGallery[0] = photoUrl;
    } else {
      pet.imageGallery.push(photoUrl);
    }
    pet.markModified("imageGallery");
    await pet.save();

    res.json({ message: "Photo uploaded successfully.", photoUrl, pet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
