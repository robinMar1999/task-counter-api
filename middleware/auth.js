const config = require("config");
const jwtSecret = config.get("jwtSecret");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = async (req, res, next) => {
  if (!req.header("Authorization")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  const token = req.header("Authorization").split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ msg: "Invalid Token" });
    }
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: "Invalid Token" });
  }
};

module.exports = auth;
