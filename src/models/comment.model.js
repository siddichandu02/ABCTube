import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video", // reference to the Video model
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User model
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
