import mongoose from "mongoose";

const slugifyServiceName = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const servicesSchema = new mongoose.Schema({
   
    serviceName: {
        type: String,
        required: true,
        trim: true,
        unique: true,

    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    price:{
        type: Number,
        required: true,
        min: 0,
    },
    durationMinutes: {
        type: Number,
        required: true,
        min: 15,
        default: 45,
    },
    category: {
        type: String,
        enum: ["vet", "grooming", "vaccination", "dental"],
        default: "vet",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    },
   
},{ timestamps: true });

servicesSchema.pre("validate", function preValidate(next) {
    if (!this.slug && this.serviceName) {
        this.slug = slugifyServiceName(this.serviceName);
    }

    next();
});

export default mongoose.model("Services", servicesSchema);
