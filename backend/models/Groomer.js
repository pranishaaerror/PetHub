import mongoose from "mongoose";
const groomerSchema = new mongoose.Schema(
  {
    groomerId: {
      type: String,
      required: true,
    },
    groomerName: {
      type: String,
      required: true,
      trim: true,
    },
} , { timestamps: true })
export default mongoose.model("Groomer", groomerSchema);