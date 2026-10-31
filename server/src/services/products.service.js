const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Restaurant = require("../models/restaurant.model");
const ProductReview = require("../models/productReview.model");
const ApiError = require("../utils/ApiError");
const cloudinaryService = require("./cloudinary.service");
const { PRODUCT_STATUS } = require("../utils/constants");
const { RESTAURANT_STATUS, RESTAURANT_OPERATIONAL_STATUS } = require("../utils/constants");

const productImageFolder = (userId, restaurantId) =>
  `food_application/users/${userId}/restaurants/${restaurantId}/products/`;

const validateProductImageId = (imagePublicId, userId, restaurantId) => {
  if (imagePublicId && !imagePublicId.startsWith(productImageFolder(userId, restaurantId))) {
    throw new ApiError(403, "The menu image does not belong to this restaurant owner.");
  }
};

const createProduct = async (restaurantId, productData, userId) => {
  const { name, description, price, category, image, imagePublicId, images = [], foodType, discount } =
    productData;

  validateProductImageId(imagePublicId, userId, restaurantId);
  images.forEach((item) => validateProductImageId(item.publicId, userId, restaurantId));
  const primaryImage = images[0] || (image ? { url: image, publicId: imagePublicId } : null);

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
    image: primaryImage?.url || null,
    imagePublicId: primaryImage?.publicId || null,
    images,
    foodType,
    discount,
    restaurant: restaurantId,
    status: PRODUCT_STATUS.published,
    isAvailable: true,
  });

  return product;
};

const setProductImage = async (restaurantId, userId, productId, imageData) => {
  validateProductImageId(imageData.imagePublicId, userId, restaurantId);
  const product = await Product.findOne({ _id: productId, restaurant: restaurantId });
  if (!product) throw new ApiError(404, "Product not found for this restaurant");

  const previousPublicId = product.imagePublicId;
  product.image = imageData.image;
  product.imagePublicId = imageData.imagePublicId;
  await product.save();

  if (previousPublicId && previousPublicId !== product.imagePublicId) {
    await cloudinaryService.deleteImage(previousPublicId);
  }
  return product;
};

const setProductImages = async (restaurantId, userId, productId, images) => {
  images.forEach((item) => validateProductImageId(item.publicId, userId, restaurantId));
  const product = await Product.findOne({ _id: productId, restaurant: restaurantId });
  if (!product) throw new ApiError(404, "Product not found for this restaurant");

  const previousPublicIds = new Set([...(product.images || []).map((item) => item.publicId), product.imagePublicId].filter(Boolean));
  const nextPublicIds = new Set(images.map((item) => item.publicId));
  product.images = images;
  product.image = images[0]?.url || null;
  product.imagePublicId = images[0]?.publicId || null;
  await product.save();

  await Promise.all([...previousPublicIds].filter((publicId) => !nextPublicIds.has(publicId)).map((publicId) => cloudinaryService.deleteImage(publicId)));
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

const updateAdminProduct = async (restaurantId, productId, updates) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new ApiError(404, "Restaurant not found");
  if (updates.category) {
    const category = await Category.findById(updates.category);
    if (!category) throw new ApiError(404, "Category not found");
  }
  const product = await Product.findOneAndUpdate(
    { _id: productId, restaurant: restaurantId },
    { $set: updates },
    { new: true, runValidators: true },
  ).populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found for this restaurant");
  return product;
};

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
  setProductImage,
  setProductImages,
  getPublicProducts,
  getRestaurantProducts,
  setProductAvailability,
  updateAdminProduct,
  getCategories,
  createCategory,
};
