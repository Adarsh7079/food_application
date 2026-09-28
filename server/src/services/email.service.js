const nodemailer = require("nodemailer");

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const error = new Error(
      "SMTP settings are missing. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
    );
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendVerificationEmail = async ({ email, name, token }) => {
  const serverUrl =
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;

  const verificationUrl = new URL("/api/v1/auth/verify-email", serverUrl);
  verificationUrl.searchParams.set("token", token);

  return getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Verify your Food Application account",
    text: `Hi ${name}, verify your account by opening this link: ${verificationUrl.toString()}`,
    html: `<p>Hi ${name},</p><p>Please <a href="${verificationUrl.toString()}">verify your account</a>. This link expires in 24 hours.</p>`,
  });
};

module.exports = { sendVerificationEmail };
