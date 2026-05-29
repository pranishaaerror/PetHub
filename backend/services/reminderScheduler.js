import cron from "node-cron";
import MedicalRecord from "../models/MedicalRecord.js";
import AppointmentTable from "../models/AppointmentTable.js";
import { createNotification } from "./notificationService.js";

const dayStart = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
};

const dayEnd = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setDate(d.getDate() + offsetDays);
  return d;
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/**
 * Send reminders for medical records whose nextDueDate falls exactly
 * `offsetDays` days from today.
 * When offsetDays === 0 (due today), clear nextDueDate after notifying
 * so the reminder disappears from the dashboard.
 */
const sendRecordReminders = async (offsetDays, label) => {
  try {
    const records = await MedicalRecord.find({
      nextDueDate: { $gte: dayStart(offsetDays), $lte: dayEnd(offsetDays) },
      type: "vaccination",
    });

    for (const record of records) {
      if (!record.userId) continue;

      const dueDateStr = formatDate(record.nextDueDate);
      await createNotification({
        userId: record.userId,
        title: `Vaccination due ${label}`,
        message: `Reminder: ${record.title} for your pet is due on ${dueDateStr}. Book your appointment soon to stay on schedule.`,
        type: "booking",
      });

      // On the due date itself — clear nextDueDate so it leaves the dashboard
      if (offsetDays === 0) {
        record.nextDueDate = null;
        await record.save();
      }
    }

    if (records.length > 0) {
      console.log(`[Reminder] Sent ${records.length} vaccination reminder(s) for ${label}.`);
    }
  } catch (err) {
    console.error(`[Reminder] Error sending ${label} reminders:`, err.message);
  }
};

/**
 * Send reminders for appointments whose nextDueDate falls exactly
 * `offsetDays` days from today.
 * When offsetDays === 0, clear nextDueDate after notifying.
 */
const sendAppointmentReminders = async (offsetDays, label) => {
  try {
    const appointments = await AppointmentTable.find({
      nextDueDate: { $gte: dayStart(offsetDays), $lte: dayEnd(offsetDays) },
    });

    for (const apt of appointments) {
      if (!apt.userId) continue;

      const dueDateStr = formatDate(apt.nextDueDate);
      await createNotification({
        userId: apt.userId,
        title: `Vaccination due ${label}`,
        message: `Reminder: ${apt.petName}'s next vaccination is due on ${dueDateStr}. Book your appointment soon to stay on schedule.`,
        type: "booking",
      });

      // On the due date itself — clear nextDueDate so it leaves the dashboard
      if (offsetDays === 0) {
        apt.nextDueDate = null;
        await apt.save();
      }
    }

    if (appointments.length > 0) {
      console.log(`[Reminder] Sent ${appointments.length} appointment-based reminder(s) for ${label}.`);
    }
  } catch (err) {
    console.error(`[Reminder] Error sending appointment ${label} reminders:`, err.message);
  }
};

/**
 * Start the daily reminder cron job.
 * Runs every day at 8:00 AM server time.
 */
export const startReminderScheduler = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("[Reminder] Running daily due-date reminder check…");

    // 7-day advance reminder
    await sendRecordReminders(7, "in 7 days");
    await sendAppointmentReminders(7, "in 7 days");

    // 1-day advance reminder
    await sendRecordReminders(1, "tomorrow");
    await sendAppointmentReminders(1, "tomorrow");

    // On the due date — notify then clear from dashboard
    await sendRecordReminders(0, "today");
    await sendAppointmentReminders(0, "today");
  });

  console.log("[Reminder] Daily vaccination reminder scheduler started (runs at 08:00).");
};
