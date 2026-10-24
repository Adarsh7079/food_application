const express = require("express");
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");
const { USER_ROLE } = require("../utils/constants");
const orderController = require("../controllers/order.controller");
const productController = require("../controllers/product.controller");
const {
  listAdminRestaurantsSchema,
  restaurantIdParamSchema,
  reviewRestaurantSchema,
  updateRestaurantSuspensionSchema,
  createCategorySchema,
} = require("../validations/schemas");

const router = express.Router();
const requireSuperAdmin = [authenticate, authorize(USER_ROLE.superAdmin)];
const requirePlatformAdmin = [authenticate, authorize(USER_ROLE.admin, USER_ROLE.superAdmin)];

router.post(
  "/categories",
  ...requireSuperAdmin,
  validate(createCategorySchema),
  productController.createCategory,
);

router.get(
  "/orders",
  authenticate,
  authorize(USER_ROLE.admin, USER_ROLE.superAdmin),
  orderController.getAllOrders,
);

router.get(
  "/restaurants",
  ...requirePlatformAdmin,
  validate(listAdminRestaurantsSchema, "query"),
  adminController.getRestaurants,
);

router.get(
  "/restaurants/:restaurantId",
  ...requirePlatformAdmin,
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
