import express from "express";
import Services from "../models/Services.js";

const router = express.Router();

router.post("/",async(req,res) => {
    try{
        const{  serviceName, price } = req.body;
        if ( !price || !serviceName  ){
             return res.status(400).json({ message: "All required fields must be provided" });

        }

const newServices = new Services({
    price,
    
    serviceName
   
      
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
    const services = await Services.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



