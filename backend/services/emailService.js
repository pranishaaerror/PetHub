import nodemailer from "nodemailer";

const EMAIL_FROM_RAW = (process.env.EMAIL_FROM ?? "").trim();
const EMAIL_USER = (process.env.EMAIL_USER ?? process.env.GMAIL_USER ?? "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS ?? process.env.GMAIL_APP_PASSWORD ?? "")
  .replace(/"/g, "")
  .replace(/\s+/g, "");
const EMAIL_HOST = (process.env.EMAIL_HOST ?? "smtp.gmail.com").trim();
const EMAIL_PORT = Number(process.env.EMAIL_PORT ?? 465);
const EMAIL_SECURE = String(process.env.EMAIL_SECURE ?? "true").toLowerCase() !== "false";

const ADMIN_RECIPIENT = (process.env.ADMIN_EMAIL ?? EMAIL_USER).trim();
const DEFAULT_FROM = EMAIL_USER ? `PetHub <${EMAIL_USER}>` : "";
const FROM_ADDRESS = EMAIL_FROM_RAW || DEFAULT_FROM;

const transporter =
  EMAIL_USER && EMAIL_PASS
    ? nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_SECURE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      })
    : null;

const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error("Email service is not configured.");
  }
  await transporter.sendMail({ from: FROM_ADDRESS, to, subject, text, html });
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderHtmlFields = (fields) =>
  fields
    .map(
      ({ label, value }) =>
        `<p style="margin: 0 0 10px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    )
    .join("");

const renderTextFields = (fields) =>
  fields.map(({ label, value }) => `${label}: ${value}`).join("\n");

export const sendAppointmentConfirmationEmail = async ({
  to,
  ownerName,
  bookingId,
  serviceName,
  appointmentTime,
  petName,
}) => {
  const scheduledFor = new Date(appointmentTime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await sendMail({
    to,
    subject: `PetHub appointment confirmed: ${bookingId}`,
    text: `Hello ${ownerName}, your appointment for ${petName} is confirmed. Booking ID: ${bookingId}. Service: ${serviceName}. Time: ${scheduledFor}.`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Booking</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">Appointment confirmed</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">
            Hello ${ownerName}, your booking for ${petName} is ready.
          </p>
          <div style="background: #FFF4E2; border-radius: 20px; padding: 18px;">
            <p style="margin: 0 0 10px;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 0 0 10px;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 0;"><strong>Scheduled for:</strong> ${scheduledFor}</p>
          </div>
          <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8;">
            Keep this email handy when you arrive. We will take care of the rest.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendSignupVerificationOtpEmail = async ({ to, otp, displayName }) => {
  await sendMail({
    to,
    subject: "Verify your PetHub email",
    text: `Hello ${displayName}, your PetHub signup verification code is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Signup</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">Verify your email</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">
            Hello ${displayName}, use the code below to finish creating your PetHub account.
          </p>
          <div style="background: linear-gradient(135deg, #F5A623, #FFB347); border-radius: 20px; padding: 18px; text-align: center; color: #FFFFFF;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase;">Verification code</p>
            <p style="margin: 10px 0 0; font-size: 32px; font-weight: 800; letter-spacing: 0.18em;">${otp}</p>
          </div>
          <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8;">
            This code expires in 5 minutes. If you did not sign up, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetOtpEmail = async ({ to, otp, displayName }) => {
  await sendMail({
    to,
    subject: "PetHub password reset OTP",
    text: `Hello ${displayName}, your PetHub password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Security</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">Reset your password</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">
            Hello ${displayName}, use the OTP below to reset your password.
          </p>
          <div style="background: linear-gradient(135deg, #F5A623, #FFB347); border-radius: 20px; padding: 18px; text-align: center; color: #FFFFFF;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase;">One-time password</p>
            <p style="margin: 10px 0 0; font-size: 32px; font-weight: 800; letter-spacing: 0.18em;">${otp}</p>
          </div>
          <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8;">
            This OTP expires in 10 minutes. If you did not request this reset, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendAdoptionStatusEmail = async ({ to, recipientName, petName, status, requestId }) => {
  const statusMessages = {
    approved: {
      subject: "Your adoption request was approved! 🐾",
      headline: "Great news!",
      body: `Your adoption request for <strong>${escapeHtml(petName)}</strong> has been <strong>approved</strong>. The PetHub team will be in touch shortly to guide you through the next steps.`,
    },
    rejected: {
      subject: "Update on your adoption request",
      headline: "Request not approved",
      body: `Unfortunately, your adoption request for <strong>${escapeHtml(petName)}</strong> was not approved at this time. You're welcome to browse other pets and apply again.`,
    },
    cancelled: {
      subject: "Your adoption request was cancelled",
      headline: "Request cancelled",
      body: `Your adoption request for <strong>${escapeHtml(petName)}</strong> has been cancelled. If you have questions, please reach out to the PetHub team.`,
    },
    pending: {
      subject: "Your adoption request is under review",
      headline: "Request received",
      body: `Your adoption request for <strong>${escapeHtml(petName)}</strong> is currently under review. We'll notify you as soon as there's an update.`,
    },
  };

  const cfg = statusMessages[status] ?? statusMessages.pending;

  await sendMail({
    to,
    subject: cfg.subject,
    text: `Hello ${recipientName}, ${cfg.body.replace(/<[^>]+>/g, "")} Request ID: ${requestId}.`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Adoption</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">${escapeHtml(cfg.headline)}</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">Hello ${escapeHtml(recipientName)},</p>
          <div style="background: #FFF4E2; border-radius: 20px; padding: 18px;">
            <p style="margin: 0 0 10px; line-height: 1.8;">${cfg.body}</p>
            <p style="margin: 0; color: #9B9B9B; font-size: 12px;">Request ID: ${escapeHtml(requestId)}</p>
          </div>
          <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8;">
            Thank you for choosing PetHub. Every adoption story matters to us.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendEngagementEmails = async ({
  requesterEmail,
  requesterName,
  requestId,
  typeLabel,
  title,
  intro,
  fields,
}) => {
  const normalizedFields = [{ label: "Request ID", value: requestId }, ...fields];
  const textFields = renderTextFields(normalizedFields);
  const htmlFields = renderHtmlFields(normalizedFields);

  await sendMail({
    to: requesterEmail,
    subject: `PetHub ${typeLabel}: ${requestId}`,
    text: `Hello ${requesterName}, ${intro}\n\n${textFields}\n\nPetHub will follow up with you soon.`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Request</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">${escapeHtml(title)}</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">
          
            Hello ${escapeHtml(requesterName)}, ${escapeHtml(intro)}
          </p>
          <div style="background: #FFF4E2; border-radius: 20px; padding: 18px;">
            ${htmlFields}
          </div>
          <p style="margin: 18px 0 0; color: #6B6B6B; line-height: 1.8;">
            PetHub will follow up with you soon and keep the flow warm, clear, and easy to track.
          </p>
        </div>
      </div>
    `,
  });

  if (!ADMIN_RECIPIENT) {
    return;
  }

  await sendMail({
    to: ADMIN_RECIPIENT,
    subject: `New PetHub ${typeLabel}: ${requestId}`,
    text: `A new ${typeLabel.toLowerCase()} was submitted.\n\n${textFields}`,
    html: `
      <div style="font-family: Plus Jakarta Sans, Arial, sans-serif; color: #2D2D2D; background: #FFF8EE; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 24px; box-shadow: 0 18px 35px rgba(45,45,45,0.08);">
          <p style="font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: #B78331;">PetHub Inbox</p>
          <h1 style="margin: 12px 0 8px; font-size: 28px;">New ${escapeHtml(typeLabel.toLowerCase())}</h1>
          <p style="margin: 0 0 18px; color: #6B6B6B; line-height: 1.8;">
            ${escapeHtml(requesterName)} submitted a new PetHub request.
          </p>
          <div style="background: #FFF4E2; border-radius: 20px; padding: 18px;">
            ${htmlFields}
          </div>
        </div>
      </div>
    `,
  });
};
