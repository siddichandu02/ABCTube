import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model defined
import { uploadOnCloundinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    user.refreshToken = user.generateRefreshToken();
    user.accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError("Token generation failed", 500);
  }
};
// Implement your token generation logic here

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  const { fullname, username, email, password } = req.body;
  console.log(
    "Reached registerUser controller" + fullname,
    username,
    email,
    password
  );
  // Validate input
  if (!fullname || !username || !email || !password) {
    console.log("Reached errorr");

    throw new ApiError("All fields are required", 400);
  }

  // Simulate user creation (replace with actual database logic)
  // const existedUser = User.findOne({
  //   $or: [{ username }, { email }],
  // });
  // console.log("Existed user check:", existedUser);
  // if (existedUser) {
  //   throw new ApiError("Username or email already exists", 409);
  // }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const coverImageLocalPath = req.files?.coverimage?.[0]?.path;
  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError("Avatar and cover image are required", 400);
  }
  // const avatar = await uploadOnCloundinary(avatarLocalPath);
  // const coverImage = await uploadOnCloundinary(coverImageLocalPath);

  let avatar;
  try {
    avatar = await uploadOnCloundinary(avatarLocalPath);
  } catch (error) {
    throw new ApiError("Failed to upload avatar image", 500);
  }

  let coverImage;
  try {
    coverImage = await uploadOnCloundinary(coverImageLocalPath);
  } catch (error) {
    throw new ApiError("Failed to upload cover image", 500);
  }
  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(newUser._id);
  if (!createdUser) {
    throw new ApiError("User creation failed", 500);
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  // Login logic here
  const { email, username, password } = req.body;
  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const user = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new ApiError("Invalid password", 401);
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production}
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, "Logged in successfully", loggedInUser));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    throw new ApiError("Refresh token is required", 401);
  }
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user?.refreshToken !== refreshToken) {
      throw new ApiError("Invalid refresh token", 401);
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    return res
      .status(200)
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    throw new ApiError("Failed to refresh access token", 500);
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  //   await User.findOneAndUpdate(
  //     { refreshToken: req.cookies.refreshToken },
  //     { refreshToken: null },
  //     { new: true }
  //   );
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
