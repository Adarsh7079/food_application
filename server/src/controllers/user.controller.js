const userService = require("../services/user.service");

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

module.exports = {
  getProfile,
  updateProfile,
};
