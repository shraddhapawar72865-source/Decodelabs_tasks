const mongoose = require("mongoose");
const Menu = require("../models/Menu");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

function requestError(message, details) {
  const error = new Error(message);
  error.statusCode = 400;
  error.details = details;
  return error;
}

function pageDetails(query) {
  const page = Number(query.page || 1); const limit = Number(query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw requestError("page must be at least 1 and limit must be between 1 and 100.");
  return { page, limit, skip: (page - 1) * limit };
}

async function prepareItems(items) {
  if (!Array.isArray(items) || !items.length) throw requestError("Please correct the order details.", ["items must contain at least one menu item."]);
  const ids = items.map((item) => typeof item.id === "string" ? item.id.toLowerCase() : "");
  const products = await Menu.find({ slug: { $in: ids }, isAvailable: true });
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  return items.map((item) => {
    const quantity = Number(item.quantity);
    const product = productsBySlug.get(typeof item.id === "string" ? item.id.toLowerCase() : "");
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw requestError("Each order item must use a valid menu id and a quantity from 1 to 10.");
    }
    return { menuItem: product._id, slug: product.slug, name: product.name, price: product.price, quantity, subtotal: product.price * quantity };
  });
}

function serializeOrder(document) {
  const order = document.toObject ? document.toObject() : document;
  const { _id, __v, orderNumber, items, ...details } = order;
  return { id: orderNumber, ...details, items: items.map(({ menuItem, slug, ...item }) => ({ id: slug, ...item })) };
}

async function findOrder(identifier) {
  const byNumber = await Order.findOne({ orderNumber: identifier });
  return byNumber || (mongoose.isValidObjectId(identifier) ? Order.findById(identifier) : null);
}

const createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail } = req.body;
  const details = [];
  if (typeof customerName !== "string" || customerName.trim().length < 2) details.push("customerName must contain at least 2 characters.");
  if (typeof customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) details.push("customerEmail must be a valid email address.");
  if (details.length) throw requestError("Please correct the order details.", details);

  const items = await prepareItems(req.body.items);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const order = await Order.create({ customerName, customerEmail, items, total });
  res.status(201).json({ success: true, message: "Order confirmed. Your kitchen has been notified.", data: serializeOrder(order), requestId: req.requestId });
});

const getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageDetails(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [orders, totalItems] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Order.countDocuments(filter)]);
  res.json({ success: true, count: orders.length, data: orders.map(serializeOrder), pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) }, requestId: req.requestId });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: { message: "Order not found." }, requestId: req.requestId });
  res.json({ success: true, data: serializeOrder(order), requestId: req.requestId });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: { message: "Order not found." }, requestId: req.requestId });
  if (req.body.items) { order.items = await prepareItems(req.body.items); order.total = order.items.reduce((sum, item) => sum + item.subtotal, 0); }
  ["customerName", "customerEmail", "status"].forEach((field) => { if (req.body[field] !== undefined) order[field] = req.body[field]; });
  await order.save();
  res.json({ success: true, message: "Order updated.", data: serializeOrder(order), requestId: req.requestId });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: { message: "Order not found." }, requestId: req.requestId });
  await order.deleteOne();
  res.status(204).send();
});

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder };
