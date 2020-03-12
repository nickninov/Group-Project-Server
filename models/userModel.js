// userModel.js

const mongoose = require("mongoose");
const AddressSchema = require("./common/AddressSchema");

const Schema = mongoose.Schema;

// schema design for users
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
  addresses: [AddressSchema],
  cart: [
    {
      quantity: Number,
      product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products"
      }
    }
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
