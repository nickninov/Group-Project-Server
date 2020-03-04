// searchRoutes.js

// initialize express router
const express = require("express");
const router = express.Router();

// import user controller
var searchController = require("../controllers/searchController");

// category search routes
router.route("/category").get(searchController.getAllCategories);
router.route("/category/:id").get(searchController.getCategory);

// product search routes
router.route("/product").get(searchController.getAllProducts);
router.route("/product/:param").get(searchController.getProduct);

// export API routes
module.exports = router;
