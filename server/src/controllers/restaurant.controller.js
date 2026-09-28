const restaurantService = require("../services/restaurant.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

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
    return sendApiError(res, error, "Restaurant request failed");
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
    return sendApiError(res, error, "Restaurant request failed");
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
    return sendApiError(res, error, "Restaurant request failed");
  }
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
};
