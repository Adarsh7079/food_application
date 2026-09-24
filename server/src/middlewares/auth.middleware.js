const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: "Authentication required",
                data: null,
                errors: [],
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: "Access token is missing",
                data: null,
                errors: [],
            });
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
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: "Access token expired",
                data: null,
                errors: [],
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: "Invalid access token",
                data: null,
                errors: [],
            });
        }

        console.error("Authentication error:", error);

        return res.status(401).json({
            statusCode: 401,
            success: false,
            message: "Authentication failed",
            data: null,
            errors: [],
        });
    }
};

module.exports = authenticate;