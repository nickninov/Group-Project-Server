// userController.js

// require validation
const userValidation = require("./validation/userValidation.js");

// require models
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

function roundNum(num) {
  return Number(Math.round(num + "e2") + "e-2");
}

// function calcTotals() {}

// route to get user avatar info
exports.getUser = function (req, res) {
  // return total of product quantities
  User.findById(req.user.id, "firstName cart", {}).then(function (items) {
    const data = { firstName: items.firstName, cartAmount: items.cart.length };
    res.send(data);
  });
};

// route to get user account info
exports.getAcc = function (req, res) {
  User.findById(
    req.user.id,
    "firstName lastName email phone addresses",
    {}
  ).then(function (data) {
    res.send(data);
  });
};

// route to update user account info
exports.updateAcc = function (req, res) {
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
      $set: { addresses: req.body.addresses },
    },
    { new: true, select: "firstName lastName email phone addresses" }
  ).then(function (data) {
    res.send(data);
  });
};

// route to get user cart
exports.getCart = function (req, res) {
  User.findById(req.user.id, "cart", {})
    .populate(
      "cart.product",
      "images sku stock name description discount price"
    )
    .lean()
    .then(function (data) {
      let total = 0;
      data.cart.forEach(function (item) {
        item.subTotal = roundNum(
          item.quantity *
            (((100 - item.product.discount) / 100) * item.product.price)
        );
        total += item.subTotal;
      });
      data.total = total;
      res.send(data);
    });
};

// route to update user cart
exports.updateCart = async function (req, res) {
  // check if request is valid
  const { errors, isValid } = await userValidation.updateCart(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // Merge identical products
  var map = req.body.cart.reduce(function (map, e) {
    map[e.product] = +e.quantity + (map[e.product] || 0);
    return map;
  }, {});
  let cart = Object.keys(map).map(function (k) {
    return { product: k, quantity: map[k] };
  });

  // Update cart and return
  User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { cart: cart },
    },
    { new: true, select: "cart" }
  )
    .populate({
      path: "cart.product",
      model: Product,
      select: "images sku stock name description discount price",
    })
    .lean()
    .then(function (data) {
      // Add subtotal/totals to cart
      let total = 0;
      data.cart.forEach(function (item) {
        item.subTotal = roundNum(
          item.quantity *
            (((100 - item.product.discount) / 100) * item.product.price)
        );
        total += item.subTotal;
      });
      data.total = total;
      res.send(data);
    });
};

// route to get user orders
exports.getOrders = function (req, res) {
  Order.find(
    { user: req.user.id },
    "orderNo deliveryType isGift status shippingAddress billingAddress products date user"
  )
    .populate({
      path: "products.product.rating",
      select: { ratings: { $elemMatch: { user: req.user.id } } },
    })
    .lean()
    .then(function (data) {
      data.forEach(function (order) {
        let total = 0;
        order.products.forEach(function (item) {
          if (item.product.rating.ratings) {
            item.product.rating = item.product.rating.ratings[0].rating;
          } else {
            item.product.rating = 0;
          }
          item.subTotal = roundNum(
            item.quantity *
              (((100 - item.product.discount) / 100) * item.product.price)
          );
          total += item.subTotal;
        });
        order.total = total;
      });
      res.send(data);
    });
};

// route to create user order
exports.createOrder = function (req, res) {
  // check if request is valid
  const { errors, isValid } = userValidation.createOrder(
    req.body,
    req.user.cart,
    req.user.addresses
  );
  if (!isValid) {
    return res.status(400).json(errors);
  }

  new Order({
    shippingAddress: req.user.addresses.find(
      (address) => String(address._id) === req.body.shippingAddress
    ),
    billingAddress: req.user.addresses.find(
      (address) => String(address._id) === req.body.billingAddress
    ),
    products: req.user.cart,
    user: req.user.id,
    isGift: req.body.isGift,
    deliveryType: req.body.deliveryType,
  })
    .save()
    .then(async function (data) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { cart: [] },
      });
      let total = 0;
      data = data.toObject();
      data.products.forEach(async function (item) {
        item.subTotal = roundNum(
          item.quantity *
            (((100 - item.product.discount) / 100) * item.product.price)
        );
        total += item.subTotal;
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      });
      data.total = total;
      res.send(data);
    });
};

// route to rate purchased product
exports.rateProduct = async function (req, res) {
  // check if request is valid
  const { errors, isValid } = await userValidation.rateProduct(
    req.body,
    req.user.id
  );
  if (!isValid) {
    return res.status(400).json(errors);
  }

  await Product.findByIdAndUpdate(req.body.product, {
    $push: { ratings: { rating: req.body.rating, user: req.user.id } },
  });
  res.send({ _id: req.body.product, rating: req.body.rating });
};
