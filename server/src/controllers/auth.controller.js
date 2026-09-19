const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");
const { sendVerificationEmail } = require("../services/email.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const sendError = (res, error) => {
  if (!error.statusCode) {
    console.error("Authentication request failed:", error);
  }
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(
      error.statusCode || 500,
      error.statusCode ? error.message : "Unable to process the request",
      error.name === "ZodError" ? error.issues : []
    );
  return res.status(apiError.statusCode).json(apiError);
};

const signup = async (req, res) => {
   
  try {
      
    const user = await userService.createUser(req.validated.body);
    const token = await userService.createEmailVerificationToken(user);
    await sendVerificationEmail({ email: user.email, name: user.name, token });

    return res.status(201).json(new ApiResponse(
      201,
      null,
      "Signup successful. Please check your email to verify your account."
    ));
  } catch (error) {
    return sendError(res, error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    await userService.verifyEmail(req.validated.query.token);
    return res.status(200).json(new ApiResponse(
      200,
      null,
      "Email verified successfully. You can now log in."
    ));
  } catch (error) {
    return sendError(res, error);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { user, token } = await userService.resendEmailVerification(req.validated.body.email);
    await sendVerificationEmail({ email: user.email, name: user.name, token });
    return res.status(200).json(new ApiResponse(200, null, "A new verification email has been sent."));
  } catch (error) {
    return sendError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const user = await userService.authenticateUser(
      req.validated.body.email,
      req.validated.body.password
    );
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
    return res.status(200).json(new ApiResponse(
      200,
      { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      "Login successful"
    ));
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = { signup, verifyEmail, resendVerificationEmail, login };
