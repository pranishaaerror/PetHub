import mongoose from "mongoose";

const generateRequestId = () => {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `REQ-${stamp}-${random}`;
};

const engagementRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: generateRequestId,
    },
    type: {
      type: String,
      enum: ["adoption-request", "community-rsvp", "community-message", "medical-upload"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    petName: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    referenceId: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    emailSent: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "responded"],
      default: "new",
      required: true,
    },
  },
  { timestamps: true }
);

engagementRequestSchema.index({ userId: 1, createdAt: -1 });
engagementRequestSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("EngagementRequest", engagementRequestSchema);
