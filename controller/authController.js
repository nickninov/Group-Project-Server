// authController.js

// require libraries and files
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Require user model
const User = require("../models/userModel");

// Route for new user registration
exports.new = function(req, res) {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check if request is valid
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // Check if email already exists
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json("Email already exists");
    } else {
      // Create new user
      const newUser = new User({
        email: req.body.email,
        password: req.body.password
      });

      // Generate salt for hashing
      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.error("There was an error", err);
        else {
          // Hash submitted password and save
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) console.error("There was an error", err);
            else {
              newUser.password = hash;
              newUser.save().then(user => {
                const payload = {
                  id: user.id
                };
                // Sign and return JWT
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


// Login route
exports.update = function(req, res) {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check login request is valid
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  // Check if user exists
  User.findOne({ email }).then(user => {
    if (!user) {
      // errors = 'User not found';
      return res.status(404).json("User not found");
    }
    // Check password matches
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user.id
        };
          // Sign, set token expiry time and return JWT
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
