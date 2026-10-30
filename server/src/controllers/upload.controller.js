const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const cloudinaryService = require("../services/cloudinary.service");
const Restaurant = require("../models/restaurant.model");
const { RESTAURANT_STATUS, USER_ROLE } = require("../utils/constants");
const sendApiError = require("../utils/sendApiError");

const profileFolder = (userId) => `food_application/users/${userId}/profile`;
const productFolder = (userId, restaurantId) =>
  `food_application/users/${userId}/restaurants/${restaurantId}/products`;

const uploadProfileImage = async (req, res) => {
  try {
    const image = await cloudinaryService.uploadImage(req.body.image, profileFolder(req.user.userId));
    return res.status(201).json(new ApiResponse(201, image, "Profile image uploaded"));
  } catch (error) {
    return sendApiError(res, error, "Profile image upload failed");
  }
};

const getOwnedRestaurant = async (req, restaurantId) => {
  if (!mongoose.isValidObjectId(restaurantId)) {
    throw new ApiError(400, "Invalid restaurant ID");
  }
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user.userId });
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  if (restaurant.approvalStatus !== RESTAURANT_STATUS.approved) {
    throw new ApiError(403, "Your restaurant must be approved before uploading menu images.");
  }
  return restaurant;
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.user.roles.includes(USER_ROLE.restaurant)) {
      throw new ApiError(403, "Restaurant account required");
    }
    await getOwnedRestaurant(req, req.params.restaurantId);
    const image = await cloudinaryService.uploadImage(
      req.body.image,
      productFolder(req.user.userId, req.params.restaurantId),
    );
    return res.status(201).json(new ApiResponse(201, image, "Menu image uploaded"));
  } catch (error) {
    return sendApiError(res, error, "Menu image upload failed");
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId, scope, restaurantId } = req.body;
    if (typeof publicId !== "string" || publicId.length > 255) {
      throw new ApiError(400, "A valid Cloudinary public ID is required.");
    }
    let expectedFolder;
    if (scope === "profile") {
      expectedFolder = `${profileFolder(req.user.userId)}/`;
    } else if (scope === "product") {
      if (!req.user.roles.includes(USER_ROLE.restaurant)) {
        throw new ApiError(403, "Restaurant account required");
      }
      await getOwnedRestaurant(req, restaurantId);
      expectedFolder = `${productFolder(req.user.userId, restaurantId)}/`;
    } else {
      throw new ApiError(400, "Unsupported image scope.");
    }
    if (!publicId.startsWith(expectedFolder) || publicId.includes("..")) {
      throw new ApiError(403, "You cannot delete this image.");
    }
    await cloudinaryService.deleteImage(publicId);
    return res.status(200).json(new ApiResponse(200, null, "Image deleted"));
  } catch (error) {
    return sendApiError(res, error, "Image deletion failed");
  }
};

module.exports = { uploadProfileImage, uploadProductImage, deleteImage };
