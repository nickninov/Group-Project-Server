// index.js

// import required libaries and files
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./db");

// connect to database
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
  () => {
    console.log("Database is connected");
  },
  err => {
    console.log("Can not connect to the database" + err);
  }
);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// debug route for testing API is live
app.get("/", function(req, res) {
  res.send("hello");
});

// set app port
const PORT = process.env.PORT || 5000;

// start HTTP server and listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
