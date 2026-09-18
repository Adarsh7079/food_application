const { z } = require("zod");
const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource id");
const phoneNumber = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number");

const addressSchema = z.object({
  label: z.string().trim().min(2).max(30).optional(),
  recipientName: z.string().trim().min(2).max(80),
  phoneNumber,
  line1: z.string().trim().min(5).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().length(2).toUpperCase(),
  landmark: z.string().trim().max(120).optional(),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72)
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number");

// Use this schema for admin-created users. Do not use it for public registration,
// because role and userStatus must only be changed by authorized users.
const userSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  phoneNumber: phoneNumber.optional(),
  address: z.string().trim().min(5).max(300).optional(),
  profileImage: z.url().max(2048).nullable().optional(),
  role: z.enum(Object.values(USER_ROLE)).default(USER_ROLE.customer),
  userStatus: z.enum(Object.values(USER_STATUS)).default(USER_STATUS.pending),
});

// Public registration intentionally excludes privileged role and status fields.
const registerSchema = userSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const verifyEmailSchema = z.object({
  token: z.string().regex(/^[a-f\d]{64}$/i, "Invalid verification token"),
});

const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phoneNumber: phoneNumber.optional(),
  address: z.string().trim().min(5).max(300).nullable().optional(),
  profileImage: z.url().max(2048).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update",
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phoneNumber: phoneNumber.optional(),
  address: z.string().trim().min(5).max(300).nullable().optional(),
  profileImage: z.url().max(2048).nullable().optional(),
  role: z.enum(Object.values(USER_ROLE)).optional(),
  userStatus: z.enum(Object.values(USER_STATUS)).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update",
});

const restaurantSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1000).optional(),
  phoneNumber,
  email: z.string().trim().toLowerCase().email(),
  address: addressSchema,
  cuisineTypes: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format"),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format"),
});

const foodItemSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1000).optional(),
  category: z.string().trim().min(2).max(50),
  price: z.coerce.number().finite().nonnegative().max(1000000),
  discountPrice: z.coerce.number().finite().nonnegative().max(1000000).optional(),
  isVegetarian: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(300).optional(),
  images: z.array(z.url().max(2048)).min(1).max(5),
}).refine(
  (data) => data.discountPrice === undefined || data.discountPrice <= data.price,
  { path: ["discountPrice"], message: "Discount price cannot exceed price" }
);

const cartItemSchema = z.object({
  foodItemId: objectId,
  quantity: z.coerce.number().int().min(1).max(20),
  specialInstructions: z.string().trim().max(300).optional(),
});

const orderSchema = z.object({
  restaurantId: objectId,
  items: z.array(cartItemSchema).min(1).max(30),
  deliveryAddress: addressSchema,
  paymentMethod: z.enum(["COD", "CARD", "UPI", "WALLET"]),
  specialInstructions: z.string().trim().max(500).optional(),
}).superRefine((data, context) => {
  const duplicateFoodItems = new Set();
  for (const item of data.items) {
    if (duplicateFoodItems.has(item.foodItemId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "Each food item may appear only once in an order",
      });
      break;
    }
    duplicateFoodItems.add(item.foodItemId);
  }
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  cancellationReason: z.string().trim().min(3).max(300).optional(),
}).superRefine((data, context) => {
  if (data.status === "CANCELLED" && !data.cancellationReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["cancellationReason"],
      message: "A cancellation reason is required",
    });
  }
});

const idParamSchema = z.object({ id: objectId });
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});

module.exports = {
  addressSchema,
  userSchema,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  updateProfileSchema,
  updateUserSchema,
  restaurantSchema,
  foodItemSchema,
  cartItemSchema,
  orderSchema,
  updateOrderStatusSchema,
  idParamSchema,
  paginationSchema,
};
