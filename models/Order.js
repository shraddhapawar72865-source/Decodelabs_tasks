const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    subtotal: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, default: () => `TB-${randomUUID().slice(0, 8).toUpperCase()}` },
    customerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    customerEmail: { type: String, required: true, trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."] },
    items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "An order needs at least one item."] },
    total: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"], default: "confirmed", index: true }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
