import { getAuth } from "firebase-admin/auth";
import { firebaseApp } from "./firebaseAdmin.js";
import User from "./models/User.js";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const ADMIN_DEFAULT_PASSWORD = (process.env.ADMIN_DEFAULT_PASSWORD ?? "").trim();
const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME ?? "PetHub Admin";

export const ensureAdminAccount = async () => {
  if (!ADMIN_EMAIL || !ADMIN_DEFAULT_PASSWORD) {
    console.warn("Admin account provisioning skipped. Set ADMIN_EMAIL and ADMIN_DEFAULT_PASSWORD to enable it.");
    return null;
  }

  const auth = getAuth(firebaseApp);
  let firebaseUser;

  try {
    firebaseUser = await auth.getUserByEmail(ADMIN_EMAIL);
    firebaseUser = await auth.updateUser(firebaseUser.uid, {
      displayName: ADMIN_DISPLAY_NAME,
      emailVerified: true,
      password: ADMIN_DEFAULT_PASSWORD,
      disabled: false,
    });
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    firebaseUser = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_DEFAULT_PASSWORD,
      displayName: ADMIN_DISPLAY_NAME,
      emailVerified: true,
    });
  }

  await auth.setCustomUserClaims(firebaseUser.uid, { role: "admin" });
  await User.findOneAndUpdate(
    { uid: firebaseUser.uid },
    {
      email: ADMIN_EMAIL,
      fullName: ADMIN_DISPLAY_NAME,
      displayName: ADMIN_DISPLAY_NAME,
      role: "admin",
    },
    { new: true }
  );
  console.log(`Admin account ensured for ${ADMIN_EMAIL}`);

  return firebaseUser;
};
