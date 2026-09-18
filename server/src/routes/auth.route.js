const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} = require("../validations/schemas");

const router = express.Router();

router.post("/signup", validate(registerSchema), authController.signup);
router.get("/verify-email", validate(verifyEmailSchema, "query"), authController.verifyEmail);
router.post("/resend-verification", validate(resendVerificationSchema), authController.resendVerificationEmail);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
