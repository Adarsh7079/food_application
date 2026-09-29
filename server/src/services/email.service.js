const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError");

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new ApiError(
      503,
      "Email delivery is not configured. Contact the site administrator.",
    );
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ApiError(
      503,
      "Email delivery is not configured correctly. Contact the site administrator.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure:
      process.env.SMTP_SECURE === undefined
        ? port === 465
        : process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendVerificationEmail = async ({ email, name, token }) => {
  let serverUrl = process.env.SERVER_URL;
  if (!serverUrl && process.env.NODE_ENV === "production") {
    throw new ApiError(
      503,
      "Email verification is not configured correctly. Contact the site administrator.",
    );
  }
  serverUrl ||= `http://localhost:${process.env.PORT || 8000}`;

  try {
    const parsedServerUrl = new URL(serverUrl);
    if (process.env.NODE_ENV === "production" && parsedServerUrl.protocol !== "https:") {
      throw new Error("SERVER_URL must use HTTPS in production");
    }

    const verificationUrl = new URL("/api/v1/auth/verify-email", parsedServerUrl);
    verificationUrl.searchParams.set("token", token);

    return await getTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Verify your Food Application account",
      text: `Hi ${name}, verify your account by opening this link: ${verificationUrl.toString()}`,
      html: `<p>Hi ${name},</p><p>Please <a href="${verificationUrl.toString()}">verify your account</a>. This link expires in 24 hours.</p>`,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("Verification email delivery failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    throw new ApiError(
      503,
      "Unable to send the verification email. Please retry or request a new verification email.",
    );
  }
};

module.exports = { sendVerificationEmail };
