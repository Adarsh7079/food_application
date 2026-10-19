const express = require("express");

const productController = require("../controllers/product.controller");

const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const restaurantOwner = require("../middlewares/restaurantOwner.middleware");
const requireApprovedRestaurant = require("../middlewares/requireApprovedRestaurant.middleware");
const validate = require("../middlewares/validate");

const { USER_ROLE } = require("../utils/constants");

const { createProductSchema } = require("../validations/schemas");

const router = express.Router();

// Create a product for a specific restaurant.
router.post(
  "/restaurants/:restaurantId/products",
  authenticate,
  authorize(USER_ROLE.restaurant),
  restaurantOwner,
  requireApprovedRestaurant,
  validate(createProductSchema),
  productController.createProduct,
);

module.exports = router;
