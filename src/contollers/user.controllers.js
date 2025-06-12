import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js"; // Assuming you have a User model defined
import { uploadOnCloundinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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

export { registerUser };
