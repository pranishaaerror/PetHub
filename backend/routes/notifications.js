import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
