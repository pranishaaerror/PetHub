import express from "express";
import {firebaseApp} from "../firebaseAdmin.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAuth } from "firebase-admin/auth";
import { createHash, randomInt } from "crypto";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import SignupEmailOtp from "../models/SignupEmailOtp.js";
import {
  sendPasswordResetOtpEmail,
  sendSignupVerificationOtpEmail,
} from "../services/emailService.js";
import { syncFirebaseUser } from "../services/currentUserService.js";

export const authRouter = express.Router();

const RESET_OTP_TTL_MS = 10 * 60 * 1000;
const SIGNUP_OTP_TTL_MS = 5 * 60 * 1000;
const phonePattern = /^[+\d][\d\s-]{6,19}$/;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const hashOtp = (otp) => createHash("sha256").update(otp).digest("hex");

//api/auth/me
const handleSyncCurrentUser = async (req, res) => {
  try {
    const { id, email } = req.user;
    const user = await syncFirebaseUser({ uid: id, email });

    res.json(user);
  } catch (error) {
    console.error("Auth sync failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

authRouter.get("/me", verifyToken, handleSyncCurrentUser);
authRouter.post("/me", verifyToken, handleSyncCurrentUser);

authRouter.patch("/account-type", verifyToken, async (req, res) => {
  try {
    const { id, email } = req.user;
    const nextRole = String(req.body.role ?? req.body.accountType ?? "").trim();

    if (!["user", "veterinarian", "groomer"].includes(nextRole)) {
      return res
        .status(400)
        .json({ message: "Choose pet parent, veterinarian, or professional groomer account." });
    }

    const user = await syncFirebaseUser({ uid: id, email });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be changed here." });
    }

    user.role = nextRole;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Account type update failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

authRouter.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { id, email } = req.user;
    const displayName = (req.body.displayName ?? req.body.fullName ?? "").trim();
    const contactNumber = (req.body.contactNumber ?? req.body.phoneNumber ?? "").trim();

    if (!displayName || !contactNumber) {
      return res.status(400).json({ message: "Full name and contact number are required." });
    }

    if (!phonePattern.test(contactNumber)) {
      return res.status(400).json({ message: "Please enter a valid contact number." });
    }

    const user = await syncFirebaseUser({ uid: id, email });
    user.fullName = displayName;
    user.displayName = displayName;
    user.contactNumber = contactNumber;
    user.phoneNumber = contactNumber;
    await user.save();

    await getAuth(firebaseApp).updateUser(id, { displayName });

    res.json(user);
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

const issueSignupOtpAndEmail = async ({
  email,
  firebaseUid,
  role,
  contactNumber,
  displayName,
}) => {
  await SignupEmailOtp.deleteMany({ email });
  const otp = String(randomInt(100000, 1000000));
  await SignupEmailOtp.create({
    email,
    firebaseUid,
    role,
    contactNumber: contactNumber ?? "",
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + SIGNUP_OTP_TTL_MS),
  });
  await sendSignupVerificationOtpEmail({
    to: email,
    otp,
    displayName: displayName || email.split("@")[0],
  });
};

authRouter.post("/signup/initiate", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const password = (req.body.password ?? "").trim();
    const fullName = (req.body.fullName ?? req.body.displayName ?? "").trim();
    const contactNumber = (req.body.contactNumber ?? req.body.phoneNumber ?? "").trim();
    const role = String(req.body.role ?? "user").trim();

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Email, password, and full name are required." });
    }

    if (email === ADMIN_EMAIL) {
      return res.status(403).json({ message: "Admin accounts are invite-only." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.",
      });
    }

    if (contactNumber && !phonePattern.test(contactNumber)) {
      return res.status(400).json({ message: "Please enter a valid contact number." });
    }

    if (!["user", "veterinarian", "groomer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Choose pet parent, veterinarian, or professional groomer account." });
    }

    const auth = getAuth(firebaseApp);
    let firebaseUser;

    try {
      const existing = await auth.getUserByEmail(email);
      if (!existing.disabled) {
        return res.status(400).json({ message: "This email is already registered." });
      }
      await auth.updateUser(existing.uid, {
        password,
        displayName: fullName,
        disabled: true,
      });
      firebaseUser = await auth.getUser(existing.uid);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName: fullName,
        disabled: true,
      });
    }

    await issueSignupOtpAndEmail({
      email,
      firebaseUid: firebaseUser.uid,
      role,
      contactNumber,
      displayName: fullName,
    });

    res.json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Signup initiate failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

authRouter.post("/signup/resend-otp", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const auth = getAuth(firebaseApp);
    let firebaseUser;

    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return res.status(400).json({ message: "No pending signup found for this email." });
      }
      throw error;
    }

    if (!firebaseUser.disabled) {
      return res.status(400).json({ message: "This email is already verified." });
    }

    const lastOtp = await SignupEmailOtp.findOne({ email }).sort({ createdAt: -1 });
    const role = lastOtp?.role ?? "user";
    const contactNumber = lastOtp?.contactNumber ?? "";

    await issueSignupOtpAndEmail({
      email,
      firebaseUid: firebaseUser.uid,
      role,
      contactNumber,
      displayName: firebaseUser.displayName || email.split("@")[0],
    });

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error("Signup resend OTP failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

authRouter.post("/signup/verify-otp", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const otp = (req.body.otp ?? "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const otpRecord = await SignupEmailOtp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.usedAt || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "This code has expired. Please request a new one." });
    }

    if (otpRecord.attemptsLeft <= 0) {
      await SignupEmailOtp.deleteMany({ email });
      return res.status(400).json({ message: "Too many incorrect attempts. Please start signup again." });
    }

    if (otpRecord.otpHash !== hashOtp(otp)) {
      otpRecord.attemptsLeft -= 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid code. Please try again." });
    }

    const auth = getAuth(firebaseApp);
    const firebaseUser = await auth.getUser(otpRecord.firebaseUid);

    if (firebaseUser.email?.toLowerCase() !== email) {
      return res.status(400).json({ message: "Invalid verification request." });
    }

    await auth.updateUser(otpRecord.firebaseUid, { disabled: false });
    await SignupEmailOtp.deleteMany({ email });

    const dbUser = await syncFirebaseUser({ uid: otpRecord.firebaseUid, email });
    const chosenRole = otpRecord.role;
    if (["user", "veterinarian", "groomer"].includes(chosenRole) && dbUser.role !== "admin") {
      dbUser.role = chosenRole;
    }
    const cn = (otpRecord.contactNumber ?? "").trim();
    if (cn && phonePattern.test(cn)) {
      dbUser.contactNumber = cn;
      dbUser.phoneNumber = cn;
    }
    await dbUser.save();

    const customToken = await auth.createCustomToken(otpRecord.firebaseUid);
    res.json({ customToken });
  } catch (error) {
    console.error("Signup verify OTP failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const auth = getAuth(firebaseApp);
    let firebaseUser = null;

    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    await PasswordResetOtp.deleteMany({ email });

    if (!firebaseUser) {
      return res.json({
        message: "If an account exists for this email, a reset OTP has been sent.",
      });
    }

    const otp = String(randomInt(100000, 1000000));
    await PasswordResetOtp.create({
      email,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + RESET_OTP_TTL_MS),
    });

    await sendPasswordResetOtpEmail({
      to: email,
      otp,
      displayName: firebaseUser.displayName || email.split("@")[0],
    });

    res.json({ message: "Password reset OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password request failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const otp = (req.body.otp ?? "").trim();
    const newPassword = (req.body.newPassword ?? "").trim();

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const otpRecord = await PasswordResetOtp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.usedAt || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "This OTP has expired. Please request a new one." });
    }

    if (otpRecord.attemptsLeft <= 0) {
      await PasswordResetOtp.deleteMany({ email });
      return res.status(400).json({ message: "Too many incorrect attempts. Please request a new OTP." });
    }

    if (otpRecord.otpHash !== hashOtp(otp)) {
      otpRecord.attemptsLeft -= 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    const auth = getAuth(firebaseApp);
    const firebaseUser = await auth.getUserByEmail(email);

    await auth.updateUser(firebaseUser.uid, { password: newPassword });
    await auth.revokeRefreshTokens(firebaseUser.uid);
    await PasswordResetOtp.deleteMany({ email });

    res.json({ message: "Password reset successfully. Please log in again." });
  } catch (error) {
    console.error("Password reset failed:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});
