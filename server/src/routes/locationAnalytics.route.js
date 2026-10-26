const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate");
const locationAnalyticsController = require("../controllers/locationAnalytics.controller");
const { USER_ROLE } = require("../utils/constants");
const { locationAnalyticsQuerySchema } = require("../validations/schemas");

const router = express.Router();

router.get(
  "/location-activity",
  authenticate,
  authorize(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.restaurant),
  validate(locationAnalyticsQuerySchema, "query"),
  locationAnalyticsController.getLocationAnalytics,
);

module.exports = router;
