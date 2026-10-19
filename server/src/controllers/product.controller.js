const productService = require("../services/product.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

const createProduct = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const product = await productService.createProduct(
      restaurantId,
      req.validated.body,
    );

    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    return sendApiError(res, error, "Product creation failed");
  }
};

module.exports = {
  createProduct,
};
