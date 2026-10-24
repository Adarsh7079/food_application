const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");
const { nextRestaurantNumber } = require("./restaurantNumber.service");

const ApiError = require("../utils/ApiError");

const {
  USER_ROLE,
  USER_STATUS,
  RESTAURANT_STATUS,
  RESTAURANT_OPERATIONAL_STATUS,
  STATUS_CODES,
} = require("../utils/constants");

// ========================================
// CREATE SLUG
// ========================================

const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ========================================
// GENERATE UNIQUE SLUG
// ========================================

const generateUniqueSlug = async (name, excludeRestaurantId = null) => {
  const baseSlug = createSlug(name);

  if (!baseSlug) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Restaurant name cannot generate a valid slug"
    );
  }

  let slug = baseSlug;
  let counter = 2;

  while (
    await Restaurant.exists({
      slug,
      ...(excludeRestaurantId
        ? { _id: { $ne: excludeRestaurantId } }
        : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// ========================================
// CHECK RESTAURANT OWNER
// ========================================

const getEligibleOwner = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
  }

  if (!user.roles.includes(USER_ROLE.restaurant)) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "Only restaurant owners can manage restaurants"
    );
  }

  if (user.userStatus !== USER_STATUS.approved) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "Your account must be approved before managing a restaurant"
    );
  }

  if (!user.emailVerifiedAt) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "Please verify your email before managing a restaurant"
    );
  }

  return user;
};

// ========================================
// CREATE RESTAURANT
// ========================================

const createRestaurant = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "User not found");
  }

  if (user.userStatus !== USER_STATUS.approved || !user.emailVerifiedAt) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "Verify your email before registering a restaurant"
    );
  }

  const {
    name,
    description,
    contactPhone,
    address,
    logo,
    coverImage,
  } = payload;

  if (!name || !address) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Restaurant name and address are required"
    );
  }

  const slug = await generateUniqueSlug(name);
  const restaurantNumber = await nextRestaurantNumber();

  const restaurant = await Restaurant.create({
    restaurantNumber,
    name,
    slug,
    description,
    contactPhone,
    address,
    logo,
    coverImage,
    owner: userId,
    approvalStatus: RESTAURANT_STATUS.pending,
    operationalStatus: RESTAURANT_OPERATIONAL_STATUS.inactive,
  });

  // Restaurant registration is the onboarding path for customer accounts.
  // The restaurant remains pending and inactive until reviewed by an admin.
  if (!user.roles.includes(USER_ROLE.restaurant)) {
    user.roles.push(USER_ROLE.restaurant);
    await user.save();
  }

  return restaurant;
};

// ========================================
// GET MY RESTAURANTS
// ========================================

const getMyRestaurant = async (userId) => {
  await getEligibleOwner(userId);

  const restaurants = await Restaurant.find({
    owner: userId,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  return restaurants;
};

// ========================================
// ADMINISTRATIVE RESTAURANT MANAGEMENT
// ========================================

const getAdminRestaurants = async (approvalStatus) => {
  const filter = { isDeleted: { $ne: true } };

  if (approvalStatus) {
    filter.approvalStatus = approvalStatus;
  }

  return Restaurant.find(filter)
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
};

const getAdminRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isDeleted: { $ne: true },
  }).populate("owner", "name email");

  if (!restaurant) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Restaurant not found");
  }

  return restaurant;
};

const reviewRestaurant = async (
  restaurantId,
  reviewerId,
  approvalStatus,
  rejectionReason,
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isDeleted: { $ne: true },
  });

  if (!restaurant) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Restaurant not found");
  }

  if (restaurant.approvalStatus === RESTAURANT_STATUS.suspended) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "A suspended restaurant must be unsuspended before it can be reviewed",
    );
  }

  const now = new Date();
  restaurant.approvalStatus = approvalStatus;
  restaurant.reviewedBy = reviewerId;
  restaurant.reviewedAt = now;
  restaurant.approvedAt =
    approvalStatus === RESTAURANT_STATUS.approved ? now : null;
  restaurant.rejectionReason =
    approvalStatus === RESTAURANT_STATUS.rejected ? rejectionReason : null;

  if (approvalStatus === RESTAURANT_STATUS.rejected) {
    restaurant.operationalStatus = RESTAURANT_OPERATIONAL_STATUS.inactive;
  }

  await restaurant.save();

  return restaurant;
};

const updateRestaurantSuspension = async (
  restaurantId,
  adminId,
  isSuspended,
  reason,
) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isDeleted: { $ne: true },
  });

  if (!restaurant) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, "Restaurant not found");
  }

  if (isSuspended) {
    if (restaurant.approvalStatus === RESTAURANT_STATUS.suspended) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Restaurant is already suspended");
    }

    restaurant.approvalStatus = RESTAURANT_STATUS.suspended;
    restaurant.operationalStatus = RESTAURANT_OPERATIONAL_STATUS.inactive;
    restaurant.suspensionReason = reason;
    restaurant.suspendedAt = new Date();
    restaurant.suspendedBy = adminId;
  } else {
    if (restaurant.approvalStatus !== RESTAURANT_STATUS.suspended) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Restaurant is not suspended");
    }

    // Require a fresh approval after a suspension is lifted.
    restaurant.approvalStatus = RESTAURANT_STATUS.pending;
    restaurant.operationalStatus = RESTAURANT_OPERATIONAL_STATUS.inactive;
    restaurant.suspensionReason = null;
    restaurant.suspendedAt = null;
    restaurant.suspendedBy = null;
    restaurant.rejectionReason = null;
    restaurant.reviewedBy = null;
    restaurant.reviewedAt = null;
    restaurant.approvedAt = null;
  }

  await restaurant.save();

  return restaurant;
};

// ========================================
// UPDATE MY RESTAURANT
// ========================================

const updateMyRestaurant = async (userId, payload) => {
  await getEligibleOwner(userId);

  const {
    restaurantId,
    name,
    description,
    contactPhone,
    address,
    logo,
    coverImage,
  } = payload;

  if (!restaurantId) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Restaurant ID is required"
    );
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
    isDeleted: { $ne: true },
  });

  if (!restaurant) {
    throw new ApiError(
      STATUS_CODES.NOT_FOUND,
      "Restaurant not found or you do not have permission to update it"
    );
  }

  // Compare important fields BEFORE modifying the document.
  const nameChanged =
    name !== undefined &&
    name.trim() !== restaurant.name;

  const currentAddress =
    typeof restaurant.address?.toObject === "function"
      ? restaurant.address.toObject()
      : restaurant.address;

  const addressChanged =
    address !== undefined &&
    JSON.stringify(address) !== JSON.stringify(currentAddress);

  const requiresReview =
    restaurant.approvalStatus === RESTAURANT_STATUS.approved &&
    (nameChanged || addressChanged);

  // Update only the supplied fields.
  if (name !== undefined) {
    restaurant.name = name;

    if (nameChanged) {
      restaurant.slug = await generateUniqueSlug(
        name,
        restaurant._id
      );
    }
  }

  if (description !== undefined) {
    restaurant.description = description;
  }

  if (contactPhone !== undefined) {
    restaurant.contactPhone = contactPhone;
  }

  if (address !== undefined) {
    restaurant.address = address;
  }

  if (logo !== undefined) {
    restaurant.logo = logo;
  }

  if (coverImage !== undefined) {
    restaurant.coverImage = coverImage;
  }

  // Important changes require admin reapproval.
  if (requiresReview) {
    restaurant.approvalStatus = RESTAURANT_STATUS.pending;

    restaurant.operationalStatus =
      RESTAURANT_OPERATIONAL_STATUS.inactive;

    restaurant.reviewedBy = null;
    restaurant.reviewedAt = null;
    restaurant.approvedAt = null;
  }

  await restaurant.save();

  return restaurant;
};

// ========================================
// ACTIVATE / DEACTIVATE RESTAURANT
// ========================================

const updateOperationalStatus = async (
  userId,
  restaurantId,
  operationalStatus
) => {
  await getEligibleOwner(userId);

  const allowedStatuses = Object.values(
    RESTAURANT_OPERATIONAL_STATUS
  );

  if (!allowedStatuses.includes(operationalStatus)) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      "Invalid operational status"
    );
  }

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
    isDeleted: { $ne: true },
  });

  if (!restaurant) {
    throw new ApiError(
      STATUS_CODES.NOT_FOUND,
      "Restaurant not found or you do not have permission to manage it"
    );
  }

  if (restaurant.approvalStatus !== RESTAURANT_STATUS.approved) {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      "Only approved restaurants can change operational status"
    );
  }

  restaurant.operationalStatus = operationalStatus;

  await restaurant.save();

  return {
    restaurantId: restaurant._id,
    name: restaurant.name,
    approvalStatus: restaurant.approvalStatus,
    operationalStatus: restaurant.operationalStatus,
  };
};

// ========================================
// EXPORT SERVICES
// ========================================

module.exports = {
  createRestaurant,
  getMyRestaurant,
  getAdminRestaurants,
  getAdminRestaurantById,
  reviewRestaurant,
  updateRestaurantSuspension,
  updateMyRestaurant,
  updateOperationalStatus,
};
