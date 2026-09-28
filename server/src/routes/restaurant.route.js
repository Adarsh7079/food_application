const express = require("express");

const restaurantController = require("../controllers/restaurant.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");

const {
  restaurantRegistrationSchema,
  updateRestaurantSchema,
} = require("../validations/schemas");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("customer", "restaurant"),
  validate(restaurantRegistrationSchema),
  restaurantController.createRestaurant,
);

router.get(
  "/me",
  authenticate,
  authorize("restaurant"),
  restaurantController.getMyRestaurant,
);

router.patch(
  "/me",
  authenticate,
  authorize("restaurant"),
  validate(updateRestaurantSchema),
  restaurantController.updateMyRestaurant,
);

module.exports = router;
