import express from "express";
import Appointment from "../models/AppointmentTable.js";

const router = express.Router();

router.post("/",async(req,res) => {
    try{
        const{ appointmentId, appointmentTime, userId, serviceId, } = req.body;
        if (!appointmentId || !appointmentTime || !userId || !serviceId ){
             return res.status(400).json({ message: "All required fields must be provided" });

        }

const newAppointment = new Appointment({
      appointmentId,
      appointmentTime,
      userId,
      serviceId,
      
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
export default router;