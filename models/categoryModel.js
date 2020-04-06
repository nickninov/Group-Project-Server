// categoryModel.js

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// schema design for categories
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
  ],
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// create model from CategorySchema
const Category = mongoose.model("categories", CategorySchema);

// export model
module.exports = Category;
