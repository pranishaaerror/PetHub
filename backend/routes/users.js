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

// Admin: create a new user directly
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create users." });
    }

    const { getAuth } = await import("firebase-admin/auth");
    const { firebaseApp } = await import("../firebaseAdmin.js");
    const { syncFirebaseUser } = await import("../services/currentUserService.js");

    const email = (req.body.email ?? "").trim().toLowerCase();
    const fullName = (req.body.fullName ?? "").trim();
    const password = (req.body.password ?? "").trim();
    const role = (req.body.role ?? "user").trim();

    if (!email || !fullName || !password) {
      return res.status(400).json({ message: "Email, full name, and password are required." });
    }

    const allowedRoles = ["user", "admin", "veterinarian"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const auth = getAuth(firebaseApp);

    // Check if already exists
    try {
      await auth.getUserByEmail(email);
      return res.status(409).json({ message: "A user with this email already exists." });
    } catch (err) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    const firebaseUser = await auth.createUser({ email, password, displayName: fullName });
    const dbUser = await syncFirebaseUser({ uid: firebaseUser.uid, email });
    dbUser.fullName = fullName;
    dbUser.displayName = fullName;
    dbUser.role = role;
    dbUser.emailVerified = true;
    await dbUser.save();

    res.status(201).json({ message: "User created successfully.", user: dbUser });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Admin: update a user's role or disabled status
router.patch("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update users." });
    }

    const allowedRoles = ["admin", "user", "veterinarian", "groomer"];
    const { role, disabled } = req.body;

    const update = {};
    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role." });
      }
      update.role = role;
    }
    if (disabled !== undefined) {
      update.disabled = Boolean(disabled);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Provide role or disabled to update." });
    }

    const user = await User.findByIdAndUpdate(req.params.userId, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

// Admin: delete a user
router.delete("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete users." });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
