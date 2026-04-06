import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

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
