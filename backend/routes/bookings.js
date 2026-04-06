import express from "express";
import AppointmentTable from "../models/AppointmentTable.js";
import Services from "../models/Services.js";
import Pet from "../models/Pet.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";
import { sendAppointmentConfirmationEmail } from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();
const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];
const phonePattern = /^[+\d][\d\s-]{6,19}$/;

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const {
      petId,
      serviceId,
      ownerName,
      phoneNumber,
      notes = "",
      bookingDate,
      bookingTime,
    } = req.body;

    if (!petId || !serviceId || !ownerName || !phoneNumber || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: "Pet, service, owner, phone number, date, and time are required." });
    }

    if (!phonePattern.test(String(phoneNumber).trim())) {
      return res.status(400).json({ message: "Please enter a valid phone number." });
    }

    const pet = await Pet.findOne({
      _id: petId,
      ...(req.user.role === "admin" ? {} : { userId: user._id }),
    });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    const service = await Services.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not found." });
    }

    const appointmentTime = new Date(`${bookingDate}T${bookingTime}:00`);
    if (Number.isNaN(appointmentTime.getTime()) || appointmentTime <= new Date()) {
      return res.status(400).json({ message: "Please choose a future booking slot." });
    }

    const existing = await AppointmentTable.findOne({
      serviceId,
      appointmentTime,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    });

    if (existing) {
      return res.status(409).json({ message: "That slot is already reserved. Please choose another time." });
    }

    const booking = await AppointmentTable.create({
      appointmentTime,
      ownerName: String(ownerName).trim(),
      ownerEmail: user.email,
      contactNumber: String(phoneNumber).trim(),
      petName: pet.name,
      petType: pet.species,
      note: String(notes).trim(),
      userId: user._id,
      petId: pet._id,
      serviceId: service._id,
      status: "pending",
      payment: {
        provider: "esewa",
        currency: "NPR",
        amount: Number(service.price),
        status: "unpaid",
      },
    });

    await createNotification({
      userId: user._id,
      title: "Booking reserved",
      message: `${pet.name}'s ${service.serviceName} visit is reserved for ${appointmentTime.toLocaleString()}.`,
      type: "booking",
    });

    try {
      await sendAppointmentConfirmationEmail({
        to: booking.ownerEmail,
        ownerName: booking.ownerName,
        bookingId: booking.bookingId,
        serviceName: service.serviceName,
        appointmentTime,
        petName: pet.name,
      });
    } catch (error) {
      console.error("Booking confirmation email failed:", error.message);
    }

    const populated = await AppointmentTable.findById(booking._id).populate(["serviceId", "petId"]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const query = req.user.role === "admin" ? {} : { userId: user._id };
    const bookings = await AppointmentTable.find(query)
      .populate(["serviceId", "petId"])
      .sort({ appointmentTime: 1, createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:id/reschedule", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const booking = await AppointmentTable.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (req.user.role !== "admin" && String(booking.userId) !== String(user._id)) {
      return res.status(403).json({ message: "You cannot update this booking." });
    }

    const appointmentTime = new Date(`${req.body.bookingDate}T${req.body.bookingTime}:00`);
    if (Number.isNaN(appointmentTime.getTime()) || appointmentTime <= new Date()) {
      return res.status(400).json({ message: "Please choose a future booking slot." });
    }

    const conflict = await AppointmentTable.findOne({
      _id: { $ne: booking._id },
      serviceId: booking.serviceId,
      appointmentTime,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    });

    if (conflict) {
      return res.status(409).json({ message: "That slot is already reserved." });
    }

    booking.appointmentTime = appointmentTime;
    booking.status = "confirmed";
    await booking.save();

    await createNotification({
      userId: booking.userId,
      title: "Booking rescheduled",
      message: `Your booking ${booking.bookingId} was moved to ${appointmentTime.toLocaleString()}.`,
      type: "booking",
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const user = await getCurrentDatabaseUser(req);
    const booking = await AppointmentTable.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (req.user.role !== "admin" && String(booking.userId) !== String(user._id)) {
      return res.status(403).json({ message: "You cannot cancel this booking." });
    }

    booking.status = "cancelled";
    if (booking.payment?.status !== "paid") {
      booking.payment.status = "cancelled";
    }
    await booking.save();

    await createNotification({
      userId: booking.userId,
      title: "Booking cancelled",
      message: `Your booking ${booking.bookingId} has been cancelled.`,
      type: "booking",
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
