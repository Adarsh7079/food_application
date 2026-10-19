const express = require("express");

const restaurantController = require("../controllers/restaurant.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const restaurantOwner = require("../middlewares/restaurantowner.middleware");
const validate = require("../middlewares/validate");

const { USER_ROLE } = require("../utils/constants");

const {
  restaurantRegistrationSchema,
  updateRestaurantSchema,
  updateOperationalStatusSchema,
} = require("../validations/schemas");

const router = express.Router();

// ========================================
// REGISTER RESTAURANT
// POST /api/v1/restaurants
// ========================================

router.post(
  "/",
  authenticate,
  validate(restaurantRegistrationSchema),
  restaurantController.createRestaurant
);

// ========================================
// GET MY RESTAURANTS
// GET /api/v1/restaurants/me
// ========================================

router.get(
  "/me",
  authenticate,
  authorize(USER_ROLE.restaurant),
  restaurantController.getMyRestaurant
);

// ========================================
// UPDATE RESTAURANT DETAILS
// PATCH /api/v1/restaurants/me
// ========================================

router.patch(
  "/me",
  authenticate,
  authorize(USER_ROLE.restaurant),
  validate(updateRestaurantSchema),
  restaurantController.updateMyRestaurant
);

// ========================================
// ACTIVATE / DEACTIVATE RESTAURANT
// PATCH /api/v1/restaurants/:restaurantId/operational-status
// ========================================

router.patch(
  "/:restaurantId/operational-status",
  authenticate,
  authorize(USER_ROLE.restaurant),
  restaurantOwner,
  validate(updateOperationalStatusSchema),
  restaurantController.updateOperationalStatus
);

module.exports = router;
