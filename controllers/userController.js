// userController.js

// require models
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
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
      $set: { addresses: req.body.addresses }
    },
    { new: true, select: "firstName lastName email phone addresses" }
  ).then(function(data) {
    res.send(data);
  });
};

// route to get user cart
exports.getCart = function(req, res) {
  User.findById(req.user.id, "cart", {})
    .populate("cart", "images sku stock name description discount price")
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
      $set: { cart: req.body.cart }
    },
    { new: true, select: "cart" }
  )
    .populate({
      path: "cart",
      model: Product,
      select: "images sku stock name description discount price"
    })
    .then(function(data) {
      res.send(data);
    });
};

// route to get user orders
exports.getOrders = function(req, res) {
  Order.find(
    { user: req.user.id },
    "status shippingAddress billingAddress products date orderNo"
  )
    .populate({
      path: "products.product",
      model: Product,
      select: "quantity product images tags sku name description discount price"
    })
    .then(function(data) {
      res.send(data);
    });
};

// route to create user order
exports.createOrder = function(req, res) {
  // check if request is valid
  // const { errors, isValid } = userValidation.createOrder(req.body);
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }
  new Order({
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress,
    products: req.body.products,
    user: req.user.id
  })
    .save()
    .then(function(data) {
      res.send(data);
    });
};
