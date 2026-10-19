const express = require("express");

const userController = require("../controllers/user.controller");

const authenticate = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate");

const { updateProfileSchema } = require("../validations/schemas");

const router = express.Router();

// Get current logged-in user
router.get("/me", authenticate, userController.getProfile);

// Update current logged-in user
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);

module.exports = router;
