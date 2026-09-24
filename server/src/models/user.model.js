const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        // User can have multiple roles
        // Example:
        // ["customer"]
        // ["customer", "restaurant"]
        roles: {
            type: [
                {
                    type: String,
                    enum: [
                        USER_ROLE.customer,
                        USER_ROLE.admin,
                        USER_ROLE.delivery,
                        USER_ROLE.restaurant,
                    ],
                },
            ],
            default: [USER_ROLE.customer],
        },

        userStatus: {
            type: String,
            enum: [
                USER_STATUS.approved,
                USER_STATUS.pending,
                USER_STATUS.rejected,
                USER_STATUS.suspended,
            ],
            default: USER_STATUS.pending,
        },

        profileImage: {
            type: String,
            default: null,
        },

        address: {
            type: String,
            default: null,
        },

        phoneNumber: {
            type: String,
            default: null,
        },

        // Email verification
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

        // Hashed refresh token
        refreshToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// ========================================
// HASH PASSWORD
// ========================================

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
});

// ========================================
// CHECK PASSWORD
// ========================================

userSchema.methods.isValidPassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ========================================
// GENERATE ACCESS TOKEN
// ========================================

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this._id.toString(),
            roles: this.roles,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
        }
    );
};

// ========================================
// GENERATE REFRESH TOKEN
// ========================================

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            userId: this._id.toString(),
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        }
    );
};

const User = mongoose.model("User", userSchema);

module.exports = User;