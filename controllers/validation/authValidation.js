// authValidation.js

// require libaries and files
const Validator = require("validator");
const isEmpty = require("./common/isEmpty");

// export login validation function for use in routes
exports.login = function (data) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // email validation
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  // password validation
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must have 6 chars";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};

// export register validation function for use in routes
exports.register = function (data) {
  let errors = {};

  // convert empty fields to empty strings to use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";

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

  // password validation
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must have 6 chars";
  }

  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Password Confirmation is required";
  } else if (!Validator.isLength(data.confirmPassword, { min: 6, max: 30 })) {
    errors = "Password Confirmation must have 6 chars";
  }

  if (!Validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password and Confirm Password must match";
  }

  // return errors or valid input = True
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
