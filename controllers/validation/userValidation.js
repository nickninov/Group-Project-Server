// userValidation.js

// require libaries and files
const Validator = require("validator");
const isEmpty = require("./common/isEmpty");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const mongoose = require("mongoose");

exports.updateAcc = function (data) {
  let errors = {};
  let addresses = [];

  // convert empty fields to empty strings to use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.addresses = !isEmpty(data.addresses) ? data.addresses : [];

  // email validation
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // first name validation
  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First Name is required";
  }
  // last name validation
  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name is required";
  }
  // phone validation
  if (Validator.isEmpty(data.phone)) {
    errors.phone = "Phone number is required";
  } else if (!Validator.isMobilePhone(data.phone, ["en-GB"])) {
    errors.phone = "Phone number is invalid";
  }

  // addresses validation
  data.addresses.forEach((address) => {
    let error = {};

    // convert empty fields to empty strings to use validator functions
    address.firstLine = !isEmpty(address.firstLine) ? address.firstLine : "";
    address.townCity = !isEmpty(address.townCity) ? address.townCity : "";
    address.county = !isEmpty(address.county) ? address.county : "";
    address.postcode = !isEmpty(address.postcode) ? address.postcode : "";
    address.isBilling = !isEmpty(address.isBilling)
      ? String(address.isBilling)
      : "";
    address.isDelivery = !isEmpty(address.isDelivery)
      ? String(address.isDelivery)
      : "";

    // firstLine validation
    if (Validator.isEmpty(address.firstLine)) {
      error.firstLine = "Firstline is required";
    }
    // townCity validation
    if (Validator.isEmpty(address.townCity)) {
      error.townCity = "Town/City is required";
    }
    // county validation
    if (Validator.isEmpty(address.county)) {
      error.county = "County is required";
    }
    // postcode validation
    if (Validator.isEmpty(address.postcode)) {
      error.postcode = "Postcode is required";
    } else if (!Validator.isPostalCode(address.postcode, "GB")) {
      error.postcode = "Valid Postcode is required";
    }
    // isBilling validation
    if (Validator.isEmpty(address.isBilling)) {
      error.isBilling = "Billing flag is required";
    } else if (!Validator.isBoolean(address.isBilling)) {
      error.isBilling = "Billing flag is required";
    }
    // isDelivery validation
    if (Validator.isEmpty(address.isDelivery)) {
      error.isDelivery = "Delivery flag is required";
    } else if (!Validator.isBoolean(address.isDelivery)) {
      error.isDelivery = "Delivery flag is required";
    }

    // append address error to addresses array
    if (!isEmpty(error)) {
      addresses.push(error);
    }
  });

  // append addresses array to errors
  if (!isEmpty(addresses)) {
    errors.addresses = addresses;
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.updateCart = async function (data) {
  let errors = {};
  let cart = [];

  for await (const item of data.cart) {
    // data.cart.forEach(async item => {
    let error = {};
    // convert empty fields to empty strings to use validator functions
    item.quantity = !isEmpty(item.quantity) ? String(item.quantity) : "";
    item.product = !isEmpty(item.product) ? item.product : "";

    // product validation
    if (Validator.isEmpty(item.product)) {
      error.product = "Product is required";
    } else if (!mongoose.Types.ObjectId.isValid(item.product)) {
      error.product = "Product is not a valid id";
    } else if (!(await Product.exists({ _id: item.product }))) {
      error.product = "Product does not exist";
    }

    // quantity validation
    if (Validator.isEmpty(item.quantity)) {
      error.quantity = "Quantity is required";
    } else if (!Validator.isNumeric(item.quantity)) {
      error.quantity = "Quantity should be a number";
    } else if (Validator.equals(item.quantity, "0")) {
      error.quantity = "Quantity should be greater than 0";
    }

    // append address error to addresses array
    if (!isEmpty(error)) {
      error._id = item.product;
      cart.push(error);
    }
  }

  // append addresses array to errors
  if (!isEmpty(cart)) {
    errors.cart = cart;
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.createOrder = function (data, cart, addresses) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  cart = !isEmpty(cart) ? cart : [];
  data.shippingAddress = !isEmpty(data.shippingAddress)
    ? data.shippingAddress
    : "";
  data.billingAddress = !isEmpty(data.billingAddress)
    ? data.billingAddress
    : "";
  data.isGift = !isEmpty(data.isGift) ? String(data.isGift) : "";
  data.deliveryType = !isEmpty(data.deliveryType) ? data.deliveryType : "";

  // cart validation
  if (cart.length === 0) {
    errors.cart = "Cart cannot be empty";
  } else {
    cart.forEach((item) => {
      if (item.quantity > item.product.stock) {
        if (!Array.isArray(errors.cart)) {
          errors.cart = [];
        }
        errors.cart.push({ _id: item._id, quantity: "Not enough stock" });
      }
    });
  }

  // shippingAddress validation
  if (
    !addresses.some(
      (address) =>
        String(address._id) === data.shippingAddress &&
        address.isDelivery === true
    )
  ) {
    errors.shippingAddress = "Address is not a valid shipping address";
  }

  // billingAddress validation
  if (
    !addresses.some(
      (address) =>
        String(address._id) === data.billingAddress &&
        address.isBilling === true
    )
  ) {
    errors.billingAddress = "Address is not a valid billing address";
  }

  // isGift validation
  if (Validator.isEmpty(data.isGift)) {
    errors.isGift = "Gift flag is required";
  } else if (!Validator.isBoolean(data.isGift)) {
    errors.isGift = "Gift flag is required";
  }

  // deliveryType validation
  if (Validator.isEmpty(data.deliveryType)) {
    errors.deliveryType = "Delivery type is required";
  } else if (!Validator.isIn(data.deliveryType, ["economy", "priority"])) {
    errors.deliveryType = "Delivery type should be valid";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.rateProduct = async function (data, user) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.product = !isEmpty(data.product) ? data.product : "";
  data.rating = !isEmpty(data.rating) ? String(data.rating) : "";

  // product validation
  if (Validator.isEmpty(data.product)) {
    errors.product = "Product is required";
  } else if (!mongoose.Types.ObjectId.isValid(data.product)) {
    errors.product = "Product is not a valid id";
  } else if (!(await Product.exists({ _id: data.product }))) {
    errors.product = "Product does not exist";
  } else if (
    await Product.exists({ _id: data.product, "ratings.user": user })
  ) {
    errors.product = "Product already rated";
  } else if (
    !(await Order.exists({ user: user, "products.product._id": data.product }))
  ) {
    errors.product = "Product not purchased";
  }

  // rating validation
  if (Validator.isEmpty(data.rating)) {
    errors.rating = "Rating is required";
  } else if (!Validator.isNumeric(data.rating)) {
    errors.rating = "Rating should be a number";
  } else if (!Validator.isInt(data.rating, { min: 1, max: 5 })) {
    errors.rating = "Rating should be between 1-5";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
