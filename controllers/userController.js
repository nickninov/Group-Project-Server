// userController.js

// require models
const User = require("../models/userModel");
// const userValidation = require("./validation/userValidation.js");

// route to get user avatar info
exports.getUser = function(req, res) {
  User.findById(req.user.id, "firstName cart", {}).then(function(items) {
    const data = { firstName: items.firstName, cartAmount: items.cart.length };
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
  // check if request is valid
  // const { errors, isValid } = userValidation.updateAcc(req.body);
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

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
  User.findById(req.user.id, "cart", {})
    .populate("cart")
    .then(function(data) {
      res.send(data);
    });
};

// route to update user cart
exports.updateCart = function(req, res) {
  // check if request is valid
  // const { errors, isValid } = userValidation.updateCart(req.body);
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }
  User.findByIdAndUpdate(
    req.user.id,
    {
      cart: req.body.cart
    },
    { new: true, select: "cart" }
  )
    .populate("cart")
    .then(function(data) {
      res.send(data);
    });
};
