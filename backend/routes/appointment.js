import express from "express";
import Appointment from "../models/AppointmentTable.js";

const router = express.Router();

router.post("/",async(req,res) => {
    try{
        const{  appointmentTime, userId, serviceId, } = req.body;
        if ( !appointmentTime || !userId || !serviceId ){
             return res.status(400).json({ message: "All required fields must be provided" });

        }
       

const newAppointment = new Appointment({
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

 router.get("/", async (req, res) => {
          try {
            const appointment = await Appointment.find().populate(['userId',"serviceId"]);
            res.json(appointment);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
        })

export default router;