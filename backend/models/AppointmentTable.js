import mongoose from "mongoose";
const appointmentTableSchema = new mongoose.Schema({
    appointmentId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    appointmentTime:{
        type: Date,
        required: true
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
    groomerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },

    status:{
        type: String,
        enum: ["pending","approved","cancelled"],
        default:"pending"
    }
}
,{ timestamps: true })




export default mongoose.model("AppointmentTable", appointmentTableSchema);