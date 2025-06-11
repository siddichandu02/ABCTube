import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video", // reference to the Video model
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // reference to the Comment model
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet", // reference to the Tweet model
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
