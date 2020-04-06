// adminRoutes.js

// initialize express router
const express = require("express");
const router = express.Router();

// import user controller
var adminController = require("../controllers/adminController");

// Admin dashboard routes
router.route("/users").get(adminController.getUsers);
router.route("/products").get(adminController.getProducts);
router.route("/order").put(adminController.updateOrderStatus);
router.route("/orders").get(adminController.getOrders);

// export API routes
module.exports = router;
