const mongoose = require("mongoose");

const { PRODUCT_STATUS } = require("../utils/constants");

// ========================================
// DISCOUNT SCHEMA
// ========================================

const discountSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      default: "PERCENTAGE",
    },

    value: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

// ========================================
// PRODUCT SCHEMA
// ========================================

const productSchema = new mongoose.Schema(
  {
    // Product name
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Product description
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Original price in INR
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // Restaurant that owns this product
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // Global food category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // Product image URL
    image: {
      type: String,
      default: null,
    },

    // Product publication status
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.draft,
      index: true,
    },

    // Whether the restaurant is currently offering this item
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Food classification
    foodType: {
      type: String,
      enum: ["VEG", "NON_VEG", "EGG"],
      default: "VEG",
    },

    // Product-level discount
    discount: {
      type: discountSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

// ========================================
// INDEXES
// ========================================

// Retrieve products belonging to a restaurant.
productSchema.index({
  restaurant: 1,
  status: 1,
  isAvailable: 1,
});

// Retrieve published products by category.
productSchema.index({
  category: 1,
  status: 1,
  isAvailable: 1,
});

// ========================================
// MODEL
// ========================================

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
