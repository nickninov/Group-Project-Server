// userModel.js

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// schema design for address
const AddressSchema = new Schema({ 
  firstLine: {
    type: String,
    required: true
  },
  secondLine: {
    type: String,
    required: true
  },
  townCity: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  },
  isBilling: Boolean,
  isDelivery: Boolean
});

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
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
