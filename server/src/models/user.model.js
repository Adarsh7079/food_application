const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email"],
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 72,
      select: false,
    },

    role: {
      type: String,
      enum: [
        USER_ROLE.customer,
        USER_ROLE.admin,
        USER_ROLE.delivery,
        USER_ROLE.restaurant,
      ],
      default: USER_ROLE.customer,
    },

    userStatus: {
      type: String,
      required: true,
      enum: {
        values: [
          USER_STATUS.approved,
          USER_STATUS.pending,
          USER_STATUS.rejected,
          USER_STATUS.suspended,
        ],
        message: "Invalid status for user given",
      },
      default: USER_STATUS.pending,
    },

    profileImage: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2048,
    },

    address: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },

    phoneNumber: {
      type: String,
      default: null,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, "Please fill a valid phone number"],
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // SHA-256 hash of refresh token
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// ================================
// HASH PASSWORD
// ================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

// ================================
// CHECK PASSWORD
// ================================

userSchema.methods.isValidPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ================================
// ACCESS TOKEN
// ================================

userSchema.methods.generateAccessToken = function () {
  return require("jsonwebtoken").sign(
    {
      userId: this._id.toString(),
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    },
  );
};

// ================================
// REFRESH TOKEN
// ================================

userSchema.methods.generateRefreshToken = function () {
  return require("jsonwebtoken").sign(
    {
      userId: this._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    },
  );
};

const User = mongoose.model("User", userSchema);

module.exports = User;
