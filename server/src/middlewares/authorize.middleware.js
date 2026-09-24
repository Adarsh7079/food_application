const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Authentication required",
        data: null,
        errors: [],
      });
    }

    const userRoles = req.user.roles || [];

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "You are not authorized to access this resource",
        data: null,
        errors: [],
      });
    }

    next();
  };
};

module.exports = authorize;
