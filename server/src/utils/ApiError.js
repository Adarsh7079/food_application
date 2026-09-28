class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: false,
      message:
        this.statusCode === 409
          ? "Unable to complete the request with the provided details."
          : this.message,
      data: null,
      errors: this.errors,
    };
  }
}

module.exports = ApiError;
