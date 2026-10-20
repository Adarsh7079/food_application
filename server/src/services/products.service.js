const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/ApiError");
const { PRODUCT_STATUS } = require("../utils/constants");

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
    status: PRODUCT_STATUS.draft,
    isAvailable: true,
  });

  return product;
};

module.exports = {
  createProduct,
};
