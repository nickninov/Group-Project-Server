// authController.js

// require libraries and files
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// require user model
const User = require("../models/userModel");

// route for new user registration
exports.new = function(req, res) {

  // check if email already exists
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json("Email already exists");
    } else {
      // create new user
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
      });

      // generate salt for hashing
      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.error("There was an error", err);
        else {
          // hash submitted password and save
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) console.error("There was an error", err);
            else {
              newUser.password = hash;
              newUser.save().then(user => {
                const payload = {
                  id: user.id
                };
                // sign and return JWT
                jwt.sign(
                  payload,
                  "secret",
                  {
                    expiresIn: 3600
                  },
                  (err, token) => {
                    if (err) console.error("There is some error in token", err);
                    else {
                      res.json({
                        success: true,
                        token: `Bearer ${token}`
                      });
                    }
                  }
                );
              });
            }
          });
        }
      });
    }
  });
};

// login route
exports.update = function(req, res) {

  const email = req.body.email;
  const password = req.body.password;
  // check if user exists
  User.findOne({ email }).then(user => {
    if (!user) {
      // errors = 'User not found';
      return res.status(404).json("User not found");
    }
    // check password matches
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id
        };
        // sign, set token expiry time and return JWT
        jwt.sign(
          payload,
          "secret",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) console.error("There is some error in token", err);
            else {
              res.json({
                success: true,
                token: `Bearer ${token}`
              });
            }
          }
        );
      } else {
        // errors = 'Incorrect Password';
        return res.status(400).json("Incorrect Password");
      }
    });
  });
};
