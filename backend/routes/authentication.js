import express from "express";
import {firebaseApp} from "../firebaseAdmin.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAuth } from "firebase-admin/auth";
import { createHash, randomInt } from "crypto";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import { sendPasswordResetOtpEmail } from "../services/emailService.js";
import { syncFirebaseUser } from "../services/currentUserService.js";

export const authRouter = express.Router();

const RESET_OTP_TTL_MS = 10 * 60 * 1000;
const phonePattern = /^[+\d][\d\s-]{6,19}$/;

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
