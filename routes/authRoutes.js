// authRoutes.js

// Initialize express router
const express = require("express");
const router = express.Router();

// Import auth controller
var authController = require('../controller/authController');

// Auth routes
router.route('/login')
    .post(authController.update);

router.route('/register')
    .post(authController.new);

// Export API routes
module.exports = router;
