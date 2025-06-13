import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model defined
import { uploadOnCloundinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
  await User.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
  };

  return res
    .status(200)
    .clearCookie("acessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError("Current password and new password are required", 400);
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new ApiError("Invalid current password", 401);
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError("All fields are required", 400);
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError("Avatar image is required", 400);
  }

  const avatar = await uploadOnCloundinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError("Failed to upload avatar image", 500);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updatecoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError("Cover image is required", 400);
  }

  const coverImage = await uploadOnCloundinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError("Failed to upload cover image", 500);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover Image updated successfully", user));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError("Username is required", 400);
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedTo: { $size: "$subscribedTo" },
      },
      isSubscribed: {
        $cond: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        email: 1,
        coverImage: 1,
        password: 0,
        refreshToken: 0,
        __v: 0,
      },
    },
  ]);

  if (!channel || channel.length === 0) {
    throw new ApiError("Channel not found", 404);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Channel profile fetched successfully", channel[0])
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
      },
    },
    {
      $unwind: "$watchHistory",
    },
    {
      $sort: { "watchHistory.watchedAt": -1 }, // Sort by watchedAt field
    },
  ]);

  if (!user || user.length === 0) {
    return res.status(404).json(new ApiError(404, "No watch history found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history fetched successfully",
        user[0].watchHistory
      )
    );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateUserAvatar,
  updatecoverImage,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getWatchHistory,
  getUserChannelProfile,
};
