import express from "express";
import CommunityMeetup from "../models/CommunityMeetup.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();

router.get("/posts", async (_req, res) => {
  try {
    const posts = await CommunityMeetup.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/meetups", async (req, res) => {
  try {
    const approvedOnly = req.query.approvedOnly === "true" || req.query.approvedOnly === "1";
    const filter = approvedOnly
      ? { $or: [{ approved: true }, { approved: { $exists: false } }] }
      : {};
    const meetups = await CommunityMeetup.find(filter).sort({ createdAt: -1 });
    res.json(meetups);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/rsvp", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const meetup = await CommunityMeetup.findById(req.body.meetupId);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found." });
    }

    if (!meetup.attendees.some((attendeeId) => String(attendeeId) === String(user._id))) {
      meetup.attendees.push(user._id);
      await meetup.save();
    }

    await createNotification({
      userId: user._id,
      title: "Meetup RSVP confirmed",
      message: `You're on the list for ${meetup.title}.`,
      type: "community",
    });

    res.json({
      message: "RSVP saved successfully.",
      meetup,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/message", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const title = (req.body.title ?? "Community host").trim();

    await createNotification({
      userId: user._id,
      title: "Conversation request sent",
      message: `PetHub saved your message for ${title}. A warmer follow-up can happen from here.`,
      type: "community",
    });

    res.status(201).json({
      message: "Message request saved successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/meetups/:meetupId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update meetups." });
    }

    const allowed = ["title", "description", "type", "date", "time", "location", "hostName", "tags", "energyStyle", "approved"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const meetup = await CommunityMeetup.findByIdAndUpdate(
      req.params.meetupId,
      update,
      { new: true, runValidators: true }
    );
    if (!meetup) return res.status(404).json({ message: "Meetup not found." });
    res.json(meetup);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/meetups", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create meetups." });
    }

    const { title, description, type, date, time, location, hostName, tags, energyStyle } = req.body;
    if (!title || !description || !type || !date || !time || !location || !hostName) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    const meetup = await CommunityMeetup.create({
      title, description, type, date, time, location, hostName,
      tags: tags ?? [],
      energyStyle: energyStyle ?? "gentle",
      approved: true,
    });
    res.status(201).json(meetup);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/meetups/:meetupId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete meetups." });
    }

    const meetup = await CommunityMeetup.findByIdAndDelete(req.params.meetupId);
    if (!meetup) return res.status(404).json({ message: "Meetup not found." });
    res.json({ message: "Meetup deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
