import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

const mergeAvailability = (existing = {}, incoming) => {
  if (!incoming || typeof incoming !== "object") {
    return {
      workingDays: existing.workingDays ?? [],
      timeSlots: existing.timeSlots ?? [],
    };
  }

  return {
    workingDays: Array.isArray(incoming.workingDays)
      ? incoming.workingDays.map((day) => String(day).trim()).filter(Boolean)
      : existing.workingDays ?? [],
    timeSlots: Array.isArray(incoming.timeSlots)
      ? incoming.timeSlots.map((slot) => ({
          start: String(slot?.start ?? "").trim(),
          end: String(slot?.end ?? "").trim(),
        }))
      : existing.timeSlots ?? [],
  };
};

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pets = await Pet.find({ userId: user._id }).sort({ isPrimary: -1, createdAt: 1 });

    res.json({
      ...user.toObject(),
      pets,
      primaryPet: pets[0] ?? null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/me", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const fullName = (req.body.fullName ?? req.body.displayName ?? user.fullName ?? "").trim();
    const phoneNumber = (req.body.phoneNumber ?? req.body.contactNumber ?? "").trim();

    user.fullName = fullName || user.fullName;
    user.displayName = fullName || user.displayName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.contactNumber = phoneNumber || user.contactNumber;
    user.avatar = req.body.avatar ?? user.avatar;
    user.photoURL = req.body.avatar ?? user.photoURL;
    user.preferences = {
      ...(user.preferences ?? {}),
      ...(req.body.preferences ?? {}),
    };

    if (req.body.communityInterest && typeof req.body.communityInterest === "object") {
      const { petName, address, interestType } = req.body.communityInterest;
      user.communityInterest = {
        ...(user.communityInterest ?? {}),
        ...(petName !== undefined ? { petName: String(petName).trim() || null } : {}),
        ...(address !== undefined ? { address: String(address).trim() || null } : {}),
        ...(interestType !== undefined ? { interestType: String(interestType).trim() || null } : {}),
      };
    }

    if (user.role === "veterinarian" && req.body.vetProfile && typeof req.body.vetProfile === "object") {
      const vp = req.body.vetProfile;
      const current = user.vetProfile?.toObject?.() ?? user.vetProfile ?? {};
      user.vetProfile = {
        specialization:
          vp.specialization !== undefined ? String(vp.specialization).trim() : current.specialization ?? "",
        experienceYears: (() => {
          if (vp.experienceYears === undefined || vp.experienceYears === null || vp.experienceYears === "") {
            return current.experienceYears ?? null;
          }
          const parsed = Number(vp.experienceYears);
          return Number.isFinite(parsed) ? parsed : current.experienceYears ?? null;
        })(),
        qualifications:
          vp.qualifications !== undefined ? String(vp.qualifications).trim() : current.qualifications ?? "",
        availability: mergeAvailability(current.availability, vp.availability),
      };
    }

    if (user.role === "groomer" && req.body.groomerProfile && typeof req.body.groomerProfile === "object") {
      const gp = req.body.groomerProfile;
      const current = user.groomerProfile?.toObject?.() ?? user.groomerProfile ?? {};
      user.groomerProfile = {
        servicesOffered: Array.isArray(gp.servicesOffered)
          ? gp.servicesOffered.map((item) => String(item).trim()).filter(Boolean)
          : current.servicesOffered ?? [],
        bio: gp.bio !== undefined ? String(gp.bio).trim() : current.bio ?? "",
        availability: mergeAvailability(current.availability, gp.availability),
      };
    }

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can list users." });
    }

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
