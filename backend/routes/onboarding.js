import express from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import Pet from "../models/Pet.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const petUploadsDir = path.resolve(__dirname, "../uploads/pets");

fs.mkdirSync(petUploadsDir, { recursive: true });

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildPublicUrl = (req, filename) => {
  const baseUrl = (process.env.BACKEND_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`).trim();
  return `${baseUrl}/uploads/pets/${filename}`;
};

const savePhotoDataUrl = ({ req, dataUrl }) => {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return null;
  }

  const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);

  if (!matches) {
    return null;
  }

  const mimeType = matches[1];
  const base64 = matches[2];
  const extensionMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionMap[mimeType] ?? "png";
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(petUploadsDir, filename);

  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

  return buildPublicUrl(req, filename);
};

router.get("/status", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const pets = await Pet.find({ userId: user._id }).sort({ isPrimary: -1, createdAt: 1 });

    res.json({
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep ?? 0,
      onboardingDraft: user.onboardingDraft ?? {},
      hasPetProfile: pets.length > 0,
      primaryPet: pets[0] ?? null,
      preferences: user.preferences ?? {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/save-step", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const step = Number(req.body.step ?? 0);
    const payload = req.body.payload && typeof req.body.payload === "object" ? req.body.payload : {};

    user.onboardingStep = Number.isFinite(step) ? step : user.onboardingStep ?? 0;
    user.onboardingDraft = {
      ...(user.onboardingDraft ?? {}),
      ...payload,
    };

    if (payload.fullName) {
      user.fullName = String(payload.fullName).trim();
      user.displayName = String(payload.fullName).trim();
    }

    if (payload.phoneNumber) {
      user.phoneNumber = String(payload.phoneNumber).trim();
      user.contactNumber = String(payload.phoneNumber).trim();
    }

    if (payload.preferences && typeof payload.preferences === "object") {
      user.preferences = {
        ...(user.preferences ?? {}),
        ...payload.preferences,
      };
    }

    await user.save();

    res.json({
      message: "Onboarding step saved.",
      onboardingStep: user.onboardingStep,
      onboardingDraft: user.onboardingDraft,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/complete", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const data = {
      ...(user.onboardingDraft ?? {}),
      ...payload,
    };

    const fullName = (data.fullName ?? user.fullName ?? "").trim();
    const phoneNumber = (data.phoneNumber ?? user.phoneNumber ?? user.contactNumber ?? "").trim();
    const preferences =
      data.preferences && typeof data.preferences === "object"
        ? {
            ...(user.preferences ?? {}),
            ...data.preferences,
          }
        : user.preferences ?? {};

    if (!fullName || !data.petName || !data.species || !data.breed) {
      return res.status(400).json({
        message: "Full name, pet name, species, and breed are required to complete onboarding.",
      });
    }

    let primaryPet =
      (await Pet.findOne({ userId: user._id, isPrimary: true })) ??
      (await Pet.findOne({ userId: user._id }).sort({ createdAt: 1 }));

    if (!primaryPet) {
      primaryPet = new Pet({
        userId: user._id,
        isPrimary: true,
      });
    }

    primaryPet.name = String(data.petName).trim();
    primaryPet.species = String(data.species).trim();
    primaryPet.breed = String(data.breed).trim();
    primaryPet.gender = String(data.gender ?? "").trim();
    primaryPet.age = String(data.age ?? "").trim();
    primaryPet.weight = String(data.weight ?? "").trim();
    primaryPet.color = String(data.color ?? "").trim();
    primaryPet.microchipId = String(data.microchipId ?? "").trim();
    primaryPet.vaccinationStatus = String(data.vaccinationStatus ?? "Needs review").trim();
    primaryPet.allergies = normalizeList(data.allergies);
    primaryPet.medicalConditions = normalizeList(data.medicalConditions);
    primaryPet.medications = normalizeList(data.medications);
    primaryPet.preferredClinic = String(data.preferredClinic ?? "").trim();
    primaryPet.planType = String(data.carePlanPreference ?? data.planType ?? "Premium Care").trim();

    if (data.dob) {
      primaryPet.dob = new Date(data.dob);
    }

    const photoUrl = savePhotoDataUrl({ req, dataUrl: data.photoDataUrl });
    if (photoUrl) {
      primaryPet.photoUrl = photoUrl;
    }

    await primaryPet.save();
    await Pet.updateMany({ userId: user._id, _id: { $ne: primaryPet._id } }, { $set: { isPrimary: false } });

    user.fullName = fullName;
    user.displayName = fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.contactNumber = phoneNumber || user.contactNumber;
    user.onboardingCompleted = true;
    user.onboardingStep = 6;
    user.onboardingDraft = {};
    user.preferences = preferences;
    await user.save();

    await createNotification({
      userId: user._id,
      title: "PetHub setup complete",
      message: `${primaryPet.name}'s profile is ready. Your dashboard now has care reminders, booking shortcuts, and health snapshots.`,
      type: "onboarding",
    });

    res.json({
      message: "Onboarding completed successfully.",
      user,
      primaryPet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
