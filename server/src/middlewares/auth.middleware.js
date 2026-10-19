const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const sendApiError = require("../utils/sendApiError");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendApiError(res, new ApiError(401, "Authentication required"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return sendApiError(res, new ApiError(401, "Access token is missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId).select("+authTokenVersion");

    if (!user || (decoded.tokenVersion ?? 0) !== (user.authTokenVersion ?? 0)) {
      throw new ApiError(401, "Authentication required");
    }

    req.user = {
      userId: user._id.toString(),
      roles: user.roles || [],
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return sendApiError(res, error, "Authentication failed");
  }
};

module.exports = authenticate;
