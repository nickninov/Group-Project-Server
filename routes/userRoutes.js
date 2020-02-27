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
router.route("/cart").post(userController.getCart);

router.route("/cart").put(userController.updateCart);

// export API routes
module.exports = router;
