import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../uploads");
const petUploadsDir = path.join(uploadsRoot, "pets");
const medicalUploadsDir = path.join(uploadsRoot, "medical");

fs.mkdirSync(petUploadsDir, { recursive: true });
fs.mkdirSync(medicalUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, petUploadsDir);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const petPhotoUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Only JPG, PNG, and WEBP pet photos are allowed."));
      return;
    }

    callback(null, true);
  },
});

const medicalStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, medicalUploadsDir);
  },
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const medicalMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const medicalReportUpload = multer({
  storage: medicalStorage,
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!medicalMimeTypes.has(file.mimetype)) {
      callback(new Error("Medical reports must be PDF, JPG, PNG, or WEBP."));
      return;
    }

    callback(null, true);
  },
});
