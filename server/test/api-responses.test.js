const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");

const ApiError = require("../src/utils/ApiError");
const ApiResponse = require("../src/utils/ApiResponse");
const authController = require("../src/controllers/auth.controller");
const sendApiError = require("../src/utils/sendApiError");
const User = require("../src/models/user.model");
const Restaurant = require("../src/models/restaurant.model");
const Product = require("../src/models/product.model");
const ProductReview = require("../src/models/productReview.model");
const LocationActivity = require("../src/models/locationActivity.model");
const userService = require("../src/services/user.service");
const restaurantService = require("../src/services/restaurant.service");
const productReviewsService = require("../src/services/productReviews.service");
const locationAnalyticsService = require("../src/services/locationAnalytics.service");
const {
  RESTAURANT_OPERATIONAL_STATUS,
  RESTAURANT_STATUS,
} = require("../src/utils/constants");
const {
  reviewRestaurantSchema,
  updateRestaurantSuspensionSchema,
  whatsappOrderNotificationSchema,
  contactEnquirySchema,
  productIdParamSchema,
  productReviewSchema,
  locationAnalyticsConsentSchema,
  customerLocationSchema,
  locationAnalyticsQuerySchema,
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
  clearCookie(name, options) {
    this.clearedCookie = { name, options };
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

test("logout clears the refresh cookie and revokes its matching token", async () => {
  const originalSecret = process.env.REFRESH_TOKEN_SECRET;
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  const userId = "507f1f77bcf86cd799439011";
  const refreshToken = jwt.sign(
    { userId },
    "test-refresh-secret",
    { expiresIn: "1h" },
  );
  let revokedFilter;
  let revokedUpdate;
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
  User.findOneAndUpdate = async (filter, update) => {
    revokedFilter = filter;
    revokedUpdate = update;
  };
  const response = createResponse();

  try {
    await authController.logout(
      { cookies: { refreshToken } },
      response,
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.clearedCookie.name, "refreshToken");
    assert.deepEqual(response.clearedCookie.options, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/v1/auth",
    });
    assert.equal(revokedFilter._id, userId);
    assert.equal(typeof revokedFilter.refreshToken, "string");
    assert.equal(revokedUpdate.$inc.authTokenVersion, 1);
    assert.equal(revokedUpdate.$unset.refreshToken, 1);
  } finally {
    User.findOneAndUpdate = originalFindOneAndUpdate;
    if (originalSecret === undefined) delete process.env.REFRESH_TOKEN_SECRET;
    else process.env.REFRESH_TOKEN_SECRET = originalSecret;
  }
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

test("product reviews require a 1–5 integer rating and normalize optional comments", () => {
  const valid = productReviewSchema.safeParse({
    rating: 5,
    comment: "  Delicious meal  ",
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.comment, "Delicious meal");
  assert.equal(productReviewSchema.safeParse({ rating: 1 }).success, true);

  for (const rating of [0, 6, 2.5, "5"]) {
    assert.equal(productReviewSchema.safeParse({ rating }).success, false);
  }
  assert.equal(
    productReviewSchema.safeParse({ rating: 4, comment: "x".repeat(501) }).success,
    false,
  );
  assert.equal(
    productIdParamSchema.safeParse({ productId: "not-an-object-id" }).success,
    false,
  );
});

test("product review persistence enforces integer ratings from one to five", async () => {
  for (const rating of [1, 5]) {
    const review = new ProductReview({
      product: "507f1f77bcf86cd799439011",
      customer: "507f1f77bcf86cd799439012",
      rating,
    });
    await assert.doesNotReject(() => review.validate());
  }

  for (const rating of [0, 6, 2.5]) {
    const review = new ProductReview({
      product: "507f1f77bcf86cd799439011",
      customer: "507f1f77bcf86cd799439012",
      rating,
    });
    await assert.rejects(review.validate());
  }
});

test("submitting a product review returns the updated aggregate rating", async () => {
  const originalFindOne = Product.findOne;
  const originalFindOneAndUpdate = ProductReview.findOneAndUpdate;
  const originalAggregate = ProductReview.aggregate;
  const productId = "507f1f77bcf86cd799439011";
  const customerId = "507f1f77bcf86cd799439012";
  const product = { _id: productId };
  const review = {
    _id: "507f1f77bcf86cd799439013",
    rating: 5,
    comment: "Great",
    createdAt: new Date("2026-10-24T00:00:00.000Z"),
  };
  Product.findOne = () => ({ select: async () => product });
  ProductReview.findOneAndUpdate = async () => review;
  ProductReview.aggregate = async () => [{ rating: 4.5, ratingCount: 2 }];

  try {
    const result = await productReviewsService.submitProductReview(
      productId,
      customerId,
      { rating: 5, comment: "Great" },
    );

    assert.equal(result.rating, 4.5);
    assert.equal(result.ratingCount, 2);
    assert.equal(result.review._id, review._id);
  } finally {
    Product.findOne = originalFindOne;
    ProductReview.findOneAndUpdate = originalFindOneAndUpdate;
    ProductReview.aggregate = originalAggregate;
  }
});

test("location collection requires consent and validates GPS coordinates", () => {
  assert.equal(locationAnalyticsConsentSchema.safeParse({ consent: true }).success, true);
  assert.equal(locationAnalyticsConsentSchema.safeParse({ consent: "yes" }).success, false);
  assert.equal(customerLocationSchema.safeParse({ latitude: 90, longitude: 180 }).success, true);
  assert.equal(customerLocationSchema.safeParse({ latitude: 91, longitude: 0 }).success, false);
  assert.equal(customerLocationSchema.safeParse({ latitude: 0, longitude: -181 }).success, false);
  assert.equal(
    locationAnalyticsQuerySchema.safeParse({
      from: "2026-10-01",
      to: "2026-10-31",
      search: "  28.61  ",
    }).success,
    true,
  );
});

test("location activity stores only rounded daily area counts without a user id", async () => {
  assert.equal(LocationActivity.schema.path("userId"), undefined);
  assert.equal(LocationActivity.schema.path("latitude"), undefined);
  assert.equal(LocationActivity.schema.path("longitude"), undefined);
  const originalFindOneAndUpdate = LocationActivity.findOneAndUpdate;
  let capturedFilter;
  let capturedUpdate;
  LocationActivity.findOneAndUpdate = async (filter, update) => {
    capturedFilter = filter;
    capturedUpdate = update;
  };

  try {
    await locationAnalyticsService.recordCustomerLogin({
      latitude: 28.6139,
      longitude: 77.209,
    });
    assert.equal(capturedFilter.latitudeCell, 28.61);
    assert.equal(capturedFilter.longitudeCell, 77.21);
    assert.equal(capturedFilter.day.getUTCHours(), 0);
    assert.equal(capturedUpdate.$inc.loginCount, 1);
    assert.equal("userId" in capturedFilter, false);
  } finally {
    LocationActivity.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("location analytics applies the minimum count threshold before returning cells", async () => {
  const originalAggregate = LocationActivity.aggregate;
  const originalFind = Restaurant.find;
  const pipelines = [];
  LocationActivity.aggregate = async (pipeline) => {
    pipelines.push(pipeline);
    if (pipeline[1].$group._id.latitude) {
      return [
        { _id: { latitude: 28.61, longitude: 77.21 }, loginCount: 5 },
      ];
    }
    return [{ _id: new Date("2026-10-24T00:00:00.000Z"), loginCount: 5 }];
  };
  Restaurant.find = () => ({
    select() { return this; },
    sort() { return this; },
    limit() { return this; },
    lean: async () => [{
      _id: "507f1f77bcf86cd799439014",
      name: "Sample Restaurant",
      address: { city: "Gurugram" },
      location: { latitude: 28.61, longitude: 77.21 },
    }],
  });

  try {
    const result = await locationAnalyticsService.getLocationAnalytics({
      from: "2026-10-01",
      to: "2026-10-31",
      search: "gurugram",
    });
    assert.equal(result.loginLocations.length, 0);
    assert.equal(result.restaurantLocations.length, 1);
    assert.equal(result.privacyThreshold, 5);
    assert.ok(pipelines.every((pipeline) =>
      pipeline.some((stage) => stage.$match?.loginCount?.$gte === 5),
    ));
  } finally {
    LocationActivity.aggregate = originalAggregate;
    Restaurant.find = originalFind;
  }
});
