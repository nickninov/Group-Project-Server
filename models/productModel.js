// productModel.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// schema design for products
const ProductSchema = new Schema({
  sku: {
    type: String,
    required: true
  },
  shippingDetails: {
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    length: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      required: true
    }
  },
  stock: {
    type: Number,
    required: true
  },
  images: [
    {
      type: String,
      required: true
    }
  ],
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [String],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories"
    }
  ],
  discount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// create model from ProductSchema
const Product = mongoose.model("products", ProductSchema);

// export model
module.exports = Product;
