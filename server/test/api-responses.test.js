const assert = require("node:assert/strict");
const test = require("node:test");

const ApiError = require("../src/utils/ApiError");
const ApiResponse = require("../src/utils/ApiResponse");
const sendApiError = require("../src/utils/sendApiError");
const User = require("../src/models/user.model");
const userService = require("../src/services/user.service");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const registration = {
  name: "Test User",
  email: "test@example.com",
  password: "Password123",
};

test("signup rejects an email that already exists", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  User.findOne = async () => ({ email: registration.email });
  User.create = async () => {
    assert.fail("User.create should not run for an existing email");
  };

  try {
    await assert.rejects(userService.createUser(registration), {
      statusCode: 409,
      message: "An account with this email already exists.",
    });
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test("signup reports an email conflict if it races with another registration", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  User.findOne = async () => null;
  User.create = async () => {
    throw { code: 11000 };
  };

  try {
    await assert.rejects(userService.createUser(registration), {
      statusCode: 409,
      message: "An account with this email already exists.",
    });
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test("error responses preserve specific conflict messages", () => {
  const response = createResponse();

  sendApiError(response, new ApiError(409, "This restaurant already exists."));

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    statusCode: 409,
    success: false,
    message: "This restaurant already exists.",
    data: null,
    errors: [],
  });
});

test("duplicate email database errors return a specific conflict message", () => {
  const response = createResponse();

  sendApiError(response, {
    code: 11000,
    keyPattern: { email: 1 },
    message: "duplicate key",
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.message, "An account with this email already exists.");
});

test("success responses retain their endpoint-specific message", () => {
  assert.deepEqual(
    new ApiResponse(
      202,
      null,
      "Account created successfully. Check your email to verify your account.",
    ),
    new ApiResponse(
      202,
      null,
      "Account created successfully. Check your email to verify your account.",
    ),
  );
});
