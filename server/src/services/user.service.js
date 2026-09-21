const User = require("../models/user.model");
const crypto = require("crypto");

const { USER_STATUS } = require("../utils/constants");

const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  idParamSchema,
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

  try {
    return await User.create(userData);
  } catch (error) {
    if (error.code === 11000) {
      throw createServiceError(
        "An account with this email already exists",
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
  }).select("+password");

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

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getMyProfile,
  updateMyProfile,
  authenticateUser,
  createEmailVerificationToken,
  verifyEmail,
  resendEmailVerification,
};
