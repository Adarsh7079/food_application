const User = require("../models/user.model");
const crypto = require("crypto");
const { USER_STATUS } = require("../utils/constants");
const {
  userSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateUserSchema,
  idParamSchema,
} = require("../validations/schemas");

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseUserId = (id) => idParamSchema.parse({ id }).id;

const createUser = async (payload, { allowRoleManagement = false } = {}) => {
  // Public signup cannot assign privileged fields such as role or userStatus.
  const userData = (allowRoleManagement ? userSchema : registerSchema).parse(payload);

  try {
    return await User.create(userData);
  } catch (error) {
    if (error.code === 11000) {
      throw createServiceError("An account with this email already exists", 409);
    }
    throw error;
  }
};

const getUserById = async (id) => {
  const user = await User.findById(parseUserId(id));
  if (!user) throw createServiceError("User not found", 404);
  return user;
};

const getUserByEmail = async (email) => {
  const normalizedEmail = registerSchema.shape.email.parse(email);
  return User.findOne({ email: normalizedEmail });
};

const updateUser = async (id, payload, { allowRoleManagement = false } = {}) => {
  const userId = parseUserId(id);
  const updates = (allowRoleManagement ? updateUserSchema : updateProfileSchema).parse(payload);

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw createServiceError("User not found", 404);
  return user;
};

const authenticateUser = async (email, password) => {
  const credentials = loginSchema.parse({ email, password });
  const user = await User.findOne({ email: credentials.email });

  if (!user || !(await user.isValidPassword(credentials.password))) {
    throw createServiceError("Invalid email or password", 401);
  }
  if (user.userStatus !== USER_STATUS.approved) {
    throw createServiceError("Please verify your email before logging in", 403);
  }
  return user;
};

const createEmailVerificationToken = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  return token;
};

const verifyEmail = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw createServiceError("This verification link is invalid or has expired", 400);
  }

  user.userStatus = USER_STATUS.approved;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return user;
};

const resendEmailVerification = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) throw createServiceError("No account exists with this email", 404);
  if (user.userStatus === USER_STATUS.approved) {
    throw createServiceError("This account has already been verified", 400);
  }
  return { user, token: await createEmailVerificationToken(user) };
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  authenticateUser,
  createEmailVerificationToken,
  verifyEmail,
  resendEmailVerification,
};
