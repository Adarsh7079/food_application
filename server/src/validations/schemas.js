const { z } = require("zod");
const {
  USER_ROLE,
  USER_STATUS,
  RESTAURANT_STATUS,
  RESTAURANT_OPERATIONAL_STATUS,
} = require("../utils/constants");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource id");
const phoneNumber = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number");

const restaurantAddressSchema = z.object({
  street: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(60),
});

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

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f\d]{64}$/i, "Invalid password reset token"),
  password: passwordSchema,
});

const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(20),
  message: z.string().trim().min(5).max(2000),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phoneNumber: phoneNumber.optional(),
    address: z.string().trim().min(5).max(300).nullable().optional(),
    profileImage: z.url().max(2048).nullable().optional(),
    profileImagePublicId: z.string().trim().max(255).nullable().optional(),
  })
  .superRefine((data, context) => {
    if ((data.profileImage === undefined) !== (data.profileImagePublicId === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profileImagePublicId"],
        message: "Profile image URL and Cloudinary ID must be updated together",
      });
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
const locationAnalyticsConsentSchema = z.object({
  consent: z.boolean(),
});
const customerLocationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
const locationAnalyticsQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  search: z.string().trim().max(80).optional(),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phoneNumber: phoneNumber.optional(),
    address: z.string().trim().min(5).max(300).nullable().optional(),
    profileImage: z.url().max(2048).nullable().optional(),
    role: z.enum(Object.values(USER_ROLE)).optional(),
    userStatus: z.enum(Object.values(USER_STATUS)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const restaurantSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1000).optional(),
  phoneNumber,
  email: z.string().trim().toLowerCase().email(),
  address: addressSchema,
  cuisineTypes: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format"),
  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format"),
});

const foodItemSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(1000).optional(),
    category: z.string().trim().min(2).max(50),
    price: z.coerce.number().finite().nonnegative().max(1000000),
    discountPrice: z.coerce
      .number()
      .finite()
      .nonnegative()
      .max(1000000)
      .optional(),
    isVegetarian: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    preparationTimeMinutes: z.coerce.number().int().min(1).max(300).optional(),
    images: z.array(z.url().max(2048)).min(1).max(5),
  })
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice <= data.price,
    { path: ["discountPrice"], message: "Discount price cannot exceed price" },
  );

const cartItemSchema = z.object({
  foodItemId: objectId,
  quantity: z.coerce.number().int().min(1).max(20),
  specialInstructions: z.string().trim().max(300).optional(),
});

const orderSchema = z
  .object({
    restaurantId: objectId,
    items: z.array(cartItemSchema).min(1).max(30),
    deliveryAddress: addressSchema,
    paymentMethod: z.enum(["COD", "CARD", "UPI", "WALLET"]),
    specialInstructions: z.string().trim().max(500).optional(),
  })
  .superRefine((data, context) => {
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

const whatsappOrderNotificationSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  customerEmail: z.string().trim().toLowerCase().email(),
  phoneNumber,
  deliveryAddress: z.string().trim().min(5).max(500),
  location: z.string().trim().max(500).optional(),
  items: z.array(
    z.object({
      name: z.string().trim().min(2).max(120),
      quantity: z.coerce.number().int().min(1).max(20),
      unitPrice: z.coerce.number().finite().positive().max(1000000),
    }),
  ).min(1).max(30),
});

const updateOrderStatusSchema = z
  .object({
    status: z.enum([
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]),
    cancellationReason: z.string().trim().min(3).max(300).optional(),
  })
  .superRefine((data, context) => {
    if (data.status === "CANCELLED" && !data.cancellationReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cancellationReason"],
        message: "A cancellation reason is required",
      });
    }
  });

const idParamSchema = z.object({ id: objectId });
const restaurantIdParamSchema = z.object({ restaurantId: objectId });
const userIdParamSchema = z.object({ userId: objectId });
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});

const restaurantRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional(),
  contactPhone: phoneNumber.optional(),
  address: restaurantAddressSchema,
  logo: z.url().max(2048).nullable().optional(),
  coverImage: z.url().max(2048).nullable().optional(),
});

const updateRestaurantSchema = z
  .object({
    restaurantId: objectId,
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    contactPhone: phoneNumber.nullable().optional(),
    address: restaurantAddressSchema.optional(),
    logo: z.url().max(2048).nullable().optional(),
    coverImage: z.url().max(2048).nullable().optional(),
  })
  .refine((data) => Object.keys(data).some((key) => key !== "restaurantId"), {
    message: "Provide at least one field to update",
  });

const updateOperationalStatusSchema = z.object({
  operationalStatus: z.enum(Object.values(RESTAURANT_OPERATIONAL_STATUS)),
});

const listAdminRestaurantsSchema = z.object({
  approvalStatus: z.enum(Object.values(RESTAURANT_STATUS)).optional(),
});

const reviewRestaurantSchema = z
  .object({
    approvalStatus: z.enum([
      RESTAURANT_STATUS.approved,
      RESTAURANT_STATUS.rejected,
    ]),
    rejectionReason: z.string().trim().min(3).max(500).optional(),
  })
  .superRefine((data, context) => {
    if (
      data.approvalStatus === RESTAURANT_STATUS.rejected &&
      !data.rejectionReason
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "A rejection reason is required",
      });
    }
  });

const updateRestaurantSuspensionSchema = z
  .object({
    isSuspended: z.boolean(),
    reason: z.string().trim().min(3).max(500).optional(),
  })
  .superRefine((data, context) => {
    if (data.isSuspended && !data.reason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "A suspension reason is required",
      });
    }
  });

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().finite().positive().max(1000000),
  category: objectId,
  image: z.url().max(2048).nullable().optional(),
  imagePublicId: z.string().trim().max(255).nullable().optional(),
  images: z.array(z.object({
    url: z.url().max(2048),
    publicId: z.string().trim().min(1).max(255),
  })).max(8).optional(),
  foodType: z.enum(["VEG", "NON_VEG", "EGG"]).default("VEG"),
}).superRefine((data, context) => {
  if (data.imagePublicId && !data.image) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["image"],
      message: "A Cloudinary image ID requires its image URL",
    });
  }
});

const publicProductsQuerySchema = z.object({
  restaurantId: objectId.optional(),
  category: objectId.optional(),
});

const productAvailabilitySchema = z.object({
  restaurantId: objectId,
  isAvailable: z.boolean(),
});
const productImageSchema = z.object({
  image: z.url().max(2048).nullable(),
  imagePublicId: z.string().trim().max(255).nullable(),
});
const productImagesSchema = z.object({
  images: z.array(z.object({
    url: z.url().max(2048),
    publicId: z.string().trim().min(1).max(255),
  })).max(8),
});
const productIdParamSchema = z.object({ productId: objectId });
const restaurantProductParamsSchema = z.object({ restaurantId: objectId, productId: objectId });
const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().finite().positive().max(1000000).optional(),
  category: objectId.optional(),
  foodType: z.enum(["VEG", "NON_VEG", "EGG"]).optional(),
  isAvailable: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, "At least one product field is required");
const productReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});
const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
});

module.exports = {
  passwordSchema,
  addressSchema,
  restaurantAddressSchema,
  userSchema,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  contactEnquirySchema,
  updateProfileSchema,
  locationAnalyticsConsentSchema,
  customerLocationSchema,
  locationAnalyticsQuerySchema,
  updateUserSchema,
  restaurantSchema,
  foodItemSchema,
  cartItemSchema,
  orderSchema,
  whatsappOrderNotificationSchema,
  updateOrderStatusSchema,
  idParamSchema,
  restaurantIdParamSchema,
  userIdParamSchema,
  paginationSchema,
  restaurantRegistrationSchema,
  updateRestaurantSchema,
  updateOperationalStatusSchema,
  listAdminRestaurantsSchema,
  reviewRestaurantSchema,
  updateRestaurantSuspensionSchema,
  createProductSchema,
  publicProductsQuerySchema,
  productAvailabilitySchema,
  productImageSchema,
  productImagesSchema,
  productIdParamSchema,
  updateProductSchema,
  restaurantProductParamsSchema,
  productReviewSchema,
  createCategorySchema,
};
