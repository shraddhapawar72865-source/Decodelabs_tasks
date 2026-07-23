const Order = require("../models/Order");
const Menu = require("../models/Menu");
const asyncHandler = require("../middleware/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalMenuItems, revenue] = await Promise.all([
    Order.countDocuments(),
    Menu.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }])
  ]);
  res.json({ success: true, data: { totalOrders, totalRevenue: revenue[0]?.total || 0, totalMenuItems }, requestId: req.requestId });
});

module.exports = { getDashboard };
