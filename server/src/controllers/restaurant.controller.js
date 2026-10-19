const restaurantService = require("../services/restaurant.service");
const { sendRestaurantApprovalNotification } = require("../services/email.service");

const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

const { STATUS_CODES } = require("../utils/constants");

// ========================================
// CREATE RESTAURANT
// POST /api/v1/restaurants
// ========================================

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.createRestaurant(
      req.user.userId,
      req.validated.body
    );

    await sendRestaurantApprovalNotification({
      restaurant,
      owner: { name: req.user.name, email: req.user.email },
    });

    return res.status(STATUS_CODES.CREATED).json(
      new ApiResponse(
        STATUS_CODES.CREATED,
        restaurant,
        "Restaurant created successfully"
      )
    );
  } catch (error) {
    return sendApiError(
      res,
      error,
      "Restaurant creation failed"
    );
  }
};

// ========================================
// GET MY RESTAURANTS
// GET /api/v1/restaurants/me
// ========================================

const getMyRestaurant = async (req, res) => {
  try {
    const restaurants = await restaurantService.getMyRestaurant(
      req.user.userId
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurants,
        "Restaurants fetched successfully"
      )
    );
  } catch (error) {
    return sendApiError(
      res,
      error,
      "Failed to fetch restaurants"
    );
  }
};

// ========================================
// UPDATE MY RESTAURANT
// PATCH /api/v1/restaurants/me
// ========================================

const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.updateMyRestaurant(
      req.user.userId,
      req.validated.body
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurant,
        "Restaurant updated successfully"
      )
    );
  } catch (error) {
    return sendApiError(
      res,
      error,
      "Restaurant update failed"
    );
  }
};

// ========================================
// ACTIVATE / DEACTIVATE RESTAURANT
// PATCH /api/v1/restaurants/:restaurantId/operational-status
// ========================================

const updateOperationalStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { operationalStatus } = req.validated.body;

    const result = await restaurantService.updateOperationalStatus(
      req.user.userId,
      restaurantId,
      operationalStatus
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        result,
        "Restaurant operational status updated successfully"
      )
    );
  } catch (error) {
    return sendApiError(
      res,
      error,
      "Failed to update restaurant operational status"
    );
  }
};

// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  updateOperationalStatus,
};
