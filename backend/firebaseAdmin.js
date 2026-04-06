import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

const loadServiceAccount = () => {
  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountPath = configuredPath
    ? path.resolve(__dirname, configuredPath)
    : path.resolve(__dirname, "service_account.json");

  if (!fs.existsSync(serviceAccountPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
};

const serviceAccount = loadServiceAccount();
const credential = serviceAccount
  ? cert(serviceAccount)
  : applicationDefault();

export const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential,
  });
