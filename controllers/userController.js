// userController.js

const mongoose = require("mongoose");

// require models
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const userValidation = require("./validation/userValidation.js");

// route to get user avatar info
exports.getUser = function(req, res) {
  // return total of product quantities
  // *TODO* Cart length should equal individual items
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
  const { errors, isValid } = userValidation.updateAcc(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

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
  User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user.id)
      }
    },
    { $unwind: "$cart" },
    {
      $lookup: {
        from: "products",
        localField: "cart.product",
        foreignField: "_id",
        as: "cart.product"
      }
    },
    { $unwind: "$cart.product" },
    {
      $project: {
        _id: 1,
        "cart.quantity": 1,
        "cart.product.images": 1,
        "cart.product.sku": 1,
        "cart.product.stock": 1,
        "cart.product.name": 1,
        "cart.product.description": 1,
        "cart.product.discount": 1,
        "cart.product.price": 1,
        "cart.subTotal": {
          $multiply: [
            {
              $multiply: [
                {
                  $divide: [{ $subtract: [100, "$cart.product.discount"] }, 100]
                },
                "$cart.product.price"
              ]
            },
            "$cart.quantity"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        cart: { $push: "$cart" },
        total: { $sum: "$cart.subTotal" }
      }
    }
  ]).then(function(data) {
    res.send(data[0] != null ? data[0] : {});
  });
};

// route to update user cart
exports.updateCart = async function(req, res) {
  // check if request is valid
  const { errors, isValid } = await userValidation.updateCart(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // *TODO* merge identical products
  User.findByIdAndUpdate(req.user.id, {
    $set: { cart: req.body.cart }
  }).then(function() {
    User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.user.id)
        }
      },
      { $unwind: "$cart" },
      {
        $lookup: {
          from: "products",
          localField: "cart.product",
          foreignField: "_id",
          as: "cart.product"
        }
      },
      { $unwind: "$cart.product" },
      {
        $project: {
          _id: 1,
          "cart.quantity": 1,
          "cart.product.images": 1,
          "cart.product.sku": 1,
          "cart.product.stock": 1,
          "cart.product.name": 1,
          "cart.product.description": 1,
          "cart.product.discount": 1,
          "cart.product.price": 1,
          "cart.subTotal": {
            $multiply: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: [100, "$cart.product.discount"] },
                      100
                    ]
                  },
                  "$cart.product.price"
                ]
              },
              "$cart.quantity"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          cart: { $push: "$cart" },
          total: { $sum: "$cart.subTotal" }
        }
      }
    ]).then(function(data) {
      res.send(data[0]);
    });
  });
};

// route to get user orders
exports.getOrders = function(req, res) {
  Order.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user.id)
      }
    },
    { $unwind: "$products" },
    {
      $project: {
        _id: 1,
        orderNo: 1,
        status: 1,
        shippingAddress: 1,
        billingAddress: 1,
        isGift: 1,
        deliveryType: 1,
        date: 1,
        "products.quantity": 1,
        "products.product.images": 1,
        "products.product.sku": 1,
        "products.product.stock": 1,
        "products.product.name": 1,
        "products.product.description": 1,
        "products.product.discount": 1,
        "products.product.price": 1,
        "products.subTotal": {
          $multiply: [
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: [100, "$products.product.discount"] },
                    100
                  ]
                },
                "$products.product.price"
              ]
            },
            "$products.quantity"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        orderNo: { $first: "$orderNo" },
        status: { $first: "$status" },
        shippingAddress: { $first: "$shippingAddress" },
        billingAddress: { $first: "$billingAddress" },
        isGift: { $first: "$isGift" },
        deliveryType: { $first: "$deliveryType" },
        date: { $first: "$date" },
        products: { $push: "$products" },
        total: { $sum: "$products.subTotal" }
      }
    }
  ]).then(function(data) {
    res.send(data);
  });
};

// route to create user order
exports.createOrder = function(req, res) {
  // check if request is valid
  const { errors, isValid } = userValidation.createOrder(
    req.body,
    req.user.cart,
    req.user.addresses
  );
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // *TODO* depleat stock transaction
  new Order({
    shippingAddress: req.user.addresses.find(
      address => String(address._id) === req.body.shippingAddress
    ),
    billingAddress: req.user.addresses.find(
      address => String(address._id) === req.body.billingAddress
    ),
    products: req.user.cart,
    user: req.user.id,
    isGift: req.body.isGift,
    deliveryType: req.body.deliveryType
  })
    .save()
    .then(function(data) {
      User.findByIdAndUpdate(req.user.id, {
        $set: { cart: [] }
      }).then(function() {
        Order.aggregate([
          {
            $match: {
              user: mongoose.Types.ObjectId(req.user.id),
              _id: data._id
            }
          },
          { $unwind: "$products" },
          {
            $project: {
              _id: 1,
              orderNo: 1,
              status: 1,
              shippingAddress: 1,
              billingAddress: 1,
              isGift: 1,
              deliveryType: 1,
              date: 1,
              "products.quantity": 1,
              "products.product.images": 1,
              "products.product.sku": 1,
              "products.product.stock": 1,
              "products.product.name": 1,
              "products.product.description": 1,
              "products.product.discount": 1,
              "products.product.price": 1,
              "products.subTotal": {
                $multiply: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: [100, "$products.product.discount"] },
                          100
                        ]
                      },
                      "$products.product.price"
                    ]
                  },
                  "$products.quantity"
                ]
              }
            }
          },
          {
            $group: {
              _id: "$_id",
              orderNo: { $first: "$orderNo" },
              status: { $first: "$status" },
              shippingAddress: { $first: "$shippingAddress" },
              billingAddress: { $first: "$billingAddress" },
              isGift: { $first: "$isGift" },
              deliveryType: { $first: "$deliveryType" },
              date: { $first: "$date" },
              products: { $push: "$products" },
              total: { $sum: "$products.subTotal" }
            }
          }
        ]).then(function(data) {
          res.send(data[0]);
        });
      });
    });
};
