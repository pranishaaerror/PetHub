import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema(
  {
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    species: {
      type: String,
      default: "",
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
    size: {
      type: String,
      default: "Medium",
      trim: true,
    },
    vaccinated: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      default: "Healthy and under observation",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    temperament: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "PetHub Care Lounge",
      trim: true,
    },
    adoptionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageGallery: {
      type: [String],
      default: [],
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

adoptionSchema.pre("save", function syncAdoptionAliases(next) {
  if (this.name && !this.petName) {
    this.petName = this.name;
  }

  if (this.petName && !this.name) {
    this.name = this.petName;
  }

  next();
});

export default mongoose.model("Adoption", adoptionSchema);
