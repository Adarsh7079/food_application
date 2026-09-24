const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    cuisineTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    openingTime: {
      type: String,
      default: null,
    },

    closingTime: {
      type: String,
      default: null,
    },

    isOpen: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
