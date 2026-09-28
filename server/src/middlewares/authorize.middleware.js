const ApiError = require("../utils/ApiError");
const sendApiError = require("../utils/sendApiError");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendApiError(res, new ApiError(401, "Authentication required"));
    }

    const userRoles = req.user.roles || [];

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return sendApiError(
        res,
        new ApiError(403, "You are not authorized to access this resource"),
      );
    }

    next();
  };
};

module.exports = authorize;
