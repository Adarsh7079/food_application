const assert = require("node:assert/strict");
const test = require("node:test");

const ApiError = require("../src/utils/ApiError");
const ApiResponse = require("../src/utils/ApiResponse");
const sendApiError = require("../src/utils/sendApiError");
const User = require("../src/models/user.model");
const Restaurant = require("../src/models/restaurant.model");
const userService = require("../src/services/user.service");
const restaurantService = require("../src/services/restaurant.service");
const {
  RESTAURANT_OPERATIONAL_STATUS,
  RESTAURANT_STATUS,
} = require("../src/utils/constants");
const {
  reviewRestaurantSchema,
  updateRestaurantSuspensionSchema,
  whatsappOrderNotificationSchema,
  contactEnquirySchema,
} = require("../src/validations/schemas");

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

test("WhatsApp checkout email notifications validate customer and item details", () => {
  const validCheckout = {
    customerName: "Test Customer",
    customerEmail: "customer@example.com",
    phoneNumber: "+919876543210",
    deliveryAddress: "Cyber City, Gurugram, Haryana",
    location: "Gurugram Cyber City",
    items: [{ name: "Poha", quantity: 2, unitPrice: 120 }],
  };

  assert.equal(whatsappOrderNotificationSchema.safeParse(validCheckout).success, true);
  assert.equal(
    whatsappOrderNotificationSchema.safeParse({
      ...validCheckout,
      items: [{ name: "Poha", quantity: 0, unitPrice: -1 }],
    }).success,
    false,
  );
});

test("contact enquiries validate and normalize submitted email addresses", () => {
  const result = contactEnquirySchema.safeParse({
    name: "Test Customer",
    email: " CUSTOMER@EXAMPLE.COM ",
    phone: "+91 98765 43210",
    message: "I would like to enquire about catering.",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, "customer@example.com");
  assert.equal(
    contactEnquirySchema.safeParse({
      name: "T",
      email: "invalid",
      phone: "",
      message: "Hi",
    }).success,
    false,
  );
});

test("restaurant review requires a reason when rejecting", () => {
  assert.equal(
    reviewRestaurantSchema.safeParse({
      approvalStatus: RESTAURANT_STATUS.rejected,
    }).success,
    false,
  );
  assert.equal(
    reviewRestaurantSchema.safeParse({
      approvalStatus: RESTAURANT_STATUS.rejected,
      rejectionReason: "Missing business information",
    }).success,
    true,
  );
});

test("restaurant suspension requires a reason and records the super admin", async () => {
  const originalFindOne = Restaurant.findOne;
  const restaurant = {
    approvalStatus: RESTAURANT_STATUS.approved,
    operationalStatus: RESTAURANT_OPERATIONAL_STATUS.active,
    async save() {},
  };
  Restaurant.findOne = async () => restaurant;

  try {
    assert.equal(
      updateRestaurantSuspensionSchema.safeParse({
        isSuspended: true,
      }).success,
      false,
    );

    await restaurantService.updateRestaurantSuspension(
      "restaurant-id",
      "admin-id",
      true,
      "Administrative review",
    );

    assert.equal(restaurant.approvalStatus, RESTAURANT_STATUS.suspended);
    assert.equal(
      restaurant.operationalStatus,
      RESTAURANT_OPERATIONAL_STATUS.inactive,
    );
    assert.equal(restaurant.suspensionReason, "Administrative review");
    assert.equal(restaurant.suspendedBy, "admin-id");
    assert.ok(restaurant.suspendedAt instanceof Date);
  } finally {
    Restaurant.findOne = originalFindOne;
  }
});

test("unsuspending returns the restaurant to pending and inactive", async () => {
  const originalFindOne = Restaurant.findOne;
  const restaurant = {
    approvalStatus: RESTAURANT_STATUS.suspended,
    operationalStatus: RESTAURANT_OPERATIONAL_STATUS.inactive,
    suspensionReason: "Administrative review",
    suspendedAt: new Date(),
    suspendedBy: "admin-id",
    reviewedBy: "admin-id",
    reviewedAt: new Date(),
    approvedAt: new Date(),
    async save() {},
  };
  Restaurant.findOne = async () => restaurant;

  try {
    await restaurantService.updateRestaurantSuspension(
      "restaurant-id",
      "admin-id",
      false,
    );

    assert.equal(restaurant.approvalStatus, RESTAURANT_STATUS.pending);
    assert.equal(
      restaurant.operationalStatus,
      RESTAURANT_OPERATIONAL_STATUS.inactive,
    );
    assert.equal(restaurant.suspensionReason, null);
    assert.equal(restaurant.suspendedAt, null);
    assert.equal(restaurant.suspendedBy, null);
    assert.equal(restaurant.reviewedBy, null);
    assert.equal(restaurant.reviewedAt, null);
    assert.equal(restaurant.approvedAt, null);
  } finally {
    Restaurant.findOne = originalFindOne;
  }
});
