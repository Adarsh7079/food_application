const express = require("express");
const contactController = require("../controllers/contact.controller");
const createRateLimiter = require("../middlewares/limitOrderNotifications.middleware");
const validate = require("../middlewares/validate");
const { contactEnquirySchema } = require("../validations/schemas");

const router = express.Router();
const limitContactEnquiries = createRateLimiter({
  maxRequests: 5,
  message: "Too many enquiries. Please wait before sending another message.",
});

router.post("/", limitContactEnquiries, validate(contactEnquirySchema), contactController.submitEnquiry);

module.exports = router;
