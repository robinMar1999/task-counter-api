const express = require("express");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const errorsToString = require("../utils/errorsToString");

const User = require("../models/User");
const jwtSecret = config.get("jwtSecret");

const router = express.Router();

// create new user
router.post(
  "/register",
  [
    body("name", "name is required").not().isEmpty(),
    body("email", "Email is invalid").isEmail(),
    body("password", "password is required").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: errorsToString(errors.array()),
        });
      }
      const { name, email, password } = req.body;
      const prevEmail = await User.findOne({ email });
      if (prevEmail) {
        return res.status(409).json({ msg: "Email already exists" });
      }
      const user = new User({
        name,
        email,
        password,
      });
      console.log(user);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      console.log(user);
      await user.save();
      const payload = {
        userId: user.id,
      };
      const token = jwt.sign(payload, jwtSecret);
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error!" });
    }
  }
);

// login user
router.post(
  "/login",
  [
    body("email", "Email is invalid").isEmail(),
    body("password", "password is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: errorsToString(errors.array()),
        });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }
      const isSame = await bcrypt.compare(password, user.password);
      if (!isSame) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }
      const payload = {
        userId: user.id,
      };
      const token = jwt.sign(payload, jwtSecret);
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error!" });
    }
  }
);

module.exports = router;
