import mongoose from "mongoose";

const adoptionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adoption",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      required: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    householdType: {
      type: String,
      trim: true,
      default: "",
    },
    lifestyle: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

adoptionRequestSchema.index({ userId: 1, petId: 1, createdAt: -1 });

export default mongoose.model("AdoptionRequest", adoptionRequestSchema);
