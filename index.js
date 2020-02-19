// index.js

// import required libaries and files
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const config = require("./db");
const authRoutes = require("./routes/authRoutes");

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

// initialize middleware for authentication and body pasring
app.use(passport.initialize());
require("./passport")(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use Api routes in the App
app.use('/v1/auth', authRoutes);

// debug route for testing API
app.get("/", function(req, res) {
  res.send("hello");
});

// set app port
const PORT = process.env.PORT || 5000;

// start HTTP server and listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
