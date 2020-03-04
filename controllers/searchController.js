// searchController.js

const mongoose = require("mongoose");

// require models
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

// route to get
exports.getAllCategories = function(req, res) {
  Category.find({}, "name description image").then(function(data) {
    res.send(data);
  });
};

// route to get
exports.getCategory = function(req, res) {
  Category.findById(req.params.id, "name description image", {})
    .populate({
      path: "products",
      model: Product,
      select:
        "shippingDetails images tags sku stock name description discount price"
    })
    .then(function(data) {
      res.send(data);
    });
};

// route to get
exports.getAllProducts = function(req, res) {
  Product.find(
    {},
    "shippingDetails images tags categories sku stock name description discount price"
  )
    .populate({ path: "categories", model: Category, select: "name" })
    .then(function(data) {
      res.send(data);
    });
};

// route to get
exports.getProduct = function(req, res) {
  objectId = mongoose.Types.ObjectId.isValid(req.params.param)
    ? req.params.param
    : null;
  Product.find({
    $or: [
      { _id: objectId },
      { sku: req.params.param },
      { name: { $regex: req.params.param, $options: "i" } }
    ]
  }, "shippingDetails images tags categories sku stock name description discount price")
  .populate({ path: "categories", model: Category, select: "name" })
  .then(function(data) {
    res.send(data);
  });
};
