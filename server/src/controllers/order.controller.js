const orderService = require("../services/order.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");
const { STATUS_CODES } = require("../utils/constants");

const placeOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.userId, req.validated.body);
    return res.status(STATUS_CODES.CREATED).json(new ApiResponse(STATUS_CODES.CREATED, order, "Order placed successfully"));
  } catch (error) { return sendApiError(res, error, "Order placement failed"); }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user.userId);
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) { return sendApiError(res, error, "Order history fetch failed"); }
};
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await orderService.getRestaurantOrders(req.params.restaurantId);
    return res.status(200).json(new ApiResponse(200, orders, "Restaurant orders fetched successfully"));
  } catch (error) { return sendApiError(res, error, "Restaurant orders fetch failed"); }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.validated.body;
    const order = await orderService.updateRestaurantOrder(req.params.restaurantId, req.params.orderId, status, cancellationReason);
    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
  } catch (error) { return sendApiError(res, error, "Order status update failed"); }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (error) { return sendApiError(res, error, "Platform orders fetch failed"); }
};
module.exports = { placeOrder, getMyOrders, getRestaurantOrders, updateOrderStatus, getAllOrders };
