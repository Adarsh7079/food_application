const Product = require("../models/product.model");
const ProductReview = require("../models/productReview.model");
const ApiError = require("../utils/ApiError");
const { PRODUCT_STATUS } = require("../utils/constants");

const getProductReviews = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    status: PRODUCT_STATUS.published,
  }).select("_id");

  if (!product) throw new ApiError(404, "Product not found");

  const reviews = await ProductReview.find({ product: productId })
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    reviews: reviews.map(({ _id, customer, rating, comment, createdAt }) => ({
      _id,
      customerName: customer?.name || "Customer",
      rating,
      comment,
      createdAt,
    })),
  };
};

const getMyProductReview = async (productId, customerId) => {
  const product = await Product.findOne({
    _id: productId,
    status: PRODUCT_STATUS.published,
  }).select("_id");

  if (!product) throw new ApiError(404, "Product not found");

  const review = await ProductReview.findOne({
    product: productId,
    customer: customerId,
  }).lean();
  return review
    ? { _id: review._id, rating: review.rating, comment: review.comment }
    : null;
};

const submitProductReview = async (productId, customerId, { rating, comment }) => {
  const product = await Product.findOne({
    _id: productId,
    status: PRODUCT_STATUS.published,
    isAvailable: true,
  }).select("_id");

  if (!product) throw new ApiError(404, "Product not found or unavailable");

  let review;
  try {
    review = await ProductReview.findOneAndUpdate(
      { product: productId, customer: customerId },
      { $set: { rating, comment: comment || "" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    review = await ProductReview.findOneAndUpdate(
      { product: productId, customer: customerId },
      { $set: { rating, comment: comment || "" } },
      { new: true, runValidators: true },
    );
  }

  const [summary] = await ProductReview.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: "$product",
        rating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return {
    review: {
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    },
    rating: Number(summary.rating.toFixed(1)),
    ratingCount: summary.ratingCount,
  };
};

module.exports = { getProductReviews, getMyProductReview, submitProductReview };
