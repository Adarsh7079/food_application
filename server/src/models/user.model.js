const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { USER_ROLE, USER_STATUS } = require("../utils/constants");
const { userSchema: userInputSchema } = require("../validations/schemas");

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
    }
}, {timestamps: true});

// Zod normalizes input (for example, email casing) and provides consistent
// validation messages before Mongoose writes the document to the database.
userSchema.pre("validate", function () {
    const input = {
        name: this.name,
        email: this.email,
        phoneNumber: this.phoneNumber || undefined,
        address: this.address || undefined,
        profileImage: this.profileImage,
        role: this.role,
        userStatus: this.userStatus,
    };

    if (this.isModified("password")) {
        input.password = this.password;
    }

    const schema = this.isModified("password")
        ? userInputSchema
        : userInputSchema.partial({ password: true });
    const result = schema.safeParse(input);

    if (!result.success) {
        for (const issue of result.error.issues) {
            this.invalidate(issue.path.join(".") || "user", issue.message);
        }
        return;
    }

    Object.assign(this, result.data);
});

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.isValidPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
