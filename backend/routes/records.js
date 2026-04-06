import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";
import Pet from "../models/Pet.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

const canAccessPet = async ({ userId, petId, isAdmin }) => {
  const query = {
    _id: petId,
    ...(isAdmin ? {} : { userId }),
  };

  return Pet.findOne(query);
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await canAccessPet({ userId: user._id, petId: req.body.petId, isAdmin: req.user.role === "admin" });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    if (!req.body.type || !req.body.title || !req.body.date) {
      return res.status(400).json({ message: "Type, title, and date are required." });
    }

    const record = await MedicalRecord.create({
      userId: user._id,
      petId: pet._id,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description ?? "",
      documentUrl: req.body.documentUrl ?? null,
      date: new Date(req.body.date),
      nextDueDate: req.body.nextDueDate ? new Date(req.body.nextDueDate) : null,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/:petId", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await canAccessPet({ userId: user._id, petId: req.params.petId, isAdmin: req.user.role === "admin" });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    const records = await MedicalRecord.find({ petId: pet._id }).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    if (req.user.role !== "admin" && String(record.userId) !== String(user._id)) {
      return res.status(403).json({ message: "You cannot edit this record." });
    }

    Object.assign(record, {
      type: req.body.type ?? record.type,
      title: req.body.title ?? record.title,
      description: req.body.description ?? record.description,
      documentUrl: req.body.documentUrl ?? record.documentUrl,
      date: req.body.date ? new Date(req.body.date) : record.date,
      nextDueDate: req.body.nextDueDate ? new Date(req.body.nextDueDate) : record.nextDueDate,
    });

    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    if (req.user.role !== "admin" && String(record.userId) !== String(user._id)) {
      return res.status(403).json({ message: "You cannot delete this record." });
    }

    await record.deleteOne();
    res.json({ message: "Record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
