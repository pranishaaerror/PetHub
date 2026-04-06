import { getAuth } from "firebase-admin/auth";
import { firebaseApp } from "../firebaseAdmin.js";
import User from "../models/User.js";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

export const resolveUserRole = (firebaseUser, fallbackEmail) => {
  const email = (firebaseUser.email ?? fallbackEmail ?? "").trim().toLowerCase();

  if (firebaseUser.customClaims?.role === "admin" || email === ADMIN_EMAIL) {
    return "admin";
  }

  return "user";
};

const resolveAuthProvider = (firebaseUser) => {
  const providers = firebaseUser.providerData ?? [];

  if (providers.some((provider) => provider.providerId === "google.com")) {
    return "google";
  }

  return "local";
};

export const mapFirebaseUserToDocument = (firebaseUser, fallbackEmail) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? fallbackEmail,
  emailVerified: firebaseUser.emailVerified ?? false,
  disabled: firebaseUser.disabled ?? false,
  fullName: firebaseUser.displayName ?? null,
  displayName: firebaseUser.displayName ?? null,
  avatar: firebaseUser.photoURL ?? null,
  photoURL: firebaseUser.photoURL ?? null,
  phoneNumber: firebaseUser.phoneNumber ?? null,
  role: resolveUserRole(firebaseUser, fallbackEmail),
  authProvider: resolveAuthProvider(firebaseUser),
  metadata: {
    creationTime: firebaseUser.metadata?.creationTime ?? null,
    lastSignInTime: firebaseUser.metadata?.lastSignInTime ?? null,
    lastRefreshTime: firebaseUser.metadata?.lastRefreshTime ?? null,
  },
  providerData: (firebaseUser.providerData ?? []).map((provider) => ({
    uid: provider.uid ?? null,
    providerId: provider.providerId ?? null,
    displayName: provider.displayName ?? null,
    email: provider.email ?? null,
    photoURL: provider.photoURL ?? null,
    phoneNumber: provider.phoneNumber ?? null,
  })),
  passwordHash: firebaseUser.passwordHash ?? null,
  passwordSalt: firebaseUser.passwordSalt ?? null,
  tokensValidAfterTime: firebaseUser.tokensValidAfterTime ?? null,
  tenantId: firebaseUser.tenantId ?? null,
});

export const syncFirebaseUser = async ({ uid, email }) => {
  const firebaseUser = await getAuth(firebaseApp).getUser(uid);
  const userPayload = mapFirebaseUserToDocument(firebaseUser, email);
  let user = await User.findOne({ uid });

  if (!user && userPayload.email) {
    user = await User.findOne({ email: userPayload.email });
  }

  if (user) {
    user.set(userPayload);
    return user.save();
  }

  return User.create(userPayload);
};

export const getCurrentDatabaseUser = async (req) => {
  const existingUser = await User.findOne({ uid: req.user.id });

  if (existingUser) {
    return existingUser;
  }

  return syncFirebaseUser({ uid: req.user.id, email: req.user.email });
};
