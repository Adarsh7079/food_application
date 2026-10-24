const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");
const { sendContactEnquiry } = require("../services/email.service");

const submitEnquiry = async (req, res) => {
  try {
    const sent = await sendContactEnquiry(req.validated.body);
    if (!sent) {
      throw new ApiError(
        503,
        "Your enquiry could not be sent right now. Please try again or contact us on WhatsApp.",
      );
    }
    return res.status(200).json(
      new ApiResponse(200, null, "Your enquiry has been sent successfully."),
    );
  } catch (error) {
    return sendApiError(res, error, "Contact enquiry submission failed");
  }
};

module.exports = { submitEnquiry };
