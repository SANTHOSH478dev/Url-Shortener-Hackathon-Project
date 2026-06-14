const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// SIGNUP
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      console.log("Signup Request:", req.body);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log("Validation Error:", errors.array());

        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      const userExists = await User.findOne({
        email: email.toLowerCase(),
      });

      if (userExists) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("Login Request:", req.body);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({
        email: email.toLowerCase(),
      }).select("+password");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error("Login Error:", error);

      res.status(500).json({
        message: error.message,
      });
    }
  },
);

router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
