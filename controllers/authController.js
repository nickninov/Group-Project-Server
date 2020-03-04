// authController.js

// require libraries and files
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authValidation = require("./validation/authValidation.js");

// require user model
const User = require("../models/userModel");

// route for new user registration
exports.register = function(req, res) {
  // check if request is valid
  const { errors, isValid } = authValidation.register(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check if email already exists
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      // create new user
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
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
exports.login = function(req, res) {
  // check if request is valid
  const { errors, isValid } = authValidation.login(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check if user exists
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
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
        errors.password = "Incorrect Password";
        return res.status(400).json(errors);
      }
    });
  });
};
