const ApiError = require("../utils/ApiError");

const { RESTAURANT_STATUS, STATUS_CODES } = require("../utils/constants");

const requireApprovedRestaurant = (req, res, next) => {
  try {
    if (!req.restaurant) {
      throw new ApiError(
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        "Restaurant context is missing",
      );
    }

    if (req.restaurant.approvalStatus !== RESTAURANT_STATUS.approved) {
      throw new ApiError(
        STATUS_CODES.FORBIDDEN,
        "Your restaurant must be approved before performing this action",
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
  
module.exports = requireApprovedRestaurant;
