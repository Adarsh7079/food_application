const userService = require("../services/user.service");
const locationAnalyticsService = require("../services/locationAnalytics.service");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

// ========================================
// GET PROFILE
// ========================================

const getProfile = async (req, res) => {
  try {
    const user = await userService.getMyProfile(req.user.userId);

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile fetched successfully"));
  } catch (error) {
    return sendApiError(res, error, "User request failed");
  }
};

// ========================================
// UPDATE PROFILE
// ========================================

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateMyProfile(
      req.user.userId,
      req.validated.body,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    return sendApiError(res, error, "User request failed");
  }
};

const updateLocationConsent = async (req, res) => {
  try {
    const result = await userService.updateLocationAnalyticsConsent(
      req.user.userId,
      req.validated.body.consent,
    );
    return res.status(200).json(new ApiResponse(200, result, "Location analytics preference saved"));
  } catch (error) {
    return sendApiError(res, error, "Location analytics preference update failed");
  }
};

const recordLocationActivity = async (req, res) => {
  try {
    if (!req.user.roles.includes("CUSTOMER")) {
      throw new ApiError(403, "Customer account required");
    }
    const user = await User.findById(req.user.userId).select("locationAnalyticsConsent");
    if (!user?.locationAnalyticsConsent) {
      throw new ApiError(403, "Location analytics consent is required");
    }
    await locationAnalyticsService.recordCustomerLogin(req.validated.body);
    return res.status(202).json(new ApiResponse(202, null, "Coarse location activity recorded"));
  } catch (error) {
    return sendApiError(res, error, "Location activity recording failed");
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLocationConsent,
  recordLocationActivity,
};
