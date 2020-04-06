// searchController.js

const mongoose = require("mongoose");

// require models
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

// route to get
exports.getAllCategories = function (req, res) {
  Category.find({}, "name description image").then(function (data) {
    res.send(data);
  });
};

// route to get
exports.getCategory = function (req, res) {
  Category.findById(req.params.id, "name description image", {})
    .populate({
      path: "products",
      model: Product,
      select:
        "shippingDetails images tags sku stock name description discount price",
    })
    .then(function (data) {
      res.send(data);
    });
};

// route to get
exports.getAllProducts = function (req, res) {
  Product.find(
    {},
    "shippingDetails images tags categories sku stock name description discount price"
  )
    .populate({ path: "categories", model: Category, select: "name" })
    .then(function (data) {
      res.send(data);
    });
};

// route to get
exports.getProduct = function (req, res) {
  objectId = mongoose.Types.ObjectId.isValid(req.params.param)
    ? mongoose.Types.ObjectId(req.params.param)
    : null;
  Product.aggregate([
    {
      $match: {
        $or: [
          { _id: objectId },
          { sku: req.params.param },
          { name: { $regex: req.params.param, $options: "i" } },
        ],
      },
    },
    {
      $project: {
        shippingDetails: 1,
        images: 1,
        tags: 1,
        categories: 1,
        sku: 1,
        name: 1,
        description: 1,
        discount: 1,
        price: 1,
        rating: {
          stars: {
            $cond: [
              { $eq: ["$ratings", []] }, // if
              0, // then
              { $avg: "$ratings.rating" }, // else
            ],
          },
          ratedBy: { $size: "$ratings" },
        },
      },
    },
  ]).then(function (data) {
    res.send(data);
  });
};
