const productService = require("../services/products.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

const listPublicProducts = async (req, res) => {
  try {
    const products = await productService.getPublicProducts(req.validated.query);
    return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
  } catch (error) {
    return sendApiError(res, error, "Product listing failed");
  }
};

const listCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
  } catch (error) {
    return sendApiError(res, error, "Category listing failed");
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await productService.createCategory(req.validated.body.name);
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
  } catch (error) { return sendApiError(res, error, "Category creation failed"); }
};

const listRestaurantProducts = async (req, res) => {
  try {
    const products = await productService.getRestaurantProducts(req.params.restaurantId);
    return res.status(200).json(new ApiResponse(200, products, "Restaurant products fetched successfully"));
  } catch (error) {
    return sendApiError(res, error, "Restaurant product listing failed");
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.params.restaurantId, req.validated.body);
    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    return sendApiError(res, error, "Product creation failed");
  }
};

const updateProductAvailability = async (req, res) => {
  try {
    const product = await productService.setProductAvailability(
      req.restaurant._id,
      req.params.productId,
      req.validated.body.isAvailable,
    );
    return res.status(200).json(new ApiResponse(200, product, "Product availability updated"));
  } catch (error) {
    return sendApiError(res, error, "Product availability update failed");
  }
};

module.exports = { listPublicProducts, listCategories, createCategory, listRestaurantProducts, createProduct, updateProductAvailability };
