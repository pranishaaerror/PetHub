import Notification from "../models/Notification.js";

export const createNotification = async ({ userId, title, message, type = "general" }) =>
  Notification.create({
    userId,
    title,
    message,
    type,
  });
