import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema(
  {
    adoptionId: {
      type: String,
      required: true,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    adopterName: {
      type: String,
      required: true,
      trim: true,
    },
    adopterContact: {
      type: String,
      required: true,
    },
   
   
  },
  { timestamps: true }
);

export default mongoose.model("Adoption", adoptionSchema);
