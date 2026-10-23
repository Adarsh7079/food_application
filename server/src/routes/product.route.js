const express = require("express");
const productController = require("../controllers/product.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const restaurantOwner = require("../middlewares/restaurantowner.middleware");
const requireApprovedRestaurant = require("../middlewares/requireapprovalrestaurant.middleware");
const validate = require("../middlewares/validate");
const { USER_ROLE } = require("../utils/constants");
const { createProductSchema, publicProductsQuerySchema, productAvailabilitySchema } = require("../validations/schemas");

const router = express.Router();
router.get("/products", validate(publicProductsQuerySchema, "query"), productController.listPublicProducts);
router.get("/categories", productController.listCategories);
router.get("/restaurants/:restaurantId/products", authenticate, authorize(USER_ROLE.restaurant), restaurantOwner, productController.listRestaurantProducts);
router.post("/restaurants/:restaurantId/products", authenticate, authorize(USER_ROLE.restaurant), restaurantOwner, requireApprovedRestaurant, validate(createProductSchema), productController.createProduct);
router.patch("/restaurants/:restaurantId/products/:productId/availability", authenticate, authorize(USER_ROLE.restaurant), restaurantOwner, requireApprovedRestaurant, validate(productAvailabilitySchema), productController.updateProductAvailability);

module.exports = router;
