const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, default: null },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String, default: "" },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  deliveryAddress: { type: mongoose.Schema.Types.Mixed, required: true },
  paymentMethod: { type: String, enum: ["COD"], default: "COD" },
  paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
  status: { type: String, enum: ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"], default: "PLACED", index: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  cancellationReason: { type: String, default: null },
}, { timestamps: true });

orderSchema.index({ restaurant: 1, createdAt: -1 });
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
