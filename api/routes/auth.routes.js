// Route for autht
// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const userSchema = require("../models/users");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");

//Require auth middleware
const auth = require("../middlewares/auth");

//@route GET api/auth
//@desc authenticate and get user
//@acess Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await userSchema.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// User Signin
router.post("/signin-user", (req, res) => {
  let getUser;
  //Find the user return him a token
  userSchema
    .findOne({
      phonenumber: req.body.phonenumber,
    })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }
      getUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((response) => {
      if (!response) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }

      payload = {
        user: {
          phonenumber: getUser.phonenumber,
          userId: getUser._id,
        },
      };

      let jwtToken = jwt.sign(payload, "longer-secret-is-better", {
        expiresIn: "1h",
      });
      return res.status(200).json({
        token: jwtToken,
      });
    })
    .catch((err) => {
      res.status(401).json({
        message: "Authentication failed",
      });
    });
});

// Signup User
router.post(
  "/register-user",
  [
    check("phonenumber")
      .not()
      .isEmpty()
      .isLength({ min: 10 })
      .withMessage("Phone number must be atleast 10 characters long"),
    check("phonenumber", "Phonenumber is not valid").not().isEmpty(),
    check("password", "Password should be between at least 5 char long")
      .not()
      .isEmpty()
      .isLength({ min: 5 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.array());
    } else {
      bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new userSchema({
          phonenumber: req.body.phonenumber,
          password: hash,
        });

        user
          .save()
          .then((response) => {
            if (!response) {
              return res.status(401).json({
                message: "Authentication failed",
              });
            }

            //jwt payload
            payload = {
              user: {
                phonenumber: user.phonenumber,
                userId: user._id,
              },
            };
            //jwt signature
            let jwtToken = jwt.sign(payload, "longer-secret-is-better", {
              expiresIn: "1h",
            });
            //Send authorization token
            return res.status(200).json({
              token: jwtToken,
            });
          })

          .catch((error) => {
            res.status(500).json({
              error: error,
            });
            console.log(error);
          });
      });
    }
  }
);

module.exports = router;
