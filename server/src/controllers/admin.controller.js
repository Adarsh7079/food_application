const restaurantService = require("../services/restaurant.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");
const { STATUS_CODES } = require("../utils/constants");
const userService = require("../services/user.service");
const productService = require("../services/products.service");

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getAdminRestaurants(
      req.validated.query.approvalStatus,
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurants,
        "Restaurants fetched successfully",
      ),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to fetch restaurants");
  }
};

const getRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.getAdminRestaurantById(
      req.validated.params.restaurantId,
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurant,
        "Restaurant fetched successfully",
      ),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to fetch restaurant");
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAdminUsers(req.validated.query);
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(STATUS_CODES.OK, users, "Users fetched successfully"),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to fetch users");
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getAdminUserById(req.validated.params.userId);
    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(STATUS_CODES.OK, user, "User fetched successfully"),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to fetch user");
  }
};

const reviewRestaurant = async (req, res) => {
  try {
    const { approvalStatus, rejectionReason } = req.validated.body;
    const restaurant = await restaurantService.reviewRestaurant(
      req.validated.params.restaurantId,
      req.user.userId,
      approvalStatus,
      rejectionReason,
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurant,
        `Restaurant ${approvalStatus.toLowerCase()} successfully`,
      ),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to review restaurant");
  }
};

const updateRestaurantSuspension = async (req, res) => {
  try {
    const { isSuspended, reason } = req.validated.body;
    const restaurant = await restaurantService.updateRestaurantSuspension(
      req.validated.params.restaurantId,
      req.user.userId,
      isSuspended,
      reason,
    );

    return res.status(STATUS_CODES.OK).json(
      new ApiResponse(
        STATUS_CODES.OK,
        restaurant,
        isSuspended
          ? "Restaurant suspended successfully"
          : "Restaurant unsuspended and returned to pending review",
      ),
    );
  } catch (error) {
    return sendApiError(res, error, "Failed to update restaurant suspension");
  }
};

const getRestaurantProducts = async (req, res) => {
  try {
    const products = await productService.getRestaurantProducts(req.validated.params.restaurantId);
    return res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, products, "Restaurant products fetched successfully"));
  } catch (error) { return sendApiError(res, error, "Failed to fetch restaurant products"); }
};

const updateRestaurantProduct = async (req, res) => {
  try {
    const product = await productService.updateAdminProduct(
      req.validated.params.restaurantId,
      req.validated.params.productId,
      req.validated.body,
    );
    return res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, product, "Product updated successfully"));
  } catch (error) { return sendApiError(res, error, "Failed to update product"); }
};

module.exports = {
  getRestaurants,
  getRestaurant,
  getUsers,
  getUser,
  reviewRestaurant,
  updateRestaurantSuspension,
  getRestaurantProducts,
  updateRestaurantProduct,
};
