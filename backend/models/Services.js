import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema({
    serviceId:{
        type: String,
        required: true,
    },
    serviceName: {
        type: String,
        required: true,
        trim: true,
        unique: true,

    },
    price:{
        type: Number,
        required: true
    },
   
},{ timestamps: true });
export default mongoose.model("Services", servicesSchema);