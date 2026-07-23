const express = require("express");
const router = express.Router();

const menuData = require("../data/menu.json");

router.get("/", (req, res) => {
    res.json(menuData);
});

module.exports = router;