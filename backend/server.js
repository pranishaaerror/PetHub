import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/users.js";
import {authRouter} from"./routes/authentication.js";
import serviceRoutes from "./routes/services.js";
import groomerRoutes from "./routes/groomer.js";
import appointmentRoutes from "./routes/appointment.js";
import adoptionRoutes from "./routes/adoption.js";
import adoptionPetRoutes from "./routes/adoptionPets.js";
import adoptionRequestRoutes from "./routes/adoptionRequests.js";
import paymentRoutes from "./routes/payments.js";
import engagementRoutes from "./routes/engagements.js";
import petRoutes from "./routes/pets.js";
import recordRoutes from "./routes/records.js";
import bookingRoutes from "./routes/bookings.js";
import onboardingRoutes from "./routes/onboarding.js";
import communityRoutes from "./routes/community.js";
import notificationRoutes from "./routes/notifications.js";
import { ensureAdminAccount } from "./adminAccount.js";
import { ensureDefaultServices } from "./serviceCatalog.js";
import { ensureDefaultAdoptionPets } from "./adoptionCatalog.js";
import { ensureDefaultCommunityMeetups } from "./communityCatalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });


const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));



const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("MongoDB connected");
    await ensureAdminAccount();
    await ensureDefaultServices();
    await ensureDefaultAdoptionPets();
    await ensureDefaultCommunityMeetups();
})
  .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send("API is running");
});
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
app.use("/api/users", userRoutes);
app.use("/api/auth",authRouter);
app.use("/api/pets", petRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/engagements", engagementRoutes);
app.use("/api/groomers",groomerRoutes);
app.use("/api/adoption",adoptionRoutes);
app.use("/api/adoption-pets", adoptionPetRoutes);
app.use("/api/adoption-requests", adoptionRequestRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
