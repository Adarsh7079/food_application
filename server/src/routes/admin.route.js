const express = require("express");
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");
const { USER_ROLE } = require("../utils/constants");
const {
  listAdminRestaurantsSchema,
  restaurantIdParamSchema,
  reviewRestaurantSchema,
  updateRestaurantSuspensionSchema,
} = require("../validations/schemas");

const router = express.Router();
const requireSuperAdmin = [authenticate, authorize(USER_ROLE.superAdmin)];

router.get(
  "/restaurants",
  ...requireSuperAdmin,
  validate(listAdminRestaurantsSchema, "query"),
  adminController.getRestaurants,
);

router.get(
  "/restaurants/:restaurantId",
  ...requireSuperAdmin,
  validate(restaurantIdParamSchema, "params"),
  adminController.getRestaurant,
);

router.patch(
  "/restaurants/:restaurantId/approval",
  ...requireSuperAdmin,
  validate(restaurantIdParamSchema, "params"),
  validate(reviewRestaurantSchema),
  adminController.reviewRestaurant,
);

router.patch(
  "/restaurants/:restaurantId/suspension",
  ...requireSuperAdmin,
  validate(restaurantIdParamSchema, "params"),
  validate(updateRestaurantSuspensionSchema),
  adminController.updateRestaurantSuspension,
);

module.exports = router;
