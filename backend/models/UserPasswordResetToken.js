import mongoose from "mongoose";

const userPasswordResetTokenSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true
  },



}, { timestamps: true });

 export default mongoose.model("UserPasswordToken", userPasswordResetTokenSchema);
