import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema(
  {
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female'],
    },
    intakeDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Pending', 'Adopted'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

export default mongoose.model("Adoption", adoptionSchema);