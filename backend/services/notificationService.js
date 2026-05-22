import Notification from "../models/Notification.js";
import User from "../models/User.js";

const typeLabels = {
  booking:    "Booking Update",
  adoption:   "Adoption Update",
  community:  "Community Update",
  onboarding: "Onboarding Update",
  general:    "PetHub Notification",
};

const sendNotificationEmail = async ({ userId, title, message }) => {
  try {
    // Lazy import to avoid circular deps
    const { default: nodemailer } = await import("nodemailer");

    const EMAIL_USER = (process.env.EMAIL_USER ?? process.env.GMAIL_USER ?? "").trim();
    const EMAIL_PASS = (process.env.EMAIL_PASS ?? process.env.GMAIL_APP_PASSWORD ?? "")
      .replace(/"/g, "").replace(/\s+/g, "");
    const EMAIL_HOST = (process.env.EMAIL_HOST ?? "smtp.gmail.com").trim();
    const EMAIL_PORT = Number(process.env.EMAIL_PORT ?? 465);
    const EMAIL_SECURE = String(process.env.EMAIL_SECURE ?? "true").toLowerCase() !== "false";
    const EMAIL_FROM_RAW = (process.env.EMAIL_FROM ?? "").trim();
    const FROM_ADDRESS = EMAIL_FROM_RAW || (EMAIL_USER ? `PetHub <${EMAIL_USER}>` : "");

    if (!EMAIL_USER || !EMAIL_PASS) return;

    const user = await User.findById(userId).select("email fullName displayName");
    if (!user?.email) return;

    const recipientName = user.fullName || user.displayName || "PetHub User";

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: user.email,
      subject: `PetHub: ${title}`,
      text: `Hello ${recipientName},\n\n${message}\n\nThank you for using PetHub.`,
      html: `
        <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
            <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Notification</p>
            <h1 style="margin: 12px 0 8px; font-size: 24px;">${title}</h1>
            <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">Hello ${recipientName},</p>
            <div style="background: #FFF4E2; border-radius: 20px; padding: 18px;">
              <p style="margin: 0; line-height: 1.8; color: #2D2D2D;">${message}</p>
            </div>
            <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8; font-size: 13px;">
              You can view all your notifications in the PetHub app.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // Email failure should never break the notification flow
    console.error("Notification email failed:", err.message);
  }
};

export const createNotification = async ({ userId, title, message, type = "general" }) => {
  const notification = await Notification.create({ userId, title, message, type });

  // Send email in background — don't await so it doesn't slow down the response
  sendNotificationEmail({ userId, title, message }).catch(() => {});

  return notification;
};
