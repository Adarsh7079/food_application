const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");
const {
  restaurantRegistrationSchema,
  updateRestaurantSchema,
} = require("../validations/schemas");

const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createRestaurant = async (ownerId, payload) => {
  const validatedData = restaurantRegistrationSchema.parse(payload);

  // Check user
  const user = await User.findById(ownerId);

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  // Make sure this user is a restaurant owner
  if (user.role !== USER_ROLE.restaurant) {
    throw createServiceError(
      "Only restaurant users can create a restaurant",
      403,
    );
  }

  // Only approved/verified user can create restaurant
  if (user.userStatus !== USER_STATUS.approved) {
    throw createServiceError(
      "Please verify your account before creating a restaurant",
      403,
    );
  }

  // Check if restaurant already exists
  const existingRestaurant = await Restaurant.findOne({
    ownerId,
  });

  if (existingRestaurant) {
    throw createServiceError("Restaurant already exists for this account", 409);
  }

  const restaurant = await Restaurant.create({
    ownerId,
    ...validatedData,
    status: "pending",
  });

  return restaurant;
};

const getMyRestaurant = async (ownerId) => {
  const restaurant = await Restaurant.findOne({
    ownerId,
  });

  if (!restaurant) {
    throw createServiceError("Restaurant not found", 404);
  }

  return restaurant;
};

const updateMyRestaurant = async (ownerId, payload) => {
  const validatedData = updateRestaurantSchema.parse(payload);

  const restaurant = await Restaurant.findOne({
    ownerId,
  });

  if (!restaurant) {
    throw createServiceError("Restaurant not found", 404);
  }

  // Don't allow restaurant owner to modify approval status
  const updatedRestaurant = await Restaurant.findOneAndUpdate(
    { ownerId },
    { $set: validatedData },
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedRestaurant;
};

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
};
