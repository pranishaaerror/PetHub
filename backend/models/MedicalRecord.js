import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["vaccination", "prescription", "surgery", "allergy", "lab", "document"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    documentUrl: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

medicalRecordSchema.index({ petId: 1, date: -1 });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
