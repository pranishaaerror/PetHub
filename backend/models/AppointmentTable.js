import mongoose from "mongoose";

const generateBookingId = () => {
    const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `APT-${stamp}-${random}`;
};

const appointmentTableSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true,
        default: generateBookingId,
    },
   
    appointmentTime:{
        type: Date,
        required: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true,
    },
    ownerEmail: {
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
        required: true,
        trim: true,
    },
    petType: {
        type: String,
        required: true,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
        default: "",
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'User'
        
    },
    serviceId:{
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'Services'

    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        default: null,
    },
    groomerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    payment: {
        provider: {
            type: String,
            enum: ["esewa"],
            default: "esewa",
            required: true,
        },
        currency: {
            type: String,
            enum: ["NPR"],
            default: "NPR",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["unpaid", "initiated", "paid", "failed", "cancelled"],
            default: "unpaid",
            required: true,
        },
        transactionUuid: {
            type: String,
            default: null,
        },
        transactionCode: {
            type: String,
            default: null,
        },
        referenceId: {
            type: String,
            default: null,
        },
        initiatedAt: {
            type: Date,
            default: null,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        lastFailureAt: {
            type: Date,
            default: null,
        },
        providerPayload: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        providerResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },

    status:{
        type: String,
        enum: ["pending","confirmed","cancelled","completed"],
        default:"pending"
    }
}
,{ timestamps: true })

appointmentTableSchema.index({ userId: 1, appointmentTime: 1 });
appointmentTableSchema.index({ serviceId: 1, appointmentTime: 1, status: 1 });
appointmentTableSchema.index({ "payment.transactionUuid": 1 });

export default mongoose.model("AppointmentTable", appointmentTableSchema);
