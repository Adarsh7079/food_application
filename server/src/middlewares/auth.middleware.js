const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const sendApiError = require("../utils/sendApiError");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendApiError(res, new ApiError(401, "Authentication required"));
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return sendApiError(res, new ApiError(401, "Access token is missing"));
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        req.user = {
            userId: decoded.userId,
            roles: decoded.roles || [],
        };

        next();
    } catch (error) {
        return sendApiError(res, error, "Authentication failed");
    }
};

module.exports = authenticate;