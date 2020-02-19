// userModel.js

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Schema design for users
const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  addresses: [
  ],
  cart: [
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

// create model from UserSchema
const User = mongoose.model("users", UserSchema);

// export model
module.exports = User;
