const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model");

const userService = require("../services/user.service");

const { sendVerificationEmail } = require("../services/email.service");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// ========================================
// ERROR HANDLER
// ========================================

const sendError = (res, error) => {
  if (!error.statusCode) {
    console.error("Authentication request failed:", error);
  }

  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(
          error.statusCode || 500,

          error.statusCode ? error.message : "Unable to process the request",

          error.name === "ZodError" ? error.issues : [],
        );

  return res.status(apiError.statusCode).json({
    statusCode: apiError.statusCode,
    success: false,
    message: apiError.message,
    data: null,
    errors: apiError.errors || [],
  });
};

// ========================================
// SIGNUP
// ========================================

const signup = async (req, res) => {
  try {
    const user = await userService.createUser(req.validated.body);

    const token = await userService.createEmailVerificationToken(user);

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          "Signup successful. Please check your email to verify your account.",
        ),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async (req, res) => {
  try {
    await userService.verifyEmail(req.validated.query.token);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Email verified successfully. You can now log in.",
        ),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

// ========================================
// RESEND VERIFICATION EMAIL
// ========================================

const resendVerificationEmail = async (req, res) => {
  try {
    const { user, token } = await userService.resendEmailVerification(
      req.validated.body.email,
    );

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "A new verification email has been sent."),
      );
  } catch (error) {
    return sendError(res, error);
  }
};

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const user = await userService.authenticateUser(
      req.validated.body.email,
      req.validated.body.password,
    );

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    // Hash refresh token before storing
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    user.refreshToken = refreshTokenHash;

    await user.save({
      validateBeforeSave: false,
    });

    // Store refresh token in HttpOnly cookie
    res.cookie(
      process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",

      refreshToken,

      {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000,

        path: "/api/v1/auth",
      },
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            userStatus: user.userStatus,
            profileImage: user.profileImage,
          },
        },
        "Login successful",
      ),
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refreshAccessToken = async (req, res) => {
  try {
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

    const refreshToken = req.cookies[cookieName];

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token required");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: refreshTokenHash,
    }).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user.userStatus !== "approved") {
      throw new ApiError(403, "Your account is not active");
    }

    const accessToken = user.generateAccessToken();

    // Rotate refresh token
    const newRefreshToken = user.generateRefreshToken();

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    user.refreshToken = newRefreshTokenHash;

    await user.save({
      validateBeforeSave: false,
    });

    res.cookie(cookieName, newRefreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000,

      path: "/api/v1/auth",
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
        },
        "Access token refreshed",
      ),
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// ========================================
// LOGOUT
// ========================================

const logout = async (req, res) => {
  try {
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

    const refreshToken = req.cookies[cookieName];

    if (refreshToken) {
      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await User.findOneAndUpdate(
        {
          refreshToken: refreshTokenHash,
        },
        {
          $unset: {
            refreshToken: 1,
          },
        },
      );
    }

    res.clearCookie(cookieName, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      path: "/api/v1/auth",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  signup,
  verifyEmail,
  resendVerificationEmail,
  login,
  refreshAccessToken,
  logout,
};
