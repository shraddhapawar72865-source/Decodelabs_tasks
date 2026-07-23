const express = require("express");
const controller = require("../controllers/contactController");

const router = express.Router();
router.route("/").get(controller.getContacts).post(controller.createContact);
router.route("/:id").get(controller.getContact).put(controller.updateContact).delete(controller.deleteContact);

module.exports = router;
