const express = require("express");
const controller = require("../controllers/orderController");

const router = express.Router();
router.route("/").get(controller.getOrders).post(controller.createOrder);
router.route("/:id").get(controller.getOrder).put(controller.updateOrder).delete(controller.deleteOrder);

module.exports = router;
