const { Resend } = require("resend");
const ApiError = require("../utils/ApiError");

const DEFAULT_FROM = "Zayka Nest <noreply@zaykanest.in>";
const DEFAULT_SUBJECT = "Verify your email";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      503,
      "Email delivery is not configured. Contact the site administrator.",
    );
  }

  return new Resend(apiKey);
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

    if (
      process.env.NODE_ENV === "production" &&
      parsedServerUrl.protocol !== "https:"
    ) {
      throw new Error("SERVER_URL must use HTTPS in production");
    }

    const verificationUrl = new URL(
      "/api/v1/auth/verify-email",
      parsedServerUrl,
    );
    verificationUrl.searchParams.set("token", token);

    const templateId = process.env.RESEND_TEMPLATE_ID;

    if (!templateId) {
      throw new ApiError(503, "Email verification template is not configured.");
    }

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [email],
      subject: process.env.MAIL_VERIFY_SUBJECT || DEFAULT_SUBJECT,
      template: {
        id: templateId,
        variables: {
          VERIFY_URL: verificationUrl.toString(),
          // Uncomment only after adding USER_NAME as a variable in your template:
          // USER_NAME: name || "there",
        },
      },
    });

    if (error) {
      console.error("Resend email delivery failed:", {
        name: error.name,
        message: error.message,
      });
      throw new Error("Resend email delivery failed");
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Verification email delivery failed:", {
      message: error.message,
    });

    throw new ApiError(
      503,
      "Unable to send the verification email. Please retry or request a new verification email.",
    );
  }
};

const sendRestaurantApprovalNotification = async ({ restaurant, owner }) => {
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!email) {
    console.error("Restaurant approval email not sent: SUPER_ADMIN_EMAIL is not configured.");
    return null;
  }

  try {
    const resend = getResendClient();
    const address = restaurant.address;
  const location = [
    address?.street,
    address?.city,
    address?.state,
    address?.postalCode,
    address?.country,
  ]
      .filter(Boolean)
      .join(", ");
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [email],
      subject: `Restaurant approval requested: ${restaurant.name}`,
      text: [
        `A restaurant is waiting for approval.`,
        `Restaurant: ${restaurant.name}`,
        `Owner: ${owner.name} (${owner.email})`,
        `Location: ${location || "Not provided"}`,
        `Restaurant ID: ${restaurant._id}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend restaurant approval email failed:", {
        name: error.name,
        message: error.message,
      });
      return null;
    }

    return data;
  } catch (error) {
    // Keep restaurant registration successful; the pending restaurant remains
    // available for review even if the notification provider is unavailable.
    console.error("Restaurant approval email delivery failed:", {
      message: error.message,
    });
    return null;
  }
};

module.exports = { sendVerificationEmail, sendRestaurantApprovalNotification };
