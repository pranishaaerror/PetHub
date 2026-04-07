import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    age: {
      type: String,
      default: "",
    },
    weight: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    microchipId: {
      type: String,
      default: "",
      trim: true,
    },
    vaccinationStatus: {
      type: String,
      default: "Needs review",
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    preferredClinic: {
      type: String,
      default: "",
    },
    planType: {
      type: String,
      default: "Premium Care",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

petSchema.index({ userId: 1, isPrimary: -1, createdAt: -1 });

export default mongoose.model("Pet", petSchema);
