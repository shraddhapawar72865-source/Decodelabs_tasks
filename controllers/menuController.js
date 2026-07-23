const Menu = require("../models/Menu");
const asyncHandler = require("../middleware/asyncHandler");

function badRequest(message, details) {
  const error = new Error(message);
  error.statusCode = 400;
  error.details = details;
  return error;
}

function pagination(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw badRequest("page must be at least 1 and limit must be between 1 and 100.");
  }
  return { page, limit, skip: (page - 1) * limit };
}

// Keeps the Project 2 frontend contract: the public identifier is `id`.
function serializeMenu(document) {
  const item = document.toObject ? document.toObject() : document;
  const { _id, __v, slug, ...menu } = item;
  return { id: slug, ...menu };
}

const getMenus = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const category = typeof req.query.category === "string" ? req.query.category.trim().toLowerCase() : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const filter = { isAvailable: true };
  if (category && category !== "all") filter.category = category;
  if (search) filter.$text = { $search: search };

  const [items, totalItems] = await Promise.all([
    Menu.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Menu.countDocuments(filter)
  ]);

  res.json({
    success: true,
    count: items.length,
    data: items.map(serializeMenu),
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    requestId: req.requestId
  });
});

const getMenu = asyncHandler(async (req, res) => {
  const item = await Menu.findOne({ slug: req.params.id.toLowerCase() });
  if (!item) return res.status(404).json({ success: false, error: { message: "Menu item not found." }, requestId: req.requestId });
  res.json({ success: true, data: serializeMenu(item), requestId: req.requestId });
});

const createMenu = asyncHandler(async (req, res) => {
  const item = await Menu.create(req.body);
  res.status(201).json({ success: true, message: "Menu item created.", data: serializeMenu(item), requestId: req.requestId });
});

const updateMenu = asyncHandler(async (req, res) => {
  const item = await Menu.findOneAndUpdate({ slug: req.params.id.toLowerCase() }, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, error: { message: "Menu item not found." }, requestId: req.requestId });
  res.json({ success: true, message: "Menu item updated.", data: serializeMenu(item), requestId: req.requestId });
});

const deleteMenu = asyncHandler(async (req, res) => {
  const item = await Menu.findOneAndDelete({ slug: req.params.id.toLowerCase() });
  if (!item) return res.status(404).json({ success: false, error: { message: "Menu item not found." }, requestId: req.requestId });
  res.status(204).send();
});

module.exports = { getMenus, getMenu, createMenu, updateMenu, deleteMenu, serializeMenu };
