const userService = require("../services/user.service");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// ========================================
// ERROR HANDLER
// ========================================

const sendError = (res, error) => {
  if (!error.statusCode) {
    console.error("User request failed:", error);
  }

  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(
          error.statusCode || 500,

          error.statusCode ? error.message : "Unable to process the request",

          error.name === "ZodError" ? error.issues : [],
        );

  return res.status(apiError.statusCode).json({
    statusCode: apiError.statusCode,
    success: false,
    message: apiError.message,
    data: null,
    errors: apiError.errors || [],
  });
};

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
    return sendError(res, error);
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
    return sendError(res, error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
