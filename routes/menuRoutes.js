const express = require("express");
const controller = require("../controllers/menuController");

const router = express.Router();
router.route("/").get(controller.getMenus).post(controller.createMenu);
router.route("/:id").get(controller.getMenu).put(controller.updateMenu).delete(controller.deleteMenu);

module.exports = router;
