const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Restaurant = require("../models/restaurant.model");
const ProductReview = require("../models/productReview.model");
const ApiError = require("../utils/ApiError");
const { PRODUCT_STATUS } = require("../utils/constants");
const { RESTAURANT_STATUS, RESTAURANT_OPERATIONAL_STATUS } = require("../utils/constants");

const createProduct = async (restaurantId, productData) => {
  const { name, description, price, category, image, foodType, discount } =
    productData;

  // 1. Verify that the category exists.
  const existingCategory = await Category.findById(category);

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  // 2. Create the product.
  const product = await Product.create({
    name,
    description,
    price,
    category,
    image,
    foodType,
    discount,
    restaurant: restaurantId,
    status: PRODUCT_STATUS.published,
    isAvailable: true,
  });

  return product;
};

const getPublicProducts = async ({ restaurantId, category } = {}) => {
  const restaurantFilter = {
    approvalStatus: RESTAURANT_STATUS.approved,
    operationalStatus: RESTAURANT_OPERATIONAL_STATUS.active,
  };
  if (restaurantId) restaurantFilter._id = restaurantId;
  const restaurants = await Restaurant.find(restaurantFilter).select("_id");
  const restaurantIds = restaurants.map((restaurant) => restaurant._id);
  const filter = {
    restaurant: { $in: restaurantIds },
    status: PRODUCT_STATUS.published,
    isAvailable: true,
  };
  if (category) filter.category = category;
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .populate("restaurant", "name slug")
    .sort({ createdAt: -1 });
  if (products.length === 0) return products;

  const ratings = await ProductReview.aggregate([
    { $match: { product: { $in: products.map((product) => product._id) } } },
    {
      $group: {
        _id: "$product",
        rating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);
  const ratingByProduct = new Map(
    ratings.map((rating) => [
      rating._id.toString(),
      {
        rating: Number(rating.rating.toFixed(1)),
        ratingCount: rating.ratingCount,
      },
    ]),
  );

  return products.map((product) => ({
    ...product.toObject(),
    ...ratingByProduct.get(product._id.toString()),
  }));
};

const getRestaurantProducts = async (restaurantId) =>
  Product.find({ restaurant: restaurantId })
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

const setProductAvailability = async (restaurantId, productId, isAvailable) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, restaurant: restaurantId },
    { $set: { isAvailable } },
    { new: true, runValidators: true },
  ).populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found for this restaurant");
  return product;
};

const getCategories = () => Category.find({ isActive: true }).sort({ name: 1 });

const createCategory = async (name) => {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    return await Category.create({ name, slug });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "Category already exists");
    throw error;
  }
};

module.exports = {
  createProduct,
  getPublicProducts,
  getRestaurantProducts,
  setProductAvailability,
  getCategories,
  createCategory,
};
