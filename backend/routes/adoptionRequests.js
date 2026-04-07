import express from "express";
import Adoption from "../models/Adoption.js";
import AdoptionRequest from "../models/AdoptionRequest.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const petId = req.body.petId;
    const message = (req.body.message ?? "").trim();
    const fullName = (req.body.fullName ?? user.fullName ?? user.displayName ?? "").trim();
    const email = (req.body.email ?? user.email ?? "").trim().toLowerCase();
    const contactNumber = (req.body.contactNumber ?? user.phoneNumber ?? user.contactNumber ?? "").trim();
    const householdType = (req.body.householdType ?? "").trim();
    const lifestyle = (req.body.lifestyle ?? "").trim();

    if (!petId) {
      return res.status(400).json({ message: "Pet ID is required." });
    }

    if (!fullName || !email || !contactNumber) {
      return res.status(400).json({
        message: "Full name, email, and contact number are required.",
      });
    }

    const pet = await Adoption.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Adoption pet not found." });
    }

    const latestRequest = await AdoptionRequest.findOne({
      userId: user._id,
      petId: pet._id,
    }).sort({ createdAt: -1 });

    if (latestRequest && ["pending", "approved"].includes(latestRequest.status)) {
      return res.status(409).json({
        message:
          latestRequest.status === "approved"
            ? "This adoption request is already approved."
            : "A pending request already exists for this pet.",
        request: latestRequest,
      });
    }

    const request = await AdoptionRequest.create({
      userId: user._id,
      petId: pet._id,
      message,
      fullName,
      email,
      contactNumber,
      householdType,
      lifestyle,
    });

    await createNotification({
      userId: user._id,
      title: "Adoption request sent",
      message: `Your request for ${pet.petName} is now pending review.`,
      type: "adoption",
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const requests = await AdoptionRequest.find({
      ...(req.user.role === "admin" ? {} : { userId: user._id }),
    })
      .populate("petId")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:requestId/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update adoption request status." });
    }

    const { status } = req.body;
    const allowedStatuses = ["pending", "approved", "rejected", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid adoption request status." });
    }

    const request = await AdoptionRequest.findById(req.params.requestId).populate("petId");

    if (!request) {
      return res.status(404).json({ message: "Adoption request not found." });
    }

    request.status = status;
    await request.save();

    if (request.petId) {
      if (status === "approved") {
        request.petId.status = "Pending";
      } else if (["rejected", "cancelled"].includes(status)) {
        const blockingRequests = await AdoptionRequest.countDocuments({
          _id: { $ne: request._id },
          petId: request.petId._id,
          status: { $in: ["pending", "approved"] },
        });

        if (!blockingRequests) {
          request.petId.status = "Available";
        }
      }

      await request.petId.save();
    }

    await createNotification({
      userId: request.userId,
      title: "Adoption request updated",
      message: `Your request for ${request.petId?.petName ?? "this pet"} is now ${status}.`,
      type: "adoption",
    });

    const populatedRequest = await AdoptionRequest.findById(request._id).populate("petId");
    res.json({
      message: "Adoption request status updated successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
