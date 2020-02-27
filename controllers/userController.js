// userController.js

// require models
const User = require("../models/userModel");
const Product = require("../models/productModel");

// route to get user avatar info
exports.getUser = function(req, res) {
  User.findById(req.user.id, "firstName cart", {}).then(function(items) {
    const data = { firstName: items.firstName, cart: items.cart.length };
    res.send(data);
  });
};

// route to get user account info
exports.getAcc = function(req, res) {
  User.findById(
    req.user.id,
    "firstName lastName email phone addresses",
    {}
  ).then(function(data) {
    res.send(data);
  });
};

// route to update user account info
exports.updateAcc = function(req, res) {
  User.findByIdAndUpdate(
    req.user.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      addresses: req.body.addresses
    },
    { new: true, select: "firstName lastName email phone addresses" }
  ).then(function(data) {
    res.send(data);
  });
};

// route to get user cart
exports.getCart = function(req, res) {
  User.findById(req.user.id, "cart", {}).then(function(data) {
    res.send(data);
  });
};

// route to update user cart
exports.updateCart = function(req, res) {
  User.findByIdAndUpdate(
    req.user.id,
    {
      cart: req.body.cart
    },
    { new: true, select: "cart" }
  ).then(function(data) {
    res.send(data);
  });
};
