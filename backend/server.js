import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import authRoutes from"./routes/authentication.js";
import serviceRoutes from "./routes/services.js";
import appointmentRoutes from "./routes/appointment.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send("API is running");
});
app.use("/api/users", userRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/appointments",appointmentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
