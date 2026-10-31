const express = require("express");
const authController = require("../controllers/auth.controller");

const validate = require("../middlewares/validate");

const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/schemas");

const router = express.Router();

// Signup
router.post("/register", validate(registerSchema), authController.signup);

// Email verification
router.get(
  "/verify-email",
  validate(verifyEmailSchema, "query"),
  authController.verifyEmail,
);

// Resend verification email
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerificationEmail,
);

// Password reset
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

// Login
router.post("/login", validate(loginSchema), authController.login);

// Refresh access token
router.post("/refresh", authController.refreshAccessToken);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
