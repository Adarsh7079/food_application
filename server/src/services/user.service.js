const User = require("../models/user.model");
const crypto = require("crypto");
const cloudinaryService = require("./cloudinary.service");

const { USER_STATUS } = require("../utils/constants");

const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  idParamSchema,
  passwordSchema,
} = require("../validations/schemas");

// ================================
// SERVICE ERROR
// ================================

const createServiceError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

// ================================
// PARSE USER ID
// ================================

const parseUserId = (id) => idParamSchema.parse({ id }).id;

// ================================
// CREATE USER
// ================================

const createUser = async (payload) => {
  const userData = registerSchema.parse(payload);

  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw createServiceError("An account with this email already exists.", 409);
  }

  try {
    return await User.create(userData);
  } catch (error) {
    if (error.code === 11000) {
      throw createServiceError(
        "An account with this email already exists.",
        409,
      );
    }

    throw error;
  }
};

// ================================
// GET USER BY ID
// ================================

const getUserById = async (id) => {
  const user = await User.findById(parseUserId(id));

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return user;
};

// ================================
// GET USER BY EMAIL
// ================================

const getUserByEmail = async (email) => {
  const normalizedEmail = registerSchema.shape.email.parse(email);

  return User.findOne({
    email: normalizedEmail,
  });
};

// ================================
// GET CURRENT USER PROFILE
// ================================

const getMyProfile = async (userId) => {
  const user = await User.findById(parseUserId(userId)).select(
    "-password " +
      "-emailVerificationToken " +
      "-emailVerificationExpires " +
      "-refreshToken",
  );

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return user;
};

// ================================
// UPDATE CURRENT USER PROFILE
// ================================

const updateMyProfile = async (userId, payload) => {
  const parsedUserId = parseUserId(userId);

  const updates = updateProfileSchema.parse(payload);
  const imageFolder = `food_application/users/${parsedUserId}/profile/`;
  if (
    updates.profileImagePublicId &&
    !updates.profileImagePublicId.startsWith(imageFolder)
  ) {
    throw createServiceError("The profile image does not belong to this account.", 403);
  }

  const currentUser = await User.findById(parsedUserId).select("profileImagePublicId");
  if (!currentUser) throw createServiceError("User not found", 404);
  const previousPublicId = currentUser.profileImagePublicId;

  const user = await User.findByIdAndUpdate(
    parsedUserId,
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select(
    "-password " +
      "-emailVerificationToken " +
      "-emailVerificationExpires " +
      "-refreshToken",
  );

  if (!user) {
    throw createServiceError("User not found", 404);
  }

  if (
    previousPublicId &&
    updates.profileImagePublicId !== undefined &&
    previousPublicId !== updates.profileImagePublicId
  ) {
    await cloudinaryService.deleteImage(previousPublicId);
  }

  return user;
};

const updateLocationAnalyticsConsent = async (userId, consent) => {
  const user = await User.findByIdAndUpdate(
    parseUserId(userId),
    { $set: { locationAnalyticsConsent: consent } },
    { new: true, runValidators: true },
  ).select("locationAnalyticsConsent");

  if (!user) throw createServiceError("User not found", 404);
  return { locationAnalyticsConsent: user.locationAnalyticsConsent };
};

const getAdminUsers = async ({ page, limit, search }) => {
  const filter = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(escapedSearch, "i");
    filter.$or = [
      { name: expression },
      { email: expression },
      { phoneNumber: expression },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phoneNumber address profileImage roles userStatus emailVerifiedAt locationAnalyticsConsent createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getAdminUserById = async (userId) => {
  const user = await User.findById(parseUserId(userId))
    .select("name email phoneNumber address profileImage profileImagePublicId roles userStatus emailVerifiedAt locationAnalyticsConsent createdAt updatedAt")
    .lean();
  if (!user) throw createServiceError("User not found", 404);
  return user;
};

// ================================
// AUTHENTICATE USER
// ================================

const authenticateUser = async (email, password) => {
  const credentials = loginSchema.parse({
    email,
    password,
  });

  const user = await User.findOne({
    email: credentials.email,
  }).select("+password +authTokenVersion");

  if (!user || !(await user.isValidPassword(credentials.password))) {
    throw createServiceError("Invalid email or password", 401);
  }

  if (user.userStatus !== USER_STATUS.approved) {
    throw createServiceError("Please verify your email before logging in", 403);
  }

  return user;
};

// ================================
// CREATE EMAIL VERIFICATION TOKEN
// ================================

const createEmailVerificationToken = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");

  user.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  return token;
};

// ================================
// VERIFY EMAIL
// ================================

const verifyEmail = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: tokenHash,

    emailVerificationExpires: {
      $gt: new Date(),
    },
  }).select("+emailVerificationToken " + "+emailVerificationExpires");

  if (!user) {
    throw createServiceError(
      "This verification link is invalid or has expired",
      400,
    );
  }

  user.userStatus = USER_STATUS.approved;

  user.emailVerifiedAt = new Date();

  user.emailVerificationToken = undefined;

  user.emailVerificationExpires = undefined;

  await user.save();

  return user;
};

// ================================
// RESEND EMAIL VERIFICATION
// ================================

const resendEmailVerification = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw createServiceError("No account exists with this email", 404);
  }

  if (user.userStatus === USER_STATUS.approved) {
    throw createServiceError("This account has already been verified", 400);
  }

  return {
    user,
    token: await createEmailVerificationToken(user),
  };
};

const createPasswordResetToken = async (email) => {
  const parsedEmail = registerSchema.shape.email.parse(email);
  const user = await User.findOne({ email: parsedEmail });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  return { user, token };
};

const resetPassword = async (token, password) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires +refreshToken +authTokenVersion");

  if (!user) {
    throw createServiceError("This password reset link is invalid or has expired", 400);
  }

  user.password = passwordSchema.parse(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  user.authTokenVersion += 1;
  await user.save();
  return user;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getMyProfile,
  updateMyProfile,
  updateLocationAnalyticsConsent,
  getAdminUsers,
  getAdminUserById,
  authenticateUser,
  createEmailVerificationToken,
  verifyEmail,
  resendEmailVerification,
  createPasswordResetToken,
  resetPassword,
};
