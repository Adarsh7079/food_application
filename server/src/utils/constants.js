// ========================================
// USER STATUS
// ========================================

const USER_STATUS = Object.freeze({
  approved: "APPROVED",
  pending: "PENDING",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
});

// ========================================
// USER ROLES
// ========================================

const USER_ROLE = Object.freeze({
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
  customer: "CUSTOMER",
  delivery: "DELIVERY",
  restaurant: "RESTAURANT",
});

// ========================================
// RESTAURANT APPROVAL STATUS
// Used by the super admin to review restaurants
// ========================================

const RESTAURANT_STATUS = Object.freeze({
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
});

// ========================================
// RESTAURANT OPERATIONAL STATUS
// Controls whether a restaurant operates
// ========================================

const RESTAURANT_OPERATIONAL_STATUS = Object.freeze({
  active: "ACTIVE",
  inactive: "INACTIVE",
});

// ========================================
// PRODUCT STATUS
// ========================================

const PRODUCT_STATUS = Object.freeze({
  draft: "DRAFT",
  published: "PUBLISHED",
  archived: "ARCHIVED",
});

// ========================================
// ORDER STATUS
// ========================================

const ORDER_STATUS = Object.freeze({
  pending: "PENDING",
  confirmed: "CONFIRMED",
  preparing: "PREPARING",
  readyForPickup: "READY_FOR_PICKUP",
  outForDelivery: "OUT_FOR_DELIVERY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  rejected: "REJECTED",
});

// ========================================
// PAYMENT STATUS
// ========================================

const PAYMENT_STATUS = Object.freeze({
  pending: "PENDING",
  success: "SUCCESS",
  failed: "FAILED",
  refunded: "REFUNDED",
});

// ========================================
// BOOKING STATUS
// Keep this if your project uses bookings
// ========================================

const BOOKING_STATUS = Object.freeze({
  cancelled: "CANCELLED",
  successful: "SUCCESSFUL",
  processing: "IN_PROCESS",
  expired: "EXPIRED",
});

// ========================================
// HTTP STATUS CODES
// ========================================

const STATUS_CODES = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORISED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

// ========================================
// EXPORTS
// ========================================

module.exports = {
  USER_STATUS,
  USER_ROLE,
  RESTAURANT_STATUS,
  RESTAURANT_OPERATIONAL_STATUS,
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  BOOKING_STATUS,
  STATUS_CODES,
};
