// authRoutes.js

// initialize express router
const express = require("express");
const router = express.Router();

// import auth controller
var authController = require("../controllers/authController");

// auth routes
router.route("/login").post(authController.update);

router.route("/register").post(authController.new);

// export API routes
module.exports = router;
