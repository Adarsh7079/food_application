const mongoose = require("mongoose");

const Restaurant = require("../models/restaurant.model");
const ApiError = require("../utils/ApiError");
const { STATUS_CODES } = require("../utils/constants");

const restaurantOwner = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurantId;

    if (!restaurantId) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Restaurant ID is required");
    }

    if (!mongoose.isValidObjectId(restaurantId)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid restaurant ID");
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      owner: req.user.userId,
    });

    if (!restaurant) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, "Restaurant not found");
    }

    req.restaurant = restaurant;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = restaurantOwner;
