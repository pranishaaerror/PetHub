import express from "express";
import Services from "../models/Services.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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
    const { serviceName, description, price, durationMinutes, category, isActive, requiresVet, discountTitle, discountPrice } = req.body;
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
        ...(discountPrice !== undefined && { discountPrice }) },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found." });
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



