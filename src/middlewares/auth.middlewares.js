import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  // If token is not found in cookies, check the Authorization header
  // Check if token is provided
  if (!token) {
    return next(new ApiError("No token provided", 401));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return next(new ApiError("Unauthorized", 404));
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return next(new ApiError("Invalid token", 401));
  }
});
