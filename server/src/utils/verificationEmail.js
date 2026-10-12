import nodemailer from "nodemailer";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendVerificationEmail({ email, name, code }) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Email verification is not configured. Contact the administrator.");
      error.status = 503;
      error.code = "EMAIL_NOT_CONFIGURED";
      throw error;
    }
    console.info(`[email verification] ${email}: ${code} (development only)`);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    ...(process.env.SMTP_USER && {
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    }),
  });
  const safeName = escapeHtml(name);
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your Aurelia Realty OS email",
      text: `Hello ${name}, your email verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;color:#12242b;max-width:520px;margin:auto"><p style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#b85c38">Aurelia · Realty OS</p><h1 style="font-weight:500">Verify your email</h1><p>Hello ${safeName}, use this code to verify your brokerage account:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f7f2e9;border-radius:12px;text-align:center">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p></div>`,
    });
  } catch (cause) {
    console.error("Verification email delivery failed:", cause);
    const error = new Error("Verification email could not be delivered. Please try again shortly.");
    error.status = 502;
    error.code = "EMAIL_DELIVERY_FAILED";
    throw error;
  } finally {
    transporter.close();
  }
}
