const restaurantService = require("../services/restaurant.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const sendError = (res, error) => {
  if (!error.statusCode) {
    console.error("Restaurant request failed:", error);
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

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.createRestaurant(
      req.user.userId,
      req.validated.body,
    );

    return res
      .status(201)
      .json(
        new ApiResponse(201, restaurant, "Restaurant created successfully"),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.getMyRestaurant(req.user.userId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Restaurant fetched successfully"),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateMyRestaurant(
      req.user.userId,
      req.validated.body,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, restaurant, "Restaurant updated successfully"),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
};
