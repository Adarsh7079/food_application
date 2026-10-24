const mongoose = require("mongoose");

const {
  RESTAURANT_STATUS,
  RESTAURANT_OPERATIONAL_STATUS,
} = require("../utils/constants");

const restaurantSchema = new mongoose.Schema(
  {
    restaurantNumber: {
      type: Number,
      unique: true,
      sparse: true,
      immutable: true,
    },

    // Basic restaurant information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Restaurant owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Contact information
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 12,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
      },
    },

    // Restaurant images
    logo: {
      type: String,
      default: null,
    },

    coverImage: {
      type: String,
      default: null,
    },

    // Super admin approval
    approvalStatus: {
      type: String,
      enum: Object.values(RESTAURANT_STATUS),
      default: RESTAURANT_STATUS.pending,
      index: true,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    // Whether the restaurant is accepting orders
    operationalStatus: {
      type: String,
      enum: Object.values(RESTAURANT_OPERATIONAL_STATUS),
      default: RESTAURANT_OPERATIONAL_STATUS.inactive,
      index: true,
    },
    suspensionReason: {
      type: String,
      default: null,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: require("mongoose").Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Useful for finding approved restaurants that are active.
restaurantSchema.index({
  approvalStatus: 1,
  operationalStatus: 1,
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
