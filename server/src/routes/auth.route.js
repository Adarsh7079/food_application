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

// Signup
router.post("/signup", validate(registerSchema), authController.signup);

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

// Login
router.post("/login", validate(loginSchema), authController.login);

// Refresh access token
router.post("/refresh", authController.refreshAccessToken);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
