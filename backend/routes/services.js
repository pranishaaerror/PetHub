import express from "express";
import Services from "../models/Services.js";
import MedicalRecord from "../models/MedicalRecord.js";
import AppointmentTable from "../models/AppointmentTable.js";
import { verifyToken } from "../middleware/authMiddleware.js";
// import { createNotification } from "../services/notificationService.js";

const router = express.Router();

router.post("/",verifyToken,async(req,res) => {
    try{
        if (req.user.role !== "admin") {
          return res.status(403).json({ message: "Only admins can create services." });
        }

        const{
          serviceName,
          description,
          price,
          durationMinutes = 45,
          category = "vet",
          isActive = true,
          requiresVet = false,
          discountTitle = "",
          discountPrice = null,
          vaccinationIntervalMonths = null,
        } = req.body;

        if (!serviceName || !description || price === undefined) {
             return res.status(400).json({ message: "All required fields must be provided" });

        }

const newServices = new Services({
    price,
    serviceName,
    description,
    durationMinutes,
    category,
    isActive,
    requiresVet,
    discountTitle,
    discountPrice,
    vaccinationIntervalMonths,
    });

    await newServices.save();

    res.status(201).json({
      message: "Services created successfully",
      services: newServices
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await Services.find().sort({ price: 1, serviceName: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update services." });
    }
    const { serviceName, description, price, durationMinutes, category, isActive, requiresVet, discountTitle, discountPrice, vaccinationIntervalMonths } = req.body;
    const service = await Services.findByIdAndUpdate(
      req.params.id,
      { ...(serviceName !== undefined && { serviceName }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(requiresVet !== undefined && { requiresVet }),
        ...(discountTitle !== undefined && { discountTitle }),
        ...(discountPrice !== undefined && { discountPrice }),
        ...(vaccinationIntervalMonths !== undefined && { vaccinationIntervalMonths })},
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found." });

    // ── Recalculate nextDueDate on existing pending vaccination records ──
    // if the interval changed, update all future-dated records for this service
    const intervalChanged =
      (vaccinationIntervalMonths !== undefined && vaccinationIntervalMonths !== null)

    if (intervalChanged && service.category === "vaccination") {
      const newMonths = service.vaccinationIntervalMonths ?? 0;

      if (newMonths > 0 ) {
        // Find appointments for this service that have a nextDueDate in the future
        const pendingApts = await AppointmentTable.find({
          serviceId: service._id,
          nextDueDate: { $gt: new Date() },
          status: "completed",
        });

        for (const apt of pendingApts) {
          const newDue = new Date(apt.appointmentTime);
          newDue.setMonth(newDue.getMonth() + newMonths);
          apt.nextDueDate = newDue;
          await apt.save();

          // Also update the linked medical record (any type)
          await MedicalRecord.updateMany(
            { appointmentId: apt._id, nextDueDate: { $gt: new Date() } },
            { $set: { nextDueDate: newDue } }
          );
        }

        // Also update any vaccination records not linked to an appointment
        // (created manually or by vet) — recalculate from their `date` field
        const standaloneRecords = await MedicalRecord.find({
          type: { $in: ["vaccination", "consultation"] },
          nextDueDate: { $gt: new Date() },
          appointmentId: null,
        });

        for (const rec of standaloneRecords) {
          const newDue = new Date(rec.date);
          newDue.setMonth(newDue.getMonth() + newMonths);
          rec.nextDueDate = newDue;
          await rec.save();
        }
      }
    }

    res.json({ message: "Service updated.", service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete services." });
    }
    const service = await Services.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    res.json({ message: "Service deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



