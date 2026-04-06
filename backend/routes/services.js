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
    const services = await Services.find({ isActive: true }).sort({ price: 1, serviceName: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



