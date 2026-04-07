import express from "express";
import Appointment from "../models/AppointmentTable.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  buildEsewaFormData,
  decodeEsewaData,
  getEsewaConfig,
  verifyEsewaResponseSignature,
  verifyEsewaTransactionStatus,
} from "../services/esewaService.js";

const router = express.Router();
const FRONTEND_URL = (process.env.FRONTEND_URL ?? "http://localhost:5173").trim();

const buildBackendBaseUrl = (req) =>
  (process.env.BACKEND_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`).trim();

const buildFrontendRedirectUrl = ({ paymentStatus, appointmentId, bookingId, transactionCode }) => {
  const redirectUrl = new URL("/service-booking", FRONTEND_URL);
  redirectUrl.searchParams.set("payment", paymentStatus);

  if (appointmentId) {
    redirectUrl.searchParams.set("appointmentId", appointmentId);
  }

  if (bookingId) {
    redirectUrl.searchParams.set("bookingId", bookingId);
  }

  if (transactionCode) {
    redirectUrl.searchParams.set("transactionCode", transactionCode);
  }

  return redirectUrl.toString();
};

router.post("/esewa/initiate", verifyToken, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required." });
    }

    const appointment = await Appointment.findById(appointmentId).populate("serviceId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (req.user.role !== "admin") {
      const user = await User.findOne({ uid: req.user.id });

      if (!user || String(user._id) !== String(appointment.userId)) {
        return res.status(403).json({ message: "You cannot pay for this appointment." });
      }
    }

    if (appointment.payment?.status === "paid") {
      return res.status(409).json({ message: "This appointment is already paid." });
    }

    const transactionUuid = `${appointment.bookingId}-${Date.now()}`;
    const backendBaseUrl = buildBackendBaseUrl(req);
    const successUrl = `${backendBaseUrl}/api/payments/esewa/success/${appointment._id}`;
    const failureUrl = `${backendBaseUrl}/api/payments/esewa/failure/${appointment._id}`;
    const amount = Number(appointment.payment?.amount ?? appointment.serviceId?.price ?? 0);

    const formData = buildEsewaFormData({
      amount,
      transactionUuid,
      successUrl,
      failureUrl,
    });

    appointment.payment = {
      ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
      provider: "esewa",
      currency: "NPR",
      amount,
      status: "initiated",
      transactionUuid,
      initiatedAt: new Date(),
      providerPayload: formData,
    };
    await appointment.save();

    res.json({
      message: "eSewa sandbox payment initialized.",
      formAction: getEsewaConfig().formUrl,
      formData,
      appointment: {
        _id: appointment._id,
        bookingId: appointment.bookingId,
        payment: appointment.payment,
      },
    });
  } catch (error) {
    console.error("eSewa initiation failed:", error);
    res.status(500).json({ message: error.message || "Failed to initialize eSewa payment." });
  }
});

router.get("/esewa/success/:appointmentId", async (req, res) => {
  try {
    const encodedData = req.query.data ?? req.body?.data;
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.redirect(buildFrontendRedirectUrl({ paymentStatus: "missing" }));
    }

    if (!encodedData) {
      appointment.payment = {
        ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
        provider: "esewa",
        currency: "NPR",
        amount: Number(appointment.payment?.amount ?? 0),
      };
      appointment.payment.status = "failed";
      appointment.payment.lastFailureAt = new Date();
      await appointment.save();
      return res.redirect(
        buildFrontendRedirectUrl({
          paymentStatus: "failed",
          appointmentId: appointment._id,
          bookingId: appointment.bookingId,
        })
      );
    }

    const responsePayload = decodeEsewaData(encodedData);
    const signatureValid = verifyEsewaResponseSignature(responsePayload);

    if (!signatureValid) {
      appointment.payment = {
        ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
        provider: "esewa",
        currency: "NPR",
        amount: Number(appointment.payment?.amount ?? 0),
      };
      appointment.payment.status = "failed";
      appointment.payment.providerResponse = responsePayload;
      appointment.payment.lastFailureAt = new Date();
      await appointment.save();
      return res.redirect(
        buildFrontendRedirectUrl({
          paymentStatus: "invalid-signature",
          appointmentId: appointment._id,
          bookingId: appointment.bookingId,
        })
      );
    }

    const statusResult = await verifyEsewaTransactionStatus({
      transactionUuid: responsePayload.transaction_uuid,
      totalAmount: responsePayload.total_amount,
    });

    const status = statusResult?.status ?? responsePayload.status;
    const transactionCode =
      responsePayload.transaction_code ?? statusResult?.refId ?? statusResult?.ref_id ?? null;

    if (status !== "COMPLETE") {
      appointment.payment = {
        ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
        provider: "esewa",
        currency: "NPR",
        amount: Number(appointment.payment?.amount ?? 0),
      };
      appointment.payment.status = "failed";
      appointment.payment.providerResponse = {
        responsePayload,
        statusResult,
      };
      appointment.payment.lastFailureAt = new Date();
      await appointment.save();
      return res.redirect(
        buildFrontendRedirectUrl({
          paymentStatus: "failed",
          appointmentId: appointment._id,
          bookingId: appointment.bookingId,
        })
      );
    }

    appointment.payment = {
      ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
      provider: "esewa",
      currency: "NPR",
      amount: Number(
        appointment.payment?.amount ?? responsePayload.total_amount ?? statusResult?.total_amount ?? 0
      ),
    };
    appointment.status = "confirmed";
    appointment.payment.status = "paid";
    appointment.payment.paidAt = new Date();
    appointment.payment.transactionUuid =
      responsePayload.transaction_uuid ?? appointment.payment.transactionUuid ?? null;
    appointment.payment.transactionCode = responsePayload.transaction_code ?? transactionCode;
    appointment.payment.referenceId = statusResult?.refId ?? statusResult?.ref_id ?? null;
    appointment.payment.providerResponse = {
      responsePayload,
      statusResult,
    };
    await appointment.save();

    res.redirect(
      buildFrontendRedirectUrl({
        paymentStatus: "success",
        appointmentId: appointment._id,
        bookingId: appointment.bookingId,
        transactionCode: appointment.payment.transactionCode,
      })
    );
  } catch (error) {
    console.error("eSewa success callback failed:", error);
    res.redirect(buildFrontendRedirectUrl({ paymentStatus: "failed" }));
  }
});

router.get("/esewa/failure/:appointmentId", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.redirect(buildFrontendRedirectUrl({ paymentStatus: "failed" }));
    }

    appointment.payment = {
      ...(appointment.payment?.toObject?.() ?? appointment.payment ?? {}),
      provider: "esewa",
      currency: "NPR",
      amount: Number(appointment.payment?.amount ?? 0),
    };
    appointment.payment.status = "cancelled";
    appointment.payment.lastFailureAt = new Date();
    await appointment.save();

    res.redirect(
      buildFrontendRedirectUrl({
        paymentStatus: "cancelled",
        appointmentId: appointment._id,
        bookingId: appointment.bookingId,
      })
    );
  } catch (error) {
    console.error("eSewa failure callback failed:", error);
    res.redirect(buildFrontendRedirectUrl({ paymentStatus: "failed" }));
  }
});

export default router;
