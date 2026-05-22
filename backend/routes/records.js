import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";
import Pet from "../models/Pet.js";
import Appointment from "../models/AppointmentTable.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

const canAccessPet = async ({ userId, petId, isAdmin, veterinarianId }) => {
  if (isAdmin) {
    return Pet.findById(petId);
  }

  const owned = await Pet.findOne({ _id: petId, userId });
  if (owned) {
    return owned;
  }

  if (veterinarianId) {
    // Allow vet access if they are assigned to any appointment for this pet
    const allowed = await Appointment.exists({
      petId,
      veterinarianId,
      status: { $in: ["pending", "confirmed", "completed"] },
    });

    if (allowed) {
      return Pet.findById(petId);
    }
  }

  return null;
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pet = await canAccessPet({
      userId: user._id,
      petId: req.body.petId,
      isAdmin: user.role === "admin",
      veterinarianId: user.role === "veterinarian" ? user._id : null,
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    if (!req.body.type || !req.body.title || !req.body.date) {
      return res.status(400).json({ message: "Type, title, and date are required." });
    }

    const recordOwnerId = user.role === "veterinarian" ? pet.userId : user._id;

    const record = await MedicalRecord.create({
      userId: recordOwnerId,
      petId: pet._id,
      veterinarianId: user.role === "veterinarian" ? user._id : null,
      appointmentId: req.body.appointmentId ?? null,
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
    const pet = await canAccessPet({
      userId: user._id,
      petId: req.params.petId,
      isAdmin: user.role === "admin",
      veterinarianId: user.role === "veterinarian" ? user._id : null,
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    const records = await MedicalRecord.find({ petId: pet._id })
      .populate("veterinarianId", "fullName displayName")
      .populate({
        path: "appointmentId",
        populate: {
          path: "serviceId",
          select: "serviceName price category"
        }
      })
      .sort({ date: -1, createdAt: -1 });
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

    const isAdmin = user.role === "admin";
    const isPetOwner = String(record.userId) === String(user._id);
    const isAuthorVet =
      user.role === "veterinarian" &&
      record.veterinarianId &&
      String(record.veterinarianId) === String(user._id);

    if (!isAdmin && !isPetOwner && !isAuthorVet) {
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

    const isAdmin = user.role === "admin";
    const isPetOwner = String(record.userId) === String(user._id);
    const isAuthorVet =
      user.role === "veterinarian" &&
      record.veterinarianId &&
      String(record.veterinarianId) === String(user._id);

    if (!isAdmin && !isPetOwner && !isAuthorVet) {
      return res.status(403).json({ message: "You cannot delete this record." });
    }

    await record.deleteOne();
    res.json({ message: "Record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
