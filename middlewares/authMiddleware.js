import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// Lets a request through only with a valid token from an active account.
// A deactivated or deleted account is stopped here, even while its 7-day token is still valid.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized");
  }

  req.user = await User.findById(decoded.user_id).select("-password");
  if (!req.user || req.user.isActive === false) {
    res.status(401);
    throw new Error("Your account was deleted or deactivated");
  }
  next();
});

export default protect;
