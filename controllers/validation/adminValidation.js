// userValidation.js

// require libaries and files
const Validator = require("validator");
const isEmpty = require("./common/isEmpty");
const Order = require("../../models/orderModel");
const mongoose = require("mongoose");

exports.updateOrderStatus = async function (data) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.order = !isEmpty(data.order) ? data.order : "";
  data.status = !isEmpty(data.status) ? data.status : "";

  // order validation
  if (Validator.isEmpty(data.order)) {
    errors.order = "Order is required";
  } else if (!mongoose.Types.ObjectId.isValid(data.order)) {
    errors.order = "Order is not a valid id";
  } else if (!(await Order.exists({ _id: data.order }))) {
    errors.order = "Order does not exist";
  }

  // status validation
  if (Validator.isEmpty(data.status)) {
    errors.status = "Status is required";
  } else if (
    !Validator.isIn(data.status, ["ordered", "shipped", "delivered"])
  ) {
    errors.status = "Not a valid status";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
