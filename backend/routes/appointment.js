import express from "express";
import Appointment from "../models/AppointmentTable.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Services from "../models/Services.js";
import { sendAppointmentConfirmationEmail } from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();
const ACTIVE_APPOINTMENT_STATUSES = ["pending", "confirmed"];
const phonePattern = /^[+\d][\d\s-]{6,19}$/;

router.post("/",verifyToken,async(req,res) => {
    try{
        const { id, email } = req.user;
        const user = await User.findOne({ uid:id });
        if (!user) {
          return res.status(404).json({ message: "User profile not found" });
        }

        const {
          appointmentTime,
          serviceId,
          ownerName,
          contactNumber,
          petName,
          petType,
          note = "",
        } = req.body;

        if (!appointmentTime || !serviceId || !ownerName || !contactNumber || !petName || !petType) {
             return res.status(400).json({ message: "Service, owner, and pet details are all required." });
        }

        if (!phonePattern.test(contactNumber.trim())) {
          return res.status(400).json({ message: "Please enter a valid contact number." });
        }

        const scheduledAt = new Date(appointmentTime);
        if (Number.isNaN(scheduledAt.getTime())) {
          return res.status(400).json({ message: "Please choose a valid appointment time." });
        }

        if (scheduledAt <= new Date()) {
          return res.status(400).json({ message: "Appointments must be booked for a future time." });
        }

        const service = await Services.findById(serviceId);
        if (!service || !service.isActive) {
          return res.status(404).json({ message: "This service is not currently available." });
        }

        const existingAppointment = await Appointment.findOne({
          serviceId,
          appointmentTime: scheduledAt,
          status: { $in: ACTIVE_APPOINTMENT_STATUSES },
        });

        if (existingAppointment) {
          return res.status(409).json({ message: "That time slot is already taken. Please choose another one." });
        }

        const newAppointment = await Appointment.create({
          appointmentTime: scheduledAt,
          ownerName: String(ownerName).trim(),
          ownerEmail: (email ?? user.email ?? "").trim().toLowerCase(),
          contactNumber: String(contactNumber).trim(),
          petName: String(petName).trim(),
          petType: String(petType).trim(),
          note: String(note ?? "").trim(),
          userId:user._id,
          serviceId,
          status: "pending",
          payment: {
            provider: "esewa",
            currency: "NPR",
            amount: Number(service.price),
            status: "unpaid",
          },
        });

        const appointment = await Appointment.findById(newAppointment._id).populate(["userId", "serviceId"]);
        let emailSent = false;

        try {
          await sendAppointmentConfirmationEmail({
            to: appointment.ownerEmail,
            ownerName: appointment.ownerName,
            bookingId: appointment.bookingId,
            serviceName: appointment.serviceId.serviceName,
            appointmentTime: appointment.appointmentTime,
            petName: appointment.petName,
          });
          emailSent = true;
        } catch (emailError) {
          console.error("Appointment confirmation email failed:", emailError.message);
        }

    res.status(201).json({
      message: emailSent
        ? "Appointment created successfully and confirmation email sent."
        : "Appointment created successfully.",
      appointment,
      emailSent,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

 router.get("/", verifyToken, async (req, res) => {
          try {
            let query = {};

            if (req.user.role !== "admin") {
              const user = await User.findOne({ uid: req.user.id });

              if (!user) {
                return res.status(404).json({ message: "User profile not found" });
              }

              query = { userId: user._id };
            }

            const appointment = await Appointment.find(query)
              .populate(["userId", "serviceId"])
              .sort({ appointmentTime: 1, createdAt: -1 });
            res.json(appointment);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
        })

router.patch("/:appointmentId/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can change appointment status." });
    }

    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status },
      { new: true, runValidators: true }
    ).populate(["userId", "serviceId"]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    await createNotification({
      userId: appointment.userId._id,
      title: "Booking status updated",
      message: `${appointment.serviceId.serviceName} for ${appointment.petName} is now ${status}.`,
      type: "booking",
    });

    res.json({
      message: "Appointment status updated successfully.",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
