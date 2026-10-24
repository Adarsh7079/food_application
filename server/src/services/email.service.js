const { Resend } = require("resend");
const ApiError = require("../utils/ApiError");

const DEFAULT_FROM = "Zayka Nest <noreply@zaykanest.in>";
const DEFAULT_SUBJECT = "Verify your email";
const ORDER_NOTIFICATION_EMAIL = "adarshk8271@gmail.com";

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

const getOrderNotificationEmail = () =>
  process.env.ORDER_NOTIFICATION_EMAIL ||
  process.env.SUPER_ADMIN_EMAIL ||
  ORDER_NOTIFICATION_EMAIL;

const sendContactEnquiry = async ({ name, email, phone, message }) => {
  const recipient =
    process.env.CONTACT_ENQUIRY_EMAIL ||
    process.env.SUPER_ADMIN_EMAIL ||
    ORDER_NOTIFICATION_EMAIL;

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [recipient],
      replyTo: email,
      subject: "ZaykaNest Enquiry",
      text: [
        "A new enquiry was submitted through the ZaykaNest contact form.",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend contact enquiry failed:", {
        name: error.name,
        message: error.message,
      });
      return false;
    }
    return Boolean(data);
  } catch (error) {
    console.error("Contact enquiry email delivery failed:", {
      message: error.message,
    });
    return false;
  }
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

const sendOrderNotification = async ({ order, customer }) => {
  const email = getOrderNotificationEmail();

  try {
    const resend = getResendClient();
    const address = order.deliveryAddress;
    const deliveryAddress = [
      address.recipientName,
      address.phoneNumber,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
    const itemLines = order.items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} — ₹${(item.unitPrice * item.quantity).toFixed(2)}`,
      )
      .join("\n");

    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [email],
      subject: `New order received: ${order._id}`,
      text: [
        "A new cash-on-delivery order was placed.",
        `Order ID: ${order._id}`,
        `Customer: ${customer.name} (${customer.email})`,
        `Restaurant: ${order.restaurant?.name || "Restaurant"}`,
        `Delivery address: ${deliveryAddress}`,
        "",
        "Items:",
        itemLines,
        "",
        `Subtotal: ₹${order.subtotal.toFixed(2)}`,
        `Discount: ₹${order.discount.toFixed(2)}`,
        `Delivery fee: ₹${order.deliveryFee.toFixed(2)}`,
        `Total: ₹${order.total.toFixed(2)}`,
        `Payment: ${order.paymentMethod}`,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend order notification failed:", {
        name: error.name,
        message: error.message,
      });
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error("Order notification email delivery failed:", {
      message: error.message,
    });
    return false;
  }
};

const sendWhatsAppOrderNotification = async (checkout) => {
  const email = getOrderNotificationEmail();

  try {
    const resend = getResendClient();
    const subtotal = checkout.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discount = subtotal >= 499 ? Math.round(subtotal * 0.25) : 0;
    const deliveryFee = discount > 0 ? 0 : 40;
    const itemLines = checkout.items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} — ₹${(item.unitPrice * item.quantity).toFixed(2)}`,
      )
      .join("\n");
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || DEFAULT_FROM,
      to: [email],
      subject: "New WhatsApp checkout order",
      text: [
        "A customer is being redirected to WhatsApp to confirm this order.",
        `Customer: ${checkout.customerName} (${checkout.customerEmail})`,
        `Phone: ${checkout.phoneNumber}`,
        `Delivery address: ${checkout.deliveryAddress}`,
        `Location: ${checkout.location || "Not shared; use the delivery address"}`,
        "",
        "Items:",
        itemLines,
        "",
        `Subtotal: ₹${subtotal.toFixed(2)}`,
        `Discount: ₹${discount.toFixed(2)}`,
        `Delivery fee: ₹${deliveryFee.toFixed(2)}`,
        `Estimated total: ₹${(subtotal - discount + deliveryFee).toFixed(2)}`,
        "Payment: Cash on Delivery",
      ].join("\n"),
    });

    if (error) {
      console.error("Resend WhatsApp order notification failed:", {
        name: error.name,
        message: error.message,
      });
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error("WhatsApp order notification email delivery failed:", {
      message: error.message,
    });
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendRestaurantApprovalNotification,
  sendOrderNotification,
  sendWhatsAppOrderNotification,
  sendContactEnquiry,
};
