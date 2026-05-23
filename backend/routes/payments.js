import express from "express";
import Appointment from "../models/AppointmentTable.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "../services/khaltiService.js";

const router = express.Router();
const FRONTEND_URL = (process.env.FRONTEND_URL ?? "http://localhost:5173").trim();

const buildFrontendRedirectUrl = ({ paymentStatus, appointmentId, bookingId, transactionCode, amount }) => {
  const redirectUrl = new URL("/service-booking", FRONTEND_URL);
  redirectUrl.searchParams.set("payment", paymentStatus);
  if (appointmentId)    redirectUrl.searchParams.set("appointmentId", String(appointmentId));
  if (bookingId)        redirectUrl.searchParams.set("bookingId", bookingId);
  if (transactionCode)  redirectUrl.searchParams.set("transactionCode", transactionCode);
  if (amount)           redirectUrl.searchParams.set("amount", amount);
  return redirectUrl.toString();
};

router.post("/khalti/initiate", verifyToken, async (req, res) => {
   try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required." });
    }

    const appointment = await Appointment.findById(appointmentId).populate("serviceId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Fetch the user to get their name/email/phone for Khalti
    const user = await User.findOne({ uid: req.user.id });

    if (req.user.role !== "admin") {
      if (!user || String(user._id) !== String(appointment.userId)) {
        return res.status(403).json({ message: "You cannot pay for this appointment." });
      }
    }

    if (appointment.payment?.status === "paid") {
      return res.status(409).json({ message: "This appointment is already paid." });
    }

    const amountNPR = Number(appointment.payment?.amount ?? appointment.serviceId?.price ?? 0);
    const amountPaisa = amountNPR * 100;

    const returnUrl = `${FRONTEND_URL}/services?payment=pending&appointmentId=${appointment._id}`;

    const khaltiResponse = await initiateKhaltiPayment({
      amount: amountPaisa,
      purchaseOrderId: appointment.bookingId ?? String(appointment._id),
      purchaseOrderName: appointment.serviceId?.serviceName ?? "PetHub Service",
      returnUrl,
      websiteUrl: FRONTEND_URL,
      customerInfo: { 
        name: user?.displayName ?? user?.name ?? "Customer",
        email: user?.email ?? "",
        phone: user?.phone ?? user?.phoneNumber ?? "",
      },
    });

    appointment.payment = {
      ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
      provider: "khalti",
      currency: "NPR",
      amount: amountNPR,
      status: "unpaid",
      transactionUuid: khaltiResponse.pidx,
      initiatedAt: new Date(),
      providerPayload: khaltiResponse,
    };
    await appointment.save();

    res.json({
      message: "Khalti sandbox payment initialized.",
      paymentUrl: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
      appointment: {
        _id: appointment._id,
        bookingId: appointment.bookingId,
        payment: appointment.payment,
      },
    });
  } catch (error) {
    console.error("Khalti initiation failed:", error);
    res.status(500).json({ message: error.message || "Failed to initialize Khalti payment." });
  }
});

router.post("/khalti/verify", verifyToken, async (req, res) => {
  try {
    const { pidx, appointmentId } = req.body;

    if (!pidx || !appointmentId) {
      return res.status(400).json({ message: "pidx and appointmentId are required." });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const lookup = await verifyKhaltiPayment(pidx);
    console.log(lookup)

    if (lookup.status !== "Completed") {
      appointment.payment = {
        ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
        provider: "khalti",
        currency: "NPR",
        amount: Number(appointment.payment?.amount ?? 0),
        status: "failed",
        providerResponse: lookup,
        lastFailureAt: new Date(),
      };
      await appointment.save();
      return res.status(400).json({ message: `Payment not completed. Status: ${lookup.status}`, lookup });
    }

    appointment.status = "confirmed";
    appointment.payment = {
      ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
      provider: "khalti",
      currency: "NPR",
      amount: Number(lookup.total_amount / 100 ?? appointment.payment?.amount ?? 0),
      status: "paid",
      paidAt: new Date(),
      transactionUuid: pidx,
      transactionCode: lookup.transaction_id ?? pidx,
      referenceId: lookup.transaction_id ?? null,
      providerResponse: lookup,
    };
    await appointment.save();

    res.json({
      message: "Payment verified and confirmed.",
      appointment: {
        _id: appointment._id,
        bookingId: appointment.bookingId,
        payment: appointment.payment,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error("Khalti verification failed:", error);
    res.status(500).json({ message: error.message || "Failed to verify Khalti payment." });
  }
});

export default router;
