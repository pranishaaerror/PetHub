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

router.get("/meetups", async (_req, res) => {
  try {
    const meetups = await CommunityMeetup.find().sort({ createdAt: -1 });
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

export default router;
