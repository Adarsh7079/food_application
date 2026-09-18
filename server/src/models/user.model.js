const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const userSchema = new mongoose.Schema({
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
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 72,
    },
    role: {
        type: String,
        enum: [USER_ROLE.customer, USER_ROLE.admin, USER_ROLE.delivery, USER_ROLE.restaurant],
        default: USER_ROLE.customer
    },
    userStatus: {
        type: String,
        required: true,
        enum: {
            values: [USER_STATUS.approved, USER_STATUS.pending, USER_STATUS.rejected, USER_STATUS.suspended],
            message: "Invalid status for user given"
        },
        default: USER_STATUS.pending
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
    }
}, {timestamps: true});

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.isValidPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
