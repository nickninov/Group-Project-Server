// orderModel.js

const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const AddressSchema = require("./common/AddressSchema");

const Schema = mongoose.Schema;

// schema design for orders
const OrderSchema = new Schema({
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  products: [
    {
      quantity: Number,
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    default: "ordered"
  },
  orderNo: Number,
  date: {
    type: Date,
    default: Date.now
  }
});
OrderSchema.plugin(AutoIncrement, { inc_field: "orderNo", start_seq: 10000 });

// create model from OrderSchema
const Order = mongoose.model("orders", OrderSchema);

// export model
module.exports = Order;
