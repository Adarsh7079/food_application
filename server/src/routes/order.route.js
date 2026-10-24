const express = require("express");
const orderController = require("../controllers/order.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const restaurantOwner = require("../middlewares/restaurantowner.middleware");
const requireApprovedRestaurant = require("../middlewares/requireapprovalrestaurant.middleware");
const validate = require("../middlewares/validate");
const createRateLimiter = require("../middlewares/limitOrderNotifications.middleware");
const { USER_ROLE } = require("../utils/constants");
const {
  orderSchema,
  updateOrderStatusSchema,
  whatsappOrderNotificationSchema,
} = require("../validations/schemas");
const router = express.Router();
const limitOrderNotifications = createRateLimiter({
  message: "Too many order notifications. Please try again later.",
});
router.post("/", authenticate, authorize(USER_ROLE.customer), validate(orderSchema), orderController.placeOrder);
router.post(
  "/whatsapp-notification",
  limitOrderNotifications,
  validate(whatsappOrderNotificationSchema),
  orderController.notifyWhatsAppCheckout,
);
router.get("/me", authenticate, authorize(USER_ROLE.customer), orderController.getMyOrders);
router.get("/restaurants/:restaurantId", authenticate, authorize(USER_ROLE.restaurant), restaurantOwner, requireApprovedRestaurant, orderController.getRestaurantOrders);
router.patch("/restaurants/:restaurantId/:orderId/status", authenticate, authorize(USER_ROLE.restaurant), restaurantOwner, requireApprovedRestaurant, validate(updateOrderStatusSchema), orderController.updateOrderStatus);
module.exports = router;
