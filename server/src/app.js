const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.route");
const adminRouter = require("./routes/admin.route");
const userRouter = require("./routes/user.route");
const restaurantRouter = require("./routes/restaurant.route");
const productRouter = require("./routes/product.route");
const orderRouter = require("./routes/order.route");
const sendApiError = require("./utils/sendApiError");

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(express.static("public"));

app.use(cookieParser());

// ================================
// ROUTES
// ================================

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1/orders", orderRouter);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  return sendApiError(res, error, `${req.method} ${req.originalUrl} failed`);
});

module.exports = app;
