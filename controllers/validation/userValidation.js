// userValidation.js

// require libaries and files
const Validator = require("validator");
const isEmpty = require("./common/isEmpty");

exports.updateAcc = function(data) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";

  // email validation
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

exports.updateCart = function(data) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";

  // email validation
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors)
  };
};