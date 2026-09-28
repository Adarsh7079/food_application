const ApiError = require("./ApiError");

const sendApiError = (res, error, context = "Request failed") => {
  const isDuplicateKeyError = error.code === 11000;
  const isZodError = error.name === "ZodError";
  const isJwtError =
    error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";

  let statusCode = error.statusCode || 500;
  let message = error.message;
  let errors = error.errors || [];

  if (isDuplicateKeyError) {
    statusCode = 409;
    message = "Unable to complete the request with the provided details.";
  } else if (statusCode === 409) {
    message = "Unable to complete the request with the provided details.";
  } else if (isZodError) {
    statusCode = 422;
    message = "Validation failed";
    errors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (isJwtError) {
    statusCode = 401;
    message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
  } else if (statusCode >= 500 && statusCode !== 503) {
    message = "Unable to process the request";
  } else if (!message) {
    message = "Unable to process the request";
  }

  if (statusCode >= 500 && !(error instanceof ApiError && statusCode === 503)) {
    console.error(`${context}:`, error);
  }

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    data: null,
    errors,
  });
};

module.exports = sendApiError;