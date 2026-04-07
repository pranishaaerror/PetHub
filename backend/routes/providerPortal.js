import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/AppointmentTable.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Pet from "../models/Pet.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentDatabaseUser } from "../services/currentUserService.js";
import { medicalReportUpload } from "../middleware/uploadMiddleware.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();

const VET_CATEGORIES = new Set(["vet", "vaccination", "dental"]);

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const effectiveVetAcceptance = (apt) => {
  if (apt.vetAcceptance && apt.vetAcceptance !== "na") {
    return apt.vetAcceptance;
  }

  const cat = apt.serviceId?.category;
  if (VET_CATEGORIES.has(cat) && apt.status === "pending") {
    return "pending";
  }

  return apt.vetAcceptance || "na";
};

const effectiveGroomerAcceptance = (apt) => {
  if (apt.groomerAcceptance && apt.groomerAcceptance !== "na") {
    return apt.groomerAcceptance;
  }

  if (apt.serviceId?.category === "grooming" && apt.status === "pending") {
    return "pending";
  }

  return apt.groomerAcceptance || "na";
};

const isVetService = (apt) => VET_CATEGORIES.has(apt.serviceId?.category);

const isGroomingService = (apt) => apt.serviceId?.category === "grooming";

const requireRole =
  (...roles) =>
  async (req, res, next) => {
    try {
      const dbUser = await getCurrentDatabaseUser(req);
      if (!roles.includes(dbUser.role)) {
        return res.status(403).json({ message: "You do not have access to this resource." });
      }

      req.dbUser = dbUser;
      return next();
    } catch (error) {
      return res.status(500).json({ message: error.message || "Server error" });
    }
  };

const loadAppointment = async (id) =>
  Appointment.findById(id).populate(["serviceId", "userId", "petId", "groomerId", "veterinarianId"]);

const ownerUserId = (apt) => apt.userId?._id ?? apt.userId;

router.get("/vet/appointments", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const me = req.dbUser._id;
    const items = await Appointment.find({
      status: { $nin: ["cancelled"] },
    })
      .populate(["serviceId", "userId", "petId", "veterinarianId", "groomerId"])
      .sort({ appointmentTime: 1, createdAt: -1 });

    const vetScoped = items.filter((apt) => isVetService(apt));
    const incoming = vetScoped.filter((apt) => {
      if (!["pending", "confirmed"].includes(apt.status)) {
        return false;
      }

      if (effectiveVetAcceptance(apt) !== "pending") {
        return false;
      }

      if (apt.veterinarianId && String(apt.veterinarianId._id ?? apt.veterinarianId) !== String(me)) {
        return false;
      }

      return true;
    });

    const mine = vetScoped.filter(
      (apt) => apt.veterinarianId && String(apt.veterinarianId._id ?? apt.veterinarianId) === String(me)
    );

    res.json({ incoming, mine, all: vetScoped });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/vet/schedule", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const day = req.query.date ? new Date(req.query.date) : new Date();
    if (Number.isNaN(day.getTime())) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const me = req.dbUser._id;
    const from = startOfDay(day);
    const to = endOfDay(day);

    const slots = await Appointment.find({
      veterinarianId: me,
      appointmentTime: { $gte: from, $lte: to },
      status: { $nin: ["cancelled"] },
    })
      .populate(["serviceId", "petId", "userId"])
      .sort({ appointmentTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/vet/appointments/:id/accept", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isVetService(apt)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (effectiveVetAcceptance(apt) !== "pending") {
      return res.status(400).json({ message: "This appointment is not awaiting a veterinarian." });
    }

    if (apt.veterinarianId && String(apt.veterinarianId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "Another veterinarian is assigned to this booking." });
    }

    apt.veterinarianId = req.dbUser._id;
    apt.vetAcceptance = "accepted";
    await apt.save();

    await createNotification({
      userId: ownerUserId(apt),
      title: "Veterinarian assigned",
      message: `A veterinarian accepted your ${apt.serviceId?.serviceName || "visit"} for ${apt.petName}.`,
      type: "booking",
    });

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/vet/appointments/:id/reject", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isVetService(apt)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (effectiveVetAcceptance(apt) !== "pending") {
      return res.status(400).json({ message: "This appointment cannot be rejected." });
    }

    if (apt.veterinarianId && String(apt.veterinarianId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "You cannot reject this booking." });
    }

    apt.vetAcceptance = "rejected";
    apt.status = "cancelled";
    if (apt.payment?.status && apt.payment.status !== "paid") {
      apt.payment.status = "cancelled";
    }

    await apt.save();

    await createNotification({
      userId: ownerUserId(apt),
      title: "Appointment update",
      message: `Your ${apt.serviceId?.serviceName || "visit"} request could not be confirmed by the clinic.`,
      type: "booking",
    });

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/vet/appointments/:id/consultation", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isVetService(apt)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (!apt.veterinarianId || String(apt.veterinarianId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "Only the assigned veterinarian can update this visit." });
    }

    const { diagnosis, consultationNotes, status } = req.body;

    if (diagnosis !== undefined) {
      apt.diagnosis = String(diagnosis).trim();
    }

    if (consultationNotes !== undefined) {
      apt.consultationNotes = String(consultationNotes).trim();
    }

    if (status === "completed") {
      apt.status = "completed";
    }

    await apt.save();

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post(
  "/vet/appointments/:id/medical-report",
  verifyToken,
  requireRole("veterinarian"),
  (req, res, next) => {
    medicalReportUpload.single("report")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed." });
      }

      return next();
    });
  },
  async (req, res) => {
    try {
      const apt = await loadAppointment(req.params.id);

      if (!apt || !isVetService(apt)) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      if (!apt.veterinarianId || String(apt.veterinarianId) !== String(req.dbUser._id)) {
        return res.status(403).json({ message: "Only the assigned veterinarian can upload reports." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "A report file is required." });
      }

      apt.medicalReportUrl = `/uploads/medical/${req.file.filename}`;
      await apt.save();

      const updated = await loadAppointment(apt._id);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
);

router.get("/vet/pets/:petId/medical-records", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const petId = req.params.petId;
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid pet id." });
    }

    const allowed = await Appointment.exists({
      petId,
      veterinarianId: req.dbUser._id,
      vetAcceptance: "accepted",
      status: { $in: ["pending", "confirmed", "completed"] },
    });

    if (!allowed) {
      return res.status(403).json({ message: "You do not have access to this pet's medical history." });
    }

    const records = await MedicalRecord.find({ petId }).sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/vet/medical-records", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const { petId, appointmentId, title, description, date, type = "consultation", documentUrl } = req.body;

    if (!petId || !title || !date) {
      return res.status(400).json({ message: "Pet, title, and date are required." });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found." });
    }

    let appointment = null;
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment || String(appointment.petId) !== String(pet._id)) {
        return res.status(400).json({ message: "Appointment does not match this pet." });
      }

      if (!appointment.veterinarianId || String(appointment.veterinarianId) !== String(req.dbUser._id)) {
        return res.status(403).json({ message: "You are not assigned to this appointment." });
      }
    } else {
      const linked = await Appointment.exists({
        petId: pet._id,
        veterinarianId: req.dbUser._id,
        vetAcceptance: "accepted",
      });

      if (!linked) {
        return res.status(403).json({ message: "You need an active assignment to add records for this pet." });
      }
    }

    const record = await MedicalRecord.create({
      userId: pet.userId,
      petId: pet._id,
      appointmentId: appointment?._id ?? null,
      veterinarianId: req.dbUser._id,
      type,
      title: String(title).trim(),
      description: String(description ?? "").trim(),
      documentUrl: documentUrl ?? null,
      date: new Date(date),
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/vet/payments/summary", verifyToken, requireRole("veterinarian"), async (req, res) => {
  try {
    const me = req.dbUser._id;
    const completed = await Appointment.find({
      veterinarianId: me,
      status: "completed",
      "payment.status": "paid",
    }).populate("serviceId");

    const total = completed.reduce((sum, row) => sum + Number(row.payment?.amount ?? 0), 0);

    res.json({ appointments: completed, totalEarnings: total });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/groomer/bookings", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const me = req.dbUser._id;
    const items = await Appointment.find({
      status: { $nin: ["cancelled"] },
    })
      .populate(["serviceId", "userId", "petId", "groomerId"])
      .sort({ appointmentTime: 1, createdAt: -1 });

    const grooming = items.filter((apt) => isGroomingService(apt));

    const incoming = grooming.filter((apt) => {
      if (!["pending", "confirmed"].includes(apt.status)) {
        return false;
      }

      if (effectiveGroomerAcceptance(apt) !== "pending") {
        return false;
      }

      if (apt.groomerId && String(apt.groomerId._id ?? apt.groomerId) !== String(me)) {
        return false;
      }

      return true;
    });

    const mine = grooming.filter(
      (apt) => apt.groomerId && String(apt.groomerId._id ?? apt.groomerId) === String(me)
    );

    res.json({ incoming, mine, all: grooming });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/groomer/schedule", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const day = req.query.date ? new Date(req.query.date) : new Date();
    if (Number.isNaN(day.getTime())) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const me = req.dbUser._id;
    const from = startOfDay(day);
    const to = endOfDay(day);

    const slots = await Appointment.find({
      groomerId: me,
      appointmentTime: { $gte: from, $lte: to },
      status: { $nin: ["cancelled"] },
    })
      .populate(["serviceId", "petId", "userId"])
      .sort({ appointmentTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/groomer/bookings/:id/accept", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isGroomingService(apt)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (effectiveGroomerAcceptance(apt) !== "pending") {
      return res.status(400).json({ message: "This booking is not awaiting a groomer." });
    }

    if (apt.groomerId && String(apt.groomerId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "Another groomer is already assigned." });
    }

    apt.groomerId = req.dbUser._id;
    apt.groomerAcceptance = "accepted";
    await apt.save();

    await createNotification({
      userId: ownerUserId(apt),
      title: "Groomer assigned",
      message: `Your grooming session for ${apt.petName} has been accepted.`,
      type: "booking",
    });

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/groomer/bookings/:id/reject", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isGroomingService(apt)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (effectiveGroomerAcceptance(apt) !== "pending") {
      return res.status(400).json({ message: "This booking cannot be rejected." });
    }

    if (apt.groomerId && String(apt.groomerId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "You cannot reject this booking." });
    }

    apt.groomerAcceptance = "rejected";
    apt.status = "cancelled";
    if (apt.payment?.status && apt.payment.status !== "paid") {
      apt.payment.status = "cancelled";
    }

    await apt.save();

    await createNotification({
      userId: ownerUserId(apt),
      title: "Grooming booking update",
      message: `Your grooming request for ${apt.petName} was not confirmed.`,
      type: "booking",
    });

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/groomer/bookings/:id/notes", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isGroomingService(apt)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!apt.groomerId || String(apt.groomerId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "Only the assigned groomer can update notes." });
    }

    if (req.body.serviceNotes !== undefined) {
      apt.serviceNotes = String(req.body.serviceNotes).trim();
    }

    await apt.save();

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.patch("/groomer/bookings/:id/complete", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const apt = await loadAppointment(req.params.id);

    if (!apt || !isGroomingService(apt)) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!apt.groomerId || String(apt.groomerId) !== String(req.dbUser._id)) {
      return res.status(403).json({ message: "Only the assigned groomer can complete this booking." });
    }

    const { serviceNotes } = req.body;
    if (serviceNotes !== undefined) {
      apt.serviceNotes = String(serviceNotes).trim();
    }

    apt.status = "completed";
    await apt.save();

    const updated = await loadAppointment(apt._id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/groomer/payments/summary", verifyToken, requireRole("groomer"), async (req, res) => {
  try {
    const me = req.dbUser._id;
    const completed = await Appointment.find({
      groomerId: me,
      status: "completed",
      "payment.status": "paid",
    }).populate("serviceId");

    const total = completed.reduce((sum, row) => sum + Number(row.payment?.amount ?? 0), 0);

    res.json({ appointments: completed, totalEarnings: total });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

export default router;
