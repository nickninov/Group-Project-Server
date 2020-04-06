// adminController.js

// require validation
const adminValidation = require("./validation/adminValidation.js");

// require models
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// get all users route
exports.getUsers = function (req, res) {
  User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        users: {
          $push: {
            _id: "$_id",
            email: "$email",
            firstName: "$firstName",
            lastName: "$lastName",
            phone: "$phone",
            addresses: "$addresses",
            registeredOn: "$date",
          },
        },
      },
    },
  ]).then(function (data) {
    if (data[0]) {
      delete data[0]._id;
      res.send(data[0]);
    } else {
      res.send({});
    }
  });
};

// get all products route
exports.getProducts = function (req, res) {
  Product.aggregate([
    // {
    //   $lookup: {
    //     from: "categories",
    //     localField: "categories",
    //     foreignField: "_id",
    //     as: "categories",
    //   },
    // },
    // { $unwind: "$categories" },
    {
      $project: {
        _id: 1,
        sku: 1,
        shippingDetails: 1,
        stock: 1,
        images: 1,
        name: 1,
        description: 1,
        ratings: 1,
        tags: 1,
        // "categories._id": "$categories._id",
        // "categories.name": "$categories.name",
        // "categories.description": "$categories.description",
        // "categories.image": "$categories.image",
        discount: 1,
        price: 1,
        date: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        products: {
          $push: {
            _id: "$_id",
            sku: "$sku",
            shippingDetails: "$shippingDetails",
            stock: "$stock",
            images: "$images",
            name: "$name",
            description: "$description",
            rating: {
              stars: {
                $cond: [
                  { $eq: ["$ratings", []] },
                  0,
                  { $avg: "$ratings.rating" },
                ],
              },
              ratedBy: { $size: "$ratings" },
            },
            tags: "$tags",
            // categories: "$categories",
            discount: "$discount",
            price: "$price",
            createdOn: "$date",
          },
        },
      },
    },
  ]).then(function (data) {
    if (data[0]) {
      delete data[0]._id;
      res.send(data[0]);
    } else {
      res.send({});
    }
  });
};

// update order status route
exports.updateOrderStatus = async function (req, res) {
  // check if request is valid
  const { errors, isValid } = await adminValidation.updateOrderStatus(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  await Order.findByIdAndUpdate(req.body.order, {
    status: req.body.status,
  });
  res.send({ _id: req.body.order, status: req.body.status });
};

// get all orders (with totals) route
exports.getOrders = function (req, res) {
  Order.aggregate([
    { $match: { date: { $gt: new Date(Date.now() - 86400 * 1000) } } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.product._id",
        foreignField: "_id",
        as: "products.product",
      },
    },
    { $unwind: "$products.product" },
    {
      $project: {
        _id: 1,
        status: 1,
        "user._id": 1,
        "user.firstName": 1,
        "user.lastName": 1,
        "user.email": 1,
        "user.phone": 1,
        shippingAddress: 1,
        billingAddress: 1,
        isGift: 1,
        deliveryType: 1,
        date: 1,
        "products.quantity": 1,
        "products.product.sku": 1,
        "products.product.stock": 1,
        "products.product.name": 1,
        "products.product.discount": 1,
        "products.product.price": 1,
        "products.subTotal": {
          $multiply: [
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: [100, "$products.product.discount"] },
                    100,
                  ],
                },
                "$products.product.price",
              ],
            },
            "$products.quantity",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        status: { $first: "$status" },
        user: { $first: "$user" },
        shippingAddress: { $first: "$shippingAddress" },
        billingAddress: { $first: "$billingAddress" },
        isGift: { $first: "$isGift" },
        deliveryType: { $first: "$deliveryType" },
        date: { $first: "$date" },
        products: { $push: "$products" },
        total: { $sum: "$products.subTotal" },
      },
    },
    // remove to return orders without internal grouping
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalOrders: { $sum: 1 },
        orders: {
          $push: {
            _id: "$_id",
            status: "$status",
            user: "$user",
            shippingAddress: "$shippingAddress",
            billingAddress: "$billingAddress",
            isGift: "$isGift",
            deliveryType: "$deliveryType",
            orderedOn: "$date",
            products: "$products",
            total: "$total",
          },
        },
      },
    },
  ]).then(function (data) {
    if (data[0]) {
      delete data[0]._id;
      res.send(data[0]);
    } else {
      res.send({});
    }
  });
};
