require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user.model");
const { registerSchema } = require("../validations/schemas");
const { USER_ROLE, USER_STATUS } = require("../utils/constants");

const seedSuperAdmin = async () => {
  const { MONGODB_URI, DB_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } =
    process.env;

  if (!MONGODB_URI || !DB_NAME) {
    throw new Error("MONGODB_URI and DB_NAME are required");
  }

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required");
  }

  registerSchema.shape.password.parse(SUPER_ADMIN_PASSWORD);

  const email = SUPER_ADMIN_EMAIL.trim().toLowerCase();

  await mongoose.connect(
    `${MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`,
  );

  const existingUser = await User.findOne({ email }).select("+password");

  if (existingUser) {
    if (existingUser.roles.includes(USER_ROLE.superAdmin)) {
      console.log("Super admin account already exists. No changes made.");
      return;
    }

    if (!(await existingUser.isValidPassword(SUPER_ADMIN_PASSWORD))) {
      throw new Error(
        "The configured email belongs to an account with different credentials. No changes made.",
      );
    }

    if (
      existingUser.userStatus !== USER_STATUS.approved ||
      !existingUser.emailVerifiedAt
    ) {
      throw new Error(
        "The existing account must be approved and email-verified before promotion.",
      );
    }

    existingUser.roles = [
      ...new Set([...existingUser.roles, USER_ROLE.superAdmin]),
    ];
    await existingUser.save();
    console.log("Existing account promoted to super admin successfully.");
    return;
  }

  await User.create({
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email,
    password: SUPER_ADMIN_PASSWORD,
    roles: [USER_ROLE.superAdmin],
    userStatus: USER_STATUS.approved,
    emailVerifiedAt: new Date(),
  });

  console.log("Super admin created successfully.");
};

seedSuperAdmin()
  .catch((error) => {
    console.error("Super admin seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
