const jwt = require("jsonwebtoken");
const User = require("../models/users.model");

async function authenticate(req, res, next) {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log(
      "🔐 Middleware DEBUG: req.user set - ID:",
      user._id,
      "Username:",
      user.username,
    );
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      console.error("JWT error:", err.message);
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("DB lookup failed:", err);
    return res.status(401).json({ message: "User not found or DB error" });
  }
}

module.exports = authenticate;
