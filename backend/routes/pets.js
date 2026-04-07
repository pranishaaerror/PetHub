import express from "express";
import fs from "fs";
import path from "path";
import Pet from "../models/Pet.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { petPhotoUpload } from "../middleware/uploadMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

const buildPublicUrl = (req, filename) => {
  const baseUrl = (process.env.BACKEND_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`).trim();
  return `${baseUrl}/uploads/pets/${filename}`;
};

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const assignPetFields = (pet, payload) => {
  pet.name = (payload.name ?? pet.name ?? "").trim();
  pet.species = (payload.species ?? pet.species ?? "").trim();
  pet.breed = (payload.breed ?? pet.breed ?? "").trim();
  pet.gender = (payload.gender ?? pet.gender ?? "").trim();
  pet.age = (payload.age ?? pet.age ?? "").trim();
  pet.weight = (payload.weight ?? pet.weight ?? "").trim();
  pet.color = (payload.color ?? pet.color ?? "").trim();
  pet.microchipId = (payload.microchipId ?? pet.microchipId ?? "").trim();
  pet.vaccinationStatus = (payload.vaccinationStatus ?? pet.vaccinationStatus ?? "").trim();
  pet.preferredClinic = (payload.preferredClinic ?? pet.preferredClinic ?? "").trim();
  pet.planType = (payload.planType ?? pet.planType ?? "").trim();
  pet.allergies = normalizeList(payload.allergies ?? pet.allergies);
  pet.medicalConditions = normalizeList(payload.medicalConditions ?? pet.medicalConditions);
  pet.medications = normalizeList(payload.medications ?? pet.medications);
  pet.isPrimary = Boolean(payload.isPrimary ?? pet.isPrimary);

  if (payload.dob) {
    pet.dob = new Date(payload.dob);
  }
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const existingPets = await Pet.countDocuments({ userId: user._id });
    const pet = new Pet({
      userId: user._id,
      isPrimary: existingPets === 0,
    });

    assignPetFields(pet, req.body);

    if (!pet.name || !pet.species || !pet.breed) {
      return res.status(400).json({ message: "Pet name, species, and breed are required." });
    }

    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pets = await Pet.find({ userId: user._id }).sort({ isPrimary: -1, createdAt: 1 });
    res.json({
      pets,
      primaryPet: pets[0] ?? null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await Pet.findOne({
      _id: req.params.id,
      ...(req.user.role === "admin" ? {} : { userId: user._id }),
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await Pet.findOne({
      _id: req.params.id,
      ...(req.user.role === "admin" ? {} : { userId: user._id }),
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    assignPetFields(pet, req.body);

    if (req.body.isPrimary) {
      await Pet.updateMany({ userId: pet.userId, _id: { $ne: pet._id } }, { $set: { isPrimary: false } });
      pet.isPrimary = true;
    }

    await pet.save();
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/:id/photo", verifyToken, petPhotoUpload.single("photo"), async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await Pet.findOne({
      _id: req.params.id,
      ...(req.user.role === "admin" ? {} : { userId: user._id }),
    });

    if (!pet) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(404).json({ message: "Pet not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a pet photo." });
    }

    if (pet.photoUrl) {
      const previousFileName = path.basename(pet.photoUrl);
      const previousPath = path.resolve(path.dirname(req.file.path), previousFileName);
      if (fs.existsSync(previousPath) && previousPath !== req.file.path) {
        fs.unlink(previousPath, () => {});
      }
    }

    pet.photoUrl = buildPublicUrl(req, req.file.filename);
    await pet.save();

    res.json({
      message: "Pet photo uploaded successfully.",
      pet,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
