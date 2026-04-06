import express from "express";
import EngagementRequest from "../models/EngagementRequest.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { sendEngagementEmails } from "../services/emailService.js";

const router = express.Router();
const phonePattern = /^[+\d][\d\s-]{6,19}$/;
const allowedTypes = new Set([
  "adoption-request",
  "community-rsvp",
  "community-message",
  "medical-upload",
]);

const buildEngagementEmailPayload = (request) => {
  const sharedFields = [
    { label: "Full Name", value: request.fullName },
    { label: "Email", value: request.email },
    { label: "Contact Number", value: request.contactNumber },
  ];

  if (request.type === "adoption-request") {
    return {
      typeLabel: "Adoption Request",
      title: `Adoption request received for ${request.petName}`,
      intro: `your adoption request for ${request.petName} has been received.`,
      fields: [
        ...sharedFields,
        { label: "Pet", value: request.petName },
        { label: "Household", value: request.metadata?.householdType ?? "Not provided" },
        { label: "Lifestyle", value: request.metadata?.lifestyle ?? "Not provided" },
        { label: "Why this pet", value: request.message || "Not provided" },
      ],
    };
  }

  if (request.type === "community-rsvp") {
    return {
      typeLabel: "Community RSVP",
      title: `RSVP received for ${request.title}`,
      intro: `your RSVP for ${request.title} is now logged in PetHub.`,
      fields: [
        ...sharedFields,
        { label: "Meetup", value: request.title },
        { label: "Pet Joining", value: request.petName || "Not specified" },
        { label: "Attendance", value: request.metadata?.attendanceType ?? "Standard" },
        { label: "Message", value: request.message || "No extra note" },
      ],
    };
  }

  if (request.type === "community-message") {
    return {
      typeLabel: "Community Conversation",
      title: `Conversation request sent for ${request.title || "PetHub Community"}`,
      intro: "your community connection request has been recorded.",
      fields: [
        ...sharedFields,
        { label: "Conversation Type", value: request.metadata?.modeLabel ?? "Warm intro" },
        { label: "Topic", value: request.title || "PetHub Community" },
        { label: "Pet Joining", value: request.petName || "Not specified" },
        { label: "Message", value: request.message || "No message provided" },
      ],
    };
  }

  return {
    typeLabel: "Medical Upload Request",
    title: `Medical upload note received for ${request.petName || "your pet"}`,
    intro: "your medical document note has been saved and the care desk has been notified.",
    fields: [
      ...sharedFields,
      { label: "Pet", value: request.petName || "Not specified" },
      { label: "Files", value: (request.metadata?.fileNames ?? []).join(", ") || "No files listed" },
      { label: "Summary", value: request.message || "No summary provided" },
    ],
  };
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.id });

    if (!user) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const type = (req.body.type ?? "").trim();
    const fullName = (req.body.fullName ?? user.displayName ?? "").trim();
    const email = (req.body.email ?? req.user.email ?? user.email ?? "").trim().toLowerCase();
    const contactNumber = (req.body.contactNumber ?? user.contactNumber ?? "").trim();
    const petName = (req.body.petName ?? "").trim();
    const title = (req.body.title ?? "").trim();
    const message = (req.body.message ?? "").trim();
    const referenceId = (req.body.referenceId ?? "").trim() || null;
    const metadata = req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {};

    if (!allowedTypes.has(type)) {
      return res.status(400).json({ message: "Please choose a valid PetHub request type." });
    }

    if (!fullName || !email || !contactNumber) {
      return res.status(400).json({ message: "Full name, email, and contact number are required." });
    }

    if (!phonePattern.test(contactNumber)) {
      return res.status(400).json({ message: "Please enter a valid contact number." });
    }

    if (type === "adoption-request" && (!petName || !message)) {
      return res
        .status(400)
        .json({ message: "Pet name and a short adoption note are required." });
    }

    if (type === "community-rsvp" && !title) {
      return res.status(400).json({ message: "Meetup title is required for an RSVP." });
    }

    if (type === "community-message" && !message) {
      return res.status(400).json({ message: "Please add a message before sending." });
    }

    if (
      type === "medical-upload" &&
      !petName &&
      !(Array.isArray(metadata.fileNames) && metadata.fileNames.length)
    ) {
      return res
        .status(400)
        .json({ message: "Add a pet name or at least one file before continuing." });
    }

    const engagement = await EngagementRequest.create({
      type,
      userId: user._id,
      fullName,
      email,
      contactNumber,
      petName,
      title,
      message,
      referenceId,
      metadata,
    });

    let emailSent = false;

    try {
      const emailPayload = buildEngagementEmailPayload(engagement);
      await sendEngagementEmails({
        requesterEmail: engagement.email,
        requesterName: engagement.fullName,
        requestId: engagement.requestId,
        ...emailPayload,
      });
      engagement.emailSent = true;
      await engagement.save();
      emailSent = true;
    } catch (emailError) {
      console.error("Engagement email failed:", emailError.message);
    }

    res.status(201).json({
      message: emailSent
        ? "PetHub request saved and confirmation email sent."
        : "PetHub request saved successfully.",
      request: engagement,
      emailSent,
    });
  } catch (error) {
    console.error("Engagement request failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
