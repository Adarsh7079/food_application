const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Restaurant = require("../models/restaurant.model");
const ApiError = require("../utils/ApiError");
const { RESTAURANT_STATUS, RESTAURANT_OPERATIONAL_STATUS, PRODUCT_STATUS } = require("../utils/constants");

const createOrder = async (customerId, payload) => {
  if (payload.paymentMethod !== "COD") throw new ApiError(400, "Only cash on delivery is currently available");
  const restaurant = await Restaurant.findOne({
    _id: payload.restaurantId,
    approvalStatus: RESTAURANT_STATUS.approved,
    operationalStatus: RESTAURANT_OPERATIONAL_STATUS.active,
  });
  if (!restaurant) throw new ApiError(400, "This restaurant is not accepting orders");

  const ids = payload.items.map((item) => item.foodItemId);
  const products = await Product.find({
    _id: { $in: ids },
    restaurant: restaurant._id,
    status: PRODUCT_STATUS.published,
    isAvailable: true,
  });
  if (products.length !== ids.length) throw new ApiError(400, "One or more items are unavailable");

  const productMap = new Map(products.map((product) => [product._id.toString().toLowerCase(), product]));
  const items = payload.items.map((item) => {
    const product = productMap.get(item.foodItemId.toLowerCase());
    return {
      foodItem: product._id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || "",
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = subtotal >= 499 ? Math.round(subtotal * 0.25) : 0;
  const deliveryFee = subtotal === 0 || discount > 0 ? 0 : 40;
  const order = await Order.create({
    customer: customerId,
    restaurant: restaurant._id,
    items,
    deliveryAddress: payload.deliveryAddress,
    paymentMethod: "COD",
    subtotal,
    discount,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
  });
  return order.populate("restaurant", "name slug");
};

const getCustomerOrders = (customerId) => Order.find({ customer: customerId }).populate("restaurant", "name slug").sort({ createdAt: -1 });
const getRestaurantOrders = (restaurantId) => Order.find({ restaurant: restaurantId }).populate("customer", "name phoneNumber email").sort({ createdAt: -1 });
const getAllOrders = () => Order.find().populate("restaurant", "name slug").populate("customer", "name email").sort({ createdAt: -1 }).limit(200);

const updateRestaurantOrder = async (restaurantId, orderId, status, cancellationReason) => {
  const order = await Order.findOne({ _id: orderId, restaurant: restaurantId });
  if (!order) throw new ApiError(404, "Order not found");
  order.status = status;
  order.cancellationReason = status === "CANCELLED" ? cancellationReason : null;
  await order.save();
  return order.populate("customer", "name phoneNumber email");
};

module.exports = { createOrder, getCustomerOrders, getRestaurantOrders, getAllOrders, updateRestaurantOrder };
