// userRoutes.js

// initialize express router
const express = require("express");
const router = express.Router();

// import user controller
var userController = require("../controllers/userController");

// user account routes
router.route("/").get(userController.getUser);
router.route("/account").get(userController.getAcc);
router.route("/account").put(userController.updateAcc);

// user cart routes
router.route("/cart").get(userController.getCart);
router.route("/cart").put(userController.updateCart);

// user order routes
router.route("/order").get(userController.getOrders);
router.route("/order").post(userController.createOrder);

// user product review routes
router.route("/rate").put(userController.rateProduct);

// export API routes
module.exports = router;
