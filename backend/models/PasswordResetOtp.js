import mongoose from "mongoose";

const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attemptsLeft: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("PasswordResetOtp", passwordResetOtpSchema);
