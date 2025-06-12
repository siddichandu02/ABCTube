import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model defined
import { uploadOnCloundinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  const { fullname, username, email, password } = req.body;

  // Validate input
  if (!fullname || !username || !email || !password) {
    return new ApiError(400, "All fields are required", res);
  }

  // Simulate user creation (replace with actual database logic)
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return new ApiError(409, "Username or email already exists", res);
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverimage[0]?.path;

  if (!avatarLocalPath || !coverImageLocalPath) {
    return new ApiError(400, "Avatar and cover image are required", res);
  }

  const avatar = await uploadOnCloundinary(avatarLocalPath);
  const coverImage = await uploadOnCloundinary(coverImageLocalPath);

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
    return new ApiError(500, "User creation failed", res);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

export { registerUser };
